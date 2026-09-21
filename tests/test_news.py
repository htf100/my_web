import importlib.util
from datetime import datetime, timezone
from pathlib import Path
import unittest
from unittest.mock import patch
import json
import tempfile

spec = importlib.util.spec_from_file_location("update_news", Path(__file__).parents[1] / "scripts" / "update_news.py")
news = importlib.util.module_from_spec(spec)
spec.loader.exec_module(news)
NOW = datetime(2026, 9, 20, 12, tzinfo=timezone.utc)


class NewsTests(unittest.TestCase):
    def test_rss_and_rdf_dates_titles_and_links(self):
        rss = b'''<rss><channel><item><title>&lt;b&gt;World &amp; news&lt;/b&gt;</title><link>https://www.bbc.com/news/articles/one?utm_source=rss</link><pubDate>Sun, 20 Sep 2026 10:00:00 GMT</pubDate></item></channel></rss>'''
        items = news.parse_feed(rss, news.SOURCES[0], NOW)
        self.assertEqual(items[0]["title"], "World & news")
        self.assertEqual(items[0]["url"], "https://www.bbc.com/news/articles/one")
        rdf = b'''<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://purl.org/rss/1.0/" xmlns:dc="http://purl.org/dc/elements/1.1/"><item><title>World news</title><link>https://www.dw.com/zh/example/a-1?maca=rss</link><dc:date>2026-09-20T11:00:00Z</dc:date></item></rdf:RDF>'''
        self.assertEqual(news.parse_feed(rdf, news.SOURCES[1], NOW)[0]["publishedAt"], "2026-09-20T11:00:00Z")

    def test_rejects_entities_old_future_and_unsafe_urls(self):
        with self.assertRaises(ValueError):
            news.parse_feed(b'<!DOCTYPE rss [<!ENTITY bad "payload">]><rss/>', news.SOURCES[0], NOW)
        for url in ["javascript:alert(1)", "https://bbc.com.evil.test/news", "https://user:pass@bbc.com/news", "https://example.com/news"]:
            self.assertIsNone(news.safe_link(url))
        for date in ["2000-01-01T00:00:00Z", "2030-01-01T00:00:00Z", "not-a-date"]:
            xml = f'<rss><item><title>test</title><link>https://bbc.com/news/one</link><pubDate>{date}</pubDate></item></rss>'.encode()
            self.assertEqual(news.parse_feed(xml, news.SOURCES[0], NOW), [])

    def test_partial_failure_deduplication_and_cache_timestamp(self):
        def fetch(url):
            if 'dw.com' in url:
                raise TimeoutError('test timeout')
            return b'<rss><item><title>Same news</title><link>https://bbc.com/news/one</link><pubDate>2026-09-20T10:00:00Z</pubDate></item></rss>'
        with patch.object(news, 'SOURCES', news.SOURCES[:3]):
            items, sources = news.collect(NOW, fetch=fetch)
        self.assertEqual(len(items), 1)
        self.assertEqual([s['ok'] for s in sources], [True, False, True])
        cache = news.cached_payload({'fetchedAt': '2026-09-19T12:00:00Z', 'items': items})
        self.assertEqual(cache['fetchedAt'], '2026-09-19T12:00:00Z')
        self.assertEqual(cache['status'], 'cached')

    def test_finance_json_headlines_dates_and_priority(self):
        source = next(s for s in news.SOURCES if s['id'] == 'wallstreetcn')
        item = {'title': '央行发布货币政策公告', 'uri': 'https://wallstreetcn.com/livenews/123', 'display_time': NOW.timestamp(), 'score': 3}
        raw = {'code': 20000, 'data': {'items': [item,
            {**item, 'title': '', 'content_text': 'Do not republish this body'},
            {**item, 'uri': 'https://wallstreetcn.com.evil.test/story'},
            {**item, 'display_time': NOW.timestamp() + 86400}]}}
        items = news.parse_wallstreetcn(json.dumps(raw).encode(), source, NOW)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['category'], 'finance')
        self.assertEqual(items[0]['topic'], '宏观政策')
        self.assertEqual(items[0]['priority'], 3)
        self.assertTrue(items[0]['publisherImportant'])
        for raw in [[], {'code': 20000, 'data': None}, {'code': 403}]:
            with self.assertRaises(ValueError):
                news.parse_wallstreetcn(json.dumps(raw).encode(), source, NOW)

    def test_quiet_central_bank_is_not_a_failed_source(self):
        source = next(s for s in news.SOURCES if s['id'] == 'fed')
        with patch.object(news, 'SOURCES', [source]):
            items, states = news.collect(NOW, fetch=lambda url: b'<rss><channel/></rss>')
        self.assertEqual(items, [])
        self.assertTrue(states[0]['ok'])
        with self.assertRaises(ValueError):
            news.parse_feed(b'<html><body>service unavailable</body></html>', source, NOW)

    def test_finance_selection_preserves_topic_variety_and_source_limit(self):
        source = {**next(s for s in news.SOURCES if s['id'] == 'wallstreetcn'), 'limit': 5}
        titles = ['芯片企业发布财报'] * 20 + ['央行调整利率', 'ETF基金发行', '恒生指数收盘', '黄金期货上涨']
        items = [{'title': title + str(i), 'uri': f'https://wallstreetcn.com/livenews/{i}', 'display_time': NOW.timestamp() - i * 60, 'score': 1} for i, title in enumerate(titles)]
        with patch.object(news, 'SOURCES', [source]):
            selected, _ = news.collect(NOW, fetch=lambda url: json.dumps({'code': 20000, 'data': {'items': items}}).encode())
        self.assertEqual(len(selected), 5)
        self.assertEqual({item['topic'] for item in selected}, {'产业公司', '宏观政策', '基金与ETF', '全球市场', '汇率与商品'})
        self.assertEqual(selected[0]['topic'], '宏观政策')

    def test_new_source_urls_and_cache_metadata(self):
        for host in ['wallstreetcn.com', 'www.chinanews.com.cn', 'www.federalreserve.gov', 'www.ecb.europa.eu']:
            self.assertIsNotNone(news.safe_link(f'https://{host}/story'))
            self.assertIsNone(news.safe_link(f'https://{host}.evil.test/story'))
        source = next(s for s in news.SOURCES if s['id'] == 'fed')
        item = news.annotate({'title': 'FOMC statement', 'url': 'https://www.federalreserve.gov/story', 'sourceId': source['id'], 'publishedAt': news.iso(NOW)}, source)
        cache = news.cached_payload({'fetchedAt': news.iso(NOW), 'items': [item]})
        self.assertEqual(cache['items'][0]['topic'], '宏观政策')
        self.assertEqual(cache['items'][0]['category'], 'finance')
        self.assertEqual(cache['items'][0]['priority'], 3)

    def test_build_keeps_failed_financial_source_alongside_new_world_news(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            cached_item = {'title': '央行公告', 'url': 'https://www.federalreserve.gov/old', 'sourceId': 'fed', 'publishedAt': news.iso(NOW)}
            raw = {'version': 1, 'fetchedAt': news.iso(NOW), 'items': [cached_item]}
            (root / 'news.json').write_text(json.dumps(raw))
            item = news.annotate({'title': 'New world headline', 'url': 'https://bbc.com/news/new', 'sourceId': 'bbc-world', 'publishedAt': news.iso(NOW)}, news.SOURCES[2])
            states = [{'id': s['id'], 'ok': s['id'] != 'fed'} for s in news.SOURCES]
            with patch.object(news, 'ROOT', root), patch.object(news, 'datetime', wraps=datetime) as clock, patch.object(news, 'collect', return_value=([item], states)), patch.object(news, 'download', return_value=json.dumps(raw).encode()), patch('sys.argv', ['update_news.py', '--output', str(root / 'out')]):
                clock.now.return_value = NOW
                news.main()
            result = json.loads((root / 'out/news.json').read_text())
            self.assertEqual(result['status'], 'partial')
            self.assertEqual({r['sourceId'] for r in result['items']}, {'bbc-world', 'fed'})
            self.assertEqual(next(r for r in result['items'] if r['sourceId'] == 'fed')['publishedAt'], news.iso(NOW))


if __name__ == '__main__':
    unittest.main()
