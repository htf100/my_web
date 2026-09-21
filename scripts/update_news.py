#!/usr/bin/env python3
"""Collect international and financial headlines from public publisher feeds."""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html import unescape
import json
from pathlib import Path
import re
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    {"id": "bbc-zh", "name": "BBC 中文", "url": "https://www.bbc.com/zhongwen",
     "feed": "https://feeds.bbci.co.uk/zhongwen/simp/rss.xml", "limit": 5},
    {"id": "dw-zh", "name": "德国之声中文", "url": "https://www.dw.com/zh/",
     "feed": "https://rss.dw.com/rdf/rss-chi-all", "limit": 5},
    {"id": "bbc-world", "name": "BBC World", "url": "https://www.bbc.com/news/world",
     "feed": "https://feeds.bbci.co.uk/news/world/rss.xml", "limit": 2},
    {"id": "wallstreetcn", "name": "华尔街见闻", "url": "https://wallstreetcn.com/live/global",
     "feed": "https://api-one.wallstcn.com/apiv1/content/lives?channel=global-channel&limit=100", "limit": 10, "category": "finance", "format": "wallstreetcn"},
    {"id": "chinanews-finance", "name": "中新网财经", "url": "https://www.chinanews.com.cn/finance/",
     "feed": "https://www.chinanews.com.cn/rss/finance.xml", "limit": 6, "category": "finance"},
    {"id": "bbc-business", "name": "BBC 商业", "url": "https://www.bbc.com/business",
     "feed": "https://feeds.bbci.co.uk/news/business/rss.xml", "limit": 3, "category": "finance"},
    {"id": "fed", "name": "美联储", "url": "https://www.federalreserve.gov/newsevents.htm",
     "feed": "https://www.federalreserve.gov/feeds/press_monetary.xml", "limit": 2, "category": "finance"},
    {"id": "ecb", "name": "欧洲央行", "url": "https://www.ecb.europa.eu/press/html/index.en.html",
     "feed": "https://www.ecb.europa.eu/rss/press.html", "limit": 2, "category": "finance"},
]
ALLOWED_HOSTS = ("bbc.com", "bbc.co.uk", "dw.com", "wallstreetcn.com", "chinanews.com.cn", "chinanews.com", "federalreserve.gov", "ecb.europa.eu")
MAX_BYTES = 2_000_000
MAX_ITEMS = 48
TOPICS = (
    ("宏观政策", r"央行|美联储|联储|降息|加息|降准|利率|货币政策|通胀|非农|失业率|关税|经贸|财政|统计局|证监会|GDP|CPI|PPI|PMI|FOMC|inflation|interest rate|monetary|economic projection|tariff|central bank", 3),
    ("基金与ETF", r"基金|ETF|公募|QDII|funds?\b", 2),
    ("全球市场", r"A股|港股|美股|沪指|沪深|创业板|科创|恒指|恒生|纳指|纳斯达克|标普|道指|股市|股指|大盘|指数|stocks?\b|shares?\b|markets?\b", 2),
    ("汇率与商品", r"人民币|汇率|外汇|美元|欧元|日元|英镑|债券|国债|美债|黄金|金价|原油|油价|期货|大宗|收益率|gold|oil\b|bonds?\b|treasur|currency|yields?\b", 2),
    ("产业公司", r"财报|营收|利润|半导体|芯片|新能源|人工智能|科技|AI\b|机器人|英伟达|苹果|微软|特斯拉|腾讯|阿里|earnings|profit|chip|nvidia|apple|tesla|microsoft", 1),
)


def annotate(entry: dict, source: dict, important: bool = False) -> dict:
    category = source.get("category", "world")
    topic, priority = ("国际", 1) if category == "world" else ("财经综合", 1)
    if category == "finance":
        for label, pattern, score in TOPICS:
            if re.search(pattern, entry["title"], flags=re.I):
                topic, priority = label, score
                break
        if source["id"] in ("fed", "ecb"):
            topic, priority = "宏观政策", 3
        if important:
            priority = 3
    return {**entry, "category": category, "topic": topic, "priority": priority,
            "publisherImportant": bool(important)}


def rank(entry: dict, now: datetime) -> tuple:
    # Recent high-impact topics first; older policy releases remain available
    # without permanently sitting above today's news.
    age = (now - parse_date(entry["publishedAt"])).total_seconds()
    return (entry.get("priority", 1) >= 3 and age <= 72 * 3600, entry["publishedAt"])


def iso(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


def parse_date(value: str) -> datetime | None:
    try:
        result = parsedate_to_datetime(value)
    except (ValueError, TypeError, OverflowError):
        try:
            result = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return None
    return result.replace(tzinfo=timezone.utc) if result.tzinfo is None else result.astimezone(timezone.utc)


def safe_link(value: str) -> str | None:
    try:
        parts = urlsplit(value.strip())
        host = parts.hostname or ""
        if parts.scheme not in ("http", "https") or parts.username or parts.password:
            return None
        if not any(host == allowed or host.endswith("." + allowed) for allowed in ALLOWED_HOSTS):
            return None
        if parts.port not in (None, 80, 443):
            return None
        query = [(k, v) for k, v in parse_qsl(parts.query) if not k.startswith("utm_") and k not in ("maca", "at_medium", "at_campaign")]
        return urlunsplit(("https", host, parts.path, urlencode(query), ""))
    except ValueError:
        return None


def parse_feed(data: bytes, source: dict, now: datetime) -> list[dict]:
    if len(data) > MAX_BYTES or b"<!DOCTYPE" in data.upper() or b"<!ENTITY" in data.upper():
        raise ValueError("unsafe or oversized RSS")
    root = ET.fromstring(data)
    if root.tag.split("}")[-1].lower() not in ("rss", "rdf", "feed"):
        raise ValueError("not an RSS or Atom document")
    entries = []
    for item in root.iter():
        if item.tag.split("}")[-1] not in ("item", "entry"):
            continue
        fields = {child.tag.split("}")[-1]: child for child in item}
        def value(name: str) -> str:
            return "".join(fields[name].itertext()).strip() if name in fields else ""
        title = re.sub(r"\s+", " ", re.sub(r"<[^>]*>", "", unescape(value("title")))).strip()
        link = value("link")
        if not link and "link" in fields:
            link = fields["link"].get("href", "")
        link = safe_link(link)
        published = parse_date(value("pubDate") or value("date") or value("published") or value("updated"))
        if not title or len(title) > 350 or not link or published is None:
            continue
        if not now - timedelta(days=7) <= published <= now + timedelta(hours=1):
            continue
        entries.append(annotate({"title": title, "url": link, "source": source["name"],
                        "sourceId": source["id"], "publishedAt": iso(published)}, source))
    return sorted(entries, key=lambda item: item["publishedAt"], reverse=True)


def parse_wallstreetcn(data: bytes, source: dict, now: datetime) -> list[dict]:
    if len(data) > MAX_BYTES:
        raise ValueError("response too large")
    raw = json.loads(data)
    if not isinstance(raw, dict) or raw.get("code") != 20000 or not isinstance(raw.get("data"), dict) or not isinstance(raw["data"].get("items"), list):
        raise ValueError("invalid publisher response")
    entries = []
    for item in raw["data"]["items"][:200]:
        if not isinstance(item, dict):
            continue
        # Use publisher-supplied headlines only; never republish story bodies.
        title = re.sub(r"\s+", " ", re.sub(r"<[^>]*>", "", unescape(str(item.get("title") or "")))).strip()
        link = safe_link(str(item.get("uri") or ""))
        try:
            published = datetime.fromtimestamp(float(item["display_time"]), timezone.utc)
        except (KeyError, TypeError, ValueError, OverflowError, OSError):
            continue
        if not title or len(title) > 350 or not link or not now - timedelta(days=7) <= published <= now + timedelta(hours=1):
            continue
        entry = annotate({"title": title, "url": link, "source": source["name"],
                          "sourceId": source["id"], "publishedAt": iso(published)}, source, item.get("score") in (2, 3))
        # General live wires also contain unrelated local/social stories.
        if entry["topic"] != "财经综合" or entry["publisherImportant"]:
            entries.append(entry)
    return entries


def download(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "HTF-Command-Desk/1.0 (+https://htf100.github.io/my_web/; RSS reader)", "Accept": "application/rss+xml, application/xml, application/json, text/xml;q=0.9"})
    with urlopen(request, timeout=20) as response:
        data = response.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise ValueError("response too large")
    return data


def collect(now: datetime, fetch=download) -> tuple[list[dict], list[dict]]:
    def get(source):
        try:
            parser = parse_wallstreetcn if source.get("format") == "wallstreetcn" else parse_feed
            entries = parser(fetch(source["feed"]), source, now)
            if not entries and source["id"] not in ("fed", "ecb"):
                raise ValueError("no usable recent headlines")
            return source, entries, None
        except Exception as error:
            return source, [], str(error)
    items, states, seen = [], [], set()
    with ThreadPoolExecutor(max_workers=6) as executor:
        for source, entries, error in executor.map(get, SOURCES):
            states.append({"id": source["id"], "name": source["name"], "url": source["url"], "feed": source["feed"], "ok": error is None})
            if error:
                print(f"RSS unavailable: {source['name']}: {error}")
            count = 0
            ranked = sorted(entries, key=lambda item: rank(item, now), reverse=True)
            # Guarantee topic variety within the busier financial sources.
            diverse, topics = [], set()
            for entry in ranked:
                if source.get("category") == "finance" and entry["topic"] not in topics:
                    diverse.append(entry); topics.add(entry["topic"])
            ordered = diverse + [entry for entry in ranked if entry not in diverse]
            for entry in ordered:
                key = re.sub(r"\W+", "", entry["title"]).casefold()
                if key in seen or entry["url"] in seen:
                    continue
                seen.update((key, entry["url"]))
                items.append(entry)
                count += 1
                if count >= source["limit"]:
                    break
    return sorted(items, key=lambda item: rank(item, now), reverse=True)[:MAX_ITEMS], states


def cached_payload(raw: dict) -> dict | None:
    if not isinstance(raw, dict) or not parse_date(str(raw.get("fetchedAt", ""))):
        return None
    source_map = {source["id"]: source for source in SOURCES}
    items = []
    if not isinstance(raw.get("items"), list):
        return None
    for item in raw["items"][:MAX_ITEMS]:
        if not isinstance(item, dict):
            continue
        source = source_map.get(item.get("sourceId"))
        title, link, date = item.get("title"), safe_link(str(item.get("url", ""))), parse_date(str(item.get("publishedAt", "")))
        if source and isinstance(title, str) and 0 < len(title) <= 350 and link and date:
            items.append(annotate({"title": title, "url": link, "source": source["name"], "sourceId": source["id"], "publishedAt": iso(date)}, source, item.get("publisherImportant") is True))
    if not items:
        return None
    return {"version": 1, "fetchedAt": raw["fetchedAt"], "items": items,
            "sources": [{**source, "ok": False} for source in SOURCES], "status": "cached"}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=ROOT)
    args = parser.parse_args()
    now = datetime.now(timezone.utc)
    items, sources = collect(now)
    payload = {"version": 1, "fetchedAt": iso(now), "items": items, "sources": sources,
               "status": "fresh" if all(source["ok"] for source in sources) else "partial"}
    if not items or any(not source["ok"] for source in sources):
        candidates = []
        for loader in (lambda: download("https://htf100.github.io/my_web/news.json"), lambda: (ROOT / "news.json").read_bytes()):
            try:
                cached = cached_payload(json.loads(loader()))
                if cached:
                    candidates.append(cached)
            except Exception:
                pass
        if candidates:
            cached = max(candidates, key=lambda candidate: parse_date(candidate["fetchedAt"]))
            if not items:
                payload = cached
            else:
                failed = {source["id"] for source in sources if not source["ok"]}
                existing = {item["url"] for item in items}
                retained = [item for item in cached["items"] if item["sourceId"] in failed and item["url"] not in existing and parse_date(item["publishedAt"]) >= now - timedelta(days=7)]
                payload["items"] = sorted(items + retained, key=lambda item: rank(item, now), reverse=True)[:MAX_ITEMS]
        elif not items:
            payload["status"] = "unavailable"
    args.output.mkdir(parents=True, exist_ok=True)
    data = json.dumps(payload, ensure_ascii=False, indent=2)
    (args.output / "news.json").write_text(data + "\n", encoding="utf-8")
    # Escape JS line separators and HTML closers even though this is an external file.
    safe_json = data.replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    (args.output / "news-data.js").write_text("// Generated RSS snapshot; refreshed by GitHub Actions.\nwindow.NEWS_FEED = " + safe_json + ";\n", encoding="utf-8")
    print(f"Headlines: {len(payload['items'])}; status: {payload['status']}; fetched: {payload['fetchedAt']}")


if __name__ == "__main__":
    main()
