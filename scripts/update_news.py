#!/usr/bin/env python3
"""Fetch public publisher RSS on the build runner; no browser proxy or API key."""
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
]
ALLOWED_HOSTS = ("bbc.com", "bbc.co.uk", "dw.com")
MAX_BYTES = 2_000_000


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
        entries.append({"title": title, "url": link, "source": source["name"],
                        "sourceId": source["id"], "publishedAt": iso(published)})
    return sorted(entries, key=lambda item: item["publishedAt"], reverse=True)


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
            entries = parse_feed(fetch(source["feed"]), source, now)
            if not entries:
                raise ValueError("no headlines in the last 7 days")
            return source, entries, None
        except Exception as error:
            return source, [], str(error)
    items, states, seen = [], [], set()
    with ThreadPoolExecutor(max_workers=3) as executor:
        for source, entries, error in executor.map(get, SOURCES):
            states.append({"id": source["id"], "name": source["name"], "url": source["url"], "feed": source["feed"], "ok": error is None})
            if error:
                print(f"RSS unavailable: {source['name']}: {error}")
            count = 0
            for entry in entries:
                key = re.sub(r"\W+", "", entry["title"]).casefold()
                if key in seen or entry["url"] in seen:
                    continue
                seen.update((key, entry["url"]))
                items.append(entry)
                count += 1
                if count >= source["limit"]:
                    break
    return sorted(items, key=lambda item: item["publishedAt"], reverse=True), states


def cached_payload(raw: dict) -> dict | None:
    if not isinstance(raw, dict) or not parse_date(str(raw.get("fetchedAt", ""))):
        return None
    source_map = {source["id"]: source for source in SOURCES}
    items = []
    for item in raw.get("items", [])[:12]:
        if not isinstance(item, dict):
            continue
        source = source_map.get(item.get("sourceId"))
        title, link, date = item.get("title"), safe_link(str(item.get("url", ""))), parse_date(str(item.get("publishedAt", "")))
        if source and isinstance(title, str) and 0 < len(title) <= 350 and link and date:
            items.append({"title": title, "url": link, "source": source["name"], "sourceId": source["id"], "publishedAt": iso(date)})
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
    if not items:
        candidates = []
        for loader in (lambda: download("https://htf100.github.io/my_web/news.json"), lambda: (ROOT / "news.json").read_bytes()):
            try:
                cached = cached_payload(json.loads(loader()))
                if cached:
                    candidates.append(cached)
            except Exception:
                pass
        if candidates:
            payload = max(candidates, key=lambda candidate: parse_date(candidate["fetchedAt"]))
        else:
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
