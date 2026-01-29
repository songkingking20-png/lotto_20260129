import textwrap
from typing import List, Dict

import requests
from bs4 import BeautifulSoup


GOOGLE_NEWS_SEARCH_URL = "https://news.google.com/rss/search"


def fetch_news(keyword: str, max_results: int = 10) -> List[Dict[str, str]]:
    """
    Fetch news items from Google News RSS for a given keyword.

    Returns a list of dicts with keys: title, link, published.
    """
    params = {
        "q": keyword,
        "hl": "ko",
        "gl": "KR",
        "ceid": "KR:ko",
    }

    resp = requests.get(GOOGLE_NEWS_SEARCH_URL, params=params, timeout=10)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "xml")
    items = soup.find_all("item")[:max_results]

    results: List[Dict[str, str]] = []
    for item in items:
        title = item.title.text if item.title else ""
        link = item.link.text if item.link else ""
        pub_date = item.pubDate.text if item.pubDate else ""
        description = item.description.text if item.description else ""
        results.append(
            {
                "title": title.strip(),
                "link": link.strip(),
                "published": pub_date.strip(),
                "description": description.strip(),
            }
        )
    return results


def summarize_item(item: Dict[str, str], max_width: int = 80) -> str:
    """
    Create a simple, human‑readable summary for a single news item.

    This does not use an LLM; it just formats and truncates the description.
    """
    title = item.get("title", "")
    desc = item.get("description", "")
    link = item.get("link", "")
    published = item.get("published", "")

    # Description from RSS often contains HTML and long text
    soup = BeautifulSoup(desc, "html.parser")
    plain_desc = soup.get_text(" ", strip=True)

    if len(plain_desc) > 300:
        plain_desc = plain_desc[:297] + "..."

    wrapped_desc = "\n".join(textwrap.wrap(plain_desc, width=max_width)) if plain_desc else "내용 없음"

    summary = f"제목: {title}\n날짜: {published}\n요약:\n{wrapped_desc}\n링크: {link}"
    return summary


def summarize_news(keyword: str, max_results: int = 10) -> List[str]:
    """
    High‑level helper: fetch news for a keyword and return list of summaries.
    """
    items = fetch_news(keyword, max_results=max_results)
    return [summarize_item(item) for item in items]


def chat_loop() -> None:
    """
    Very simple CLI chatbot loop.
    """
    print("뉴스 챗봇입니다. 키워드를 입력하면 관련 뉴스를 10개까지 찾아 요약해 드립니다.")
    print("종료하려면 'quit' 또는 'exit' 을 입력하세요.\n")

    while True:
        keyword = input("키워드: ").strip()
        if not keyword:
            continue
        if keyword.lower() in {"quit", "exit"}:
            print("종료합니다.")
            break

        print(f"\n[{keyword}] 관련 최신 뉴스 요약을 가져오는 중입니다...\n")

        try:
            summaries = summarize_news(keyword, max_results=10)
        except Exception as e:  # pragma: no cover - simple CLI error path
            print(f"뉴스를 가져오는 동안 오류가 발생했습니다: {e}")
            continue

        if not summaries:
            print("관련 뉴스를 찾지 못했습니다.\n")
            continue

        for i, summary in enumerate(summaries, start=1):
            print(f"=== 뉴스 {i} ===")
            print(summary)
            print()


if __name__ == "__main__":
    chat_loop()

