import os
import json
import random
import datetime
import re
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env.local")

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
COUPANG_ID = os.environ.get("COUPANG_ID", "")

POSTS_DIR = Path(__file__).parent.parent / "posts"
KEYWORDS_FILE = Path(__file__).parent.parent / "keywords.json"
USED_KEYWORDS_FILE = Path(__file__).parent.parent / "used_keywords.json"


def load_keywords():
    with open(KEYWORDS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def load_used_keywords():
    if USED_KEYWORDS_FILE.exists():
        with open(USED_KEYWORDS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_used_keywords(used):
    with open(USED_KEYWORDS_FILE, "w", encoding="utf-8") as f:
        json.dump(used, f, ensure_ascii=False, indent=2)


def pick_keyword(keywords, used):
    available = [k for k in keywords if k["keyword"] not in used]
    if not available:
        save_used_keywords([])
        available = keywords
    return random.choice(available)


def generate_content(keyword):
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""당신은 건강·다이어트 전문 블로그 작성자입니다.
키워드 "{keyword}"에 대한 블로그 글을 작성해주세요.

요구사항:
1. 제목은 검색 최적화된 매력적인 제목 (40자 이내)
2. 1500자 이상의 본문
3. 서론 → 제품/방법 TOP 5 추천 → 선택 기준 → 결론 구조
4. 마크다운 형식 (##, ### 헤더, 표, 목록 활용)
5. 각 추천 항목에 가격 정보 포함

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{{
  "title": "글 제목",
  "description": "글 요약 (100자 이내)",
  "content": "마크다운 본문"
}}"""

    response = model.generate_content(prompt)
    text = response.text.strip()

    # 코드블록 제거
    text = re.sub(r"^```(?:json)?\n?", "", text)
    text = re.sub(r"\n?```$", "", text)

    return json.loads(text)


def save_post(keyword, result):
    today = datetime.date.today().isoformat()
    slug = keyword.lower().replace(" ", "-")
    slug = re.sub(r"[^a-z0-9가-힣-]", "", slug)
    filename = f"{today}-{slug}.mdx"

    mdx_content = f"""---
title: "{result['title']}"
date: "{today}"
description: "{result['description']}"
keywords: ["{keyword}"]
---

{result['content']}
"""

    POSTS_DIR.mkdir(exist_ok=True)
    filepath = POSTS_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(mdx_content)

    print(f"저장 완료: {filepath}")
    return filename


def main():
    if not GEMINI_API_KEY:
        print("오류: GEMINI_API_KEY 환경 변수를 설정해주세요.")
        print("Google AI Studio (https://aistudio.google.com)에서 무료 발급 가능합니다.")
        return

    keywords = load_keywords()
    used = load_used_keywords()

    keyword_data = pick_keyword(keywords, used)
    keyword = keyword_data["keyword"]
    print(f"선택된 키워드: {keyword}")

    print("Gemini API로 콘텐츠 생성 중...")
    result = generate_content(keyword)
    filename = save_post(keyword, result)

    used.append(keyword)
    save_used_keywords(used)

    print(f"완료! 파일: {filename}")


if __name__ == "__main__":
    main()
