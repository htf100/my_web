import importlib.util
from datetime import datetime, timezone
from pathlib import Path
import unittest

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
        items, sources = news.collect(NOW, fetch=fetch)
        self.assertEqual(len(items), 1)
        self.assertEqual([s['ok'] for s in sources], [True, False, True])
        cache = news.cached_payload({'fetchedAt': '2026-09-19T12:00:00Z', 'items': items})
        self.assertEqual(cache['fetchedAt'], '2026-09-19T12:00:00Z')
        self.assertEqual(cache['status'], 'cached')


if __name__ == '__main__':
    unittest.main()
