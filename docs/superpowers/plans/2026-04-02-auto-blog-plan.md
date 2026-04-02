# 헬스 블로그 완전 자동화 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 매일 자동으로 SEO 최적화 포스트를 생성·배포하고, 쿠팡 파트너스·구글 애드센스로 수익화하며, 텔레그램으로 발행 알림을 받는 완전 자동화 블로그 구축

**Architecture:** GitHub Actions가 매일 오전 9시(KST)에 pytrends로 키워드를 수집하고, GPT-4o-mini로 SEO 최적화 포스트를 생성한 뒤 GitHub에 커밋한다. Vercel이 커밋을 감지해 자동 배포하며, 완료 시 텔레그램으로 알림을 전송한다. Next.js App Router의 sitemap/robots 기능과 JSON-LD 구조화 데이터로 SEO를 강화한다.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Python 3.11, OpenAI GPT-4o-mini, pytrends, GitHub Actions, Vercel, Telegram Bot API

---

## 변경 파일 목록

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/app/sitemap.ts` | 신규 생성 | 포스트 목록 기반 sitemap.xml 자동 생성 |
| `src/app/robots.ts` | 신규 생성 | robots.txt 생성 |
| `src/app/posts/[slug]/page.tsx` | 수정 | JSON-LD Article 구조화 데이터 추가 |
| `src/app/layout.tsx` | 수정 | 구글 애드센스 스크립트 삽입 |
| `src/components/AdUnit.tsx` | 수정 | 실제 애드센스 광고 단위 코드 |
| `scripts/generate.py` | 수정 | pytrends + GPT-4o-mini + 쿠팡 링크 + 텔레그램 |
| `scripts/requirements.txt` | 수정 | openai, pytrends, requests 추가 |
| `scripts/coupang_links.json` | 신규 생성 | 키워드별 쿠팡 파트너스 링크 매핑 |
| `.github/workflows/daily.yml` | 수정 | OPENAI_API_KEY + 텔레그램 알림 단계 추가 |

---

## Task 1: SEO — sitemap.xml 자동 생성

**Files:**
- Create: `src/app/sitemap.ts`

- [ ] **Step 1: sitemap.ts 파일 생성**

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const baseUrl = 'https://health-blog-flax.vercel.app'

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/posts/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postEntries,
  ]
}
```

- [ ] **Step 2: 로컬에서 확인**

```bash
npm run build
```

빌드 후 `.next/server/app/sitemap.xml` 파일이 생성되는지 확인. 오류 없이 빌드 완료되면 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/app/sitemap.ts
git commit -m "feat: sitemap.xml 자동 생성 추가"
```

---

## Task 2: SEO — robots.txt 생성

**Files:**
- Create: `src/app/robots.ts`

- [ ] **Step 1: robots.ts 파일 생성**

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://health-blog-flax.vercel.app/sitemap.xml',
  }
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build
```

오류 없이 빌드되면 성공.

- [ ] **Step 3: 커밋**

```bash
git add src/app/robots.ts
git commit -m "feat: robots.txt 생성 추가"
```

---

## Task 3: SEO — JSON-LD 구조화 데이터 추가

**Files:**
- Modify: `src/app/posts/[slug]/page.tsx`

- [ ] **Step 1: 현재 파일 내용 확인**

`src/app/posts/[slug]/page.tsx` 를 열어 현재 구조 파악.

- [ ] **Step 2: JSON-LD 추가**

`src/app/posts/[slug]/page.tsx` 의 `PostPage` 함수를 아래와 같이 수정:

```typescript
import { getPostBySlug, getAllPosts } from '@/lib/posts'
import { MDXRemote } from 'next-mdx-remote/rsc'
import AdUnit from '@/components/AdUnit'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map(post => ({ slug: post.slug }))
}

export default function PostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: '건강 & 다이어트 가이드',
    },
    publisher: {
      '@type': 'Organization',
      name: '건강 & 다이어트 가이드',
      url: 'https://health-blog-flax.vercel.app',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://health-blog-flax.vercel.app/posts/${post.slug}`,
    },
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="text-3xl font-bold mb-2">{post.title}</h1>
      <p className="text-gray-400 text-sm mb-6">{post.date}</p>
      <AdUnit position="top" />
      <div className="prose prose-lg max-w-none mt-8">
        <MDXRemote source={post.content} />
      </div>
      <AdUnit position="bottom" />
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
        이 글에는 쿠팡 파트너스 제휴 링크가 포함되어 있으며, 구매 시 수수료를 받을 수 있습니다.
      </div>
    </article>
  )
}
```

- [ ] **Step 3: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 4: 커밋**

```bash
git add src/app/posts/[slug]/page.tsx
git commit -m "feat: JSON-LD 구조화 데이터 추가"
```

---

## Task 4: 구글 애드센스 설정

> **주의:** 애드센스 Publisher ID는 구글 애드센스 승인 후 발급됩니다. 포스트 10~20개가 쌓인 후 신청하세요. 지금은 코드 구조만 준비합니다.

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/AdUnit.tsx`

- [ ] **Step 1: AdUnit 컴포넌트 현재 내용 확인**

`src/components/AdUnit.tsx` 파일을 열어 현재 구조 파악.

- [ ] **Step 2: AdUnit 컴포넌트 업데이트**

```typescript
// src/components/AdUnit.tsx
interface AdUnitProps {
  position: 'top' | 'bottom' | 'middle'
}

export default function AdUnit({ position }: AdUnitProps) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

  if (!publisherId) {
    // 애드센스 미승인 상태 — 빈 공간으로 처리
    return null
  }

  return (
    <div className={`ad-unit ad-unit-${position} my-4`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot="auto"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
```

- [ ] **Step 3: layout.tsx에 애드센스 스크립트 추가**

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '건강 & 다이어트 가이드',
    template: '%s | 건강 & 다이어트 가이드',
  },
  description: '보충제, 다이어트, 건강 관련 최신 정보를 제공합니다.',
  openGraph: {
    siteName: '건강 & 다이어트 가이드',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

  return (
    <html lang="ko">
      <head>
        {publisherId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="bg-white text-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <header className="mb-10">
            <a href="/" className="text-2xl font-bold text-blue-700 hover:opacity-80">
              건강 &amp; 다이어트 가이드
            </a>
            <p className="text-gray-500 mt-1 text-sm">
              보충제 · 다이어트 · 건강 정보 모음
            </p>
          </header>
          <main>{children}</main>
          <footer className="mt-16 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
            © 2026 건강 &amp; 다이어트 가이드 · 본 사이트는 쿠팡 파트너스 활동의 일환으로 수수료를 제공받을 수 있습니다.
          </footer>
        </div>
      </body>
    </html>
  )
}
```

- [ ] **Step 4: 빌드 확인**

```bash
npm run build
```

- [ ] **Step 5: 커밋**

```bash
git add src/app/layout.tsx src/components/AdUnit.tsx
git commit -m "feat: 구글 애드센스 코드 구조 추가 (Publisher ID 설정 시 활성화)"
```

---

## Task 5: 쿠팡 파트너스 링크 매핑 테이블 생성

**Files:**
- Create: `scripts/coupang_links.json`

> **주의:** 아래 URL의 `YOUR_COUPANG_ID` 부분을 실제 쿠팡 파트너스 ID로 교체해야 합니다. 쿠팡 파트너스(partners.coupang.com)에서 가입 후 발급받으세요.

- [ ] **Step 1: 쿠팡 링크 매핑 파일 생성**

```json
// scripts/coupang_links.json
{
  "단백질 보충제": "https://coupa.ng/단백질보충제검색링크",
  "헬스 보충제": "https://coupa.ng/헬스보충제검색링크",
  "다이어트 식품": "https://coupa.ng/다이어트식품검색링크",
  "저칼로리 식품": "https://coupa.ng/저칼로리식품검색링크",
  "오메가3": "https://coupa.ng/오메가3검색링크",
  "비타민": "https://coupa.ng/비타민검색링크",
  "콜라겐": "https://coupa.ng/콜라겐검색링크",
  "프로바이오틱스": "https://coupa.ng/프로바이오틱스검색링크",
  "크레아틴": "https://coupa.ng/크레아틴검색링크",
  "BCAA": "https://coupa.ng/BCAA검색링크",
  "글루타민": "https://coupa.ng/글루타민검색링크",
  "마그네슘": "https://coupa.ng/마그네슘검색링크",
  "아연": "https://coupa.ng/아연검색링크",
  "철분": "https://coupa.ng/철분검색링크",
  "루테인": "https://coupa.ng/루테인검색링크",
  "헬스 용품": "https://coupa.ng/헬스용품검색링크",
  "요가 매트": "https://coupa.ng/요가매트검색링크",
  "덤벨": "https://coupa.ng/덤벨검색링크",
  "닭가슴살": "https://coupa.ng/닭가슴살검색링크",
  "단백질 바": "https://coupa.ng/단백질바검색링크"
}
```

> **링크 생성 방법:** 쿠팡 파트너스(partners.coupang.com) 로그인 → [링크 생성] → 원하는 상품 검색 → 링크 복사 → 위 JSON의 URL 교체

- [ ] **Step 2: 커밋**

```bash
git add scripts/coupang_links.json
git commit -m "feat: 쿠팡 파트너스 키워드-링크 매핑 테이블 추가"
```

---

## Task 6: generate.py 전면 업그레이드

**Files:**
- Modify: `scripts/generate.py`
- Modify: `scripts/requirements.txt`

- [ ] **Step 1: requirements.txt 업데이트**

```
openai==1.51.0
pytrends==4.9.2
python-dotenv==1.0.1
requests==2.31.0
pytest==8.2.0
```

- [ ] **Step 2: generate.py 전면 교체**

```python
# scripts/generate.py
import os
import json
import datetime
import re
import time
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env.local")

OPENAI_API_KEY: str = os.environ.get("OPENAI_API_KEY", "")
TELEGRAM_BOT_TOKEN: str = os.environ.get("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID: str = os.environ.get("TELEGRAM_CHAT_ID", "")

POSTS_DIR = Path(__file__).parent.parent / "posts"
USED_KEYWORDS_FILE = Path(__file__).parent.parent / "used_keywords.json"
COUPANG_LINKS_FILE = Path(__file__).parent / "coupang_links.json"

HEALTH_KEYWORDS = [
    "단백질 보충제 추천",
    "다이어트 식단 방법",
    "오메가3 효능",
    "비타민D 부족 증상",
    "콜라겐 효능 및 부작용",
    "프로바이오틱스 효과",
    "크레아틴 복용법",
    "BCAA 효능",
    "마그네슘 결핍 증상",
    "루테인 눈 건강",
    "닭가슴살 다이어트",
    "간헐적 단식 방법",
    "저탄수화물 다이어트",
    "복부지방 빼는 방법",
    "근육 증가 식단",
    "헬스 초보 운동법",
    "유산소 운동 효과",
    "스쿼트 올바른 자세",
    "수면 개선 방법",
    "면역력 높이는 음식",
]


def load_used_keywords() -> list[str]:
    if USED_KEYWORDS_FILE.exists():
        with open(USED_KEYWORDS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_used_keywords(used: list[str]) -> None:
    with open(USED_KEYWORDS_FILE, "w", encoding="utf-8") as f:
        json.dump(used, f, ensure_ascii=False, indent=2)


def load_coupang_links() -> dict[str, str]:
    if COUPANG_LINKS_FILE.exists():
        with open(COUPANG_LINKS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def get_trending_keyword(used: list[str]) -> str:
    """pytrends로 건강 트렌드 키워드 수집 후 미사용 키워드 선택."""
    try:
        from pytrends.request import TrendReq

        pytrends = TrendReq(hl="ko", tz=540)
        pytrends.build_payload(
            ["단백질 보충제", "다이어트", "건강 보조제", "헬스", "비타민"],
            cat=0,
            timeframe="now 7-d",
            geo="KR",
        )
        related = pytrends.related_queries()

        trending_keywords = []
        for _, data in related.items():
            if data and data.get("top") is not None:
                top_queries = data["top"]["query"].tolist()[:5]
                trending_keywords.extend(top_queries)

        available = [k for k in trending_keywords if k not in used]
        if available:
            print(f"pytrends 키워드 수집 성공: {len(available)}개 사용 가능")
            return available[0]

    except Exception as e:
        print(f"pytrends 실패 (폴백 사용): {e}")

    # 폴백: 내장 키워드 목록에서 선택
    available = [k for k in HEALTH_KEYWORDS if k not in used]
    if not available:
        save_used_keywords([])
        available = HEALTH_KEYWORDS
    return available[0]


def build_seo_prompt(keyword: str) -> str:
    return f"""당신은 구글 SEO 전문가이자 건강·다이어트 콘텐츠 작성자입니다.
키워드 "{keyword}"로 구글 검색 1페이지에 노출될 수 있는 SEO 최적화 블로그 글을 작성하세요.

## SEO 필수 요건 (모두 충족해야 함)
- E-E-A-T 원칙: 경험(Experience), 전문성(Expertise), 권위(Authoritativeness), 신뢰(Trustworthiness) 반영
- 검색 의도 분석: 정보형/비교형/구매형 검색 의도를 파악하고 맞춤 구성
- 키워드 배치: 제목, 첫 문단, 소제목, 결론에 자연스럽게 배치
- 본문 길이: 2000자 이상 (한국어 기준)
- 구조: 서론 → 핵심 정보 5가지 → 선택 기준 → FAQ 3개 → 결론
- FAQ 섹션: 실제 구글 '사람들이 묻는 질문(PAA)' 형태로 3개 작성
- 가독성: ##, ### 헤더, 표, 목록 적극 활용

## 응답 형식 (JSON만, 다른 텍스트 없이)
{{
  "title": "SEO 최적화 제목 (45자 이내, 키워드 포함)",
  "description": "메타 description (120자 이내, 키워드 포함, 클릭 유도)",
  "content": "마크다운 본문 (2000자 이상)"
}}"""


def generate_content(keyword: str) -> dict:
    from openai import OpenAI

    client = OpenAI(api_key=OPENAI_API_KEY)

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": build_seo_prompt(keyword)}
        ],
        temperature=0.7,
        max_tokens=4000,
    )

    text = response.choices[0].message.content.strip()
    text = re.sub(r"^```(?:json)?\n?", "", text)
    text = re.sub(r"\n?```$", "", text)

    return json.loads(text)


def insert_coupang_links(content: str, keyword: str, coupang_links: dict[str, str]) -> str:
    """본문에 쿠팡 파트너스 링크 섹션 추가."""
    relevant_links = []

    for link_keyword, url in coupang_links.items():
        if any(word in keyword for word in link_keyword.split()) or \
           any(word in content for word in link_keyword.split()):
            relevant_links.append((link_keyword, url))
        if len(relevant_links) >= 4:
            break

    if not relevant_links:
        return content

    coupang_section = "\n\n---\n\n## 관련 상품 보기 (쿠팡)\n\n"
    for link_keyword, url in relevant_links:
        coupang_section += f"- [{link_keyword} 최저가 보기 →]({url})\n"
    coupang_section += "\n> 이 링크는 쿠팡 파트너스 제휴 링크입니다. 구매 시 일정 수수료를 받을 수 있습니다.\n"

    return content + coupang_section


def save_post(keyword: str, result: dict, coupang_links: dict[str, str]) -> str:
    today = datetime.date.today().isoformat()
    slug = keyword.lower().replace(" ", "-")
    slug = re.sub(r"[^a-z0-9가-힣-]", "", slug)
    filename = f"{today}-{slug}.mdx"

    content_with_links = insert_coupang_links(result["content"], keyword, coupang_links)

    mdx_content = f"""---
title: "{result['title']}"
date: "{today}"
description: "{result['description']}"
keywords: ["{keyword}"]
---

{content_with_links}
"""

    POSTS_DIR.mkdir(exist_ok=True)
    filepath = POSTS_DIR / filename
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(mdx_content)

    print(f"저장 완료: {filepath}")
    return filename


def send_telegram_notification(title: str, keyword: str, filename: str) -> None:
    """텔레그램으로 발행 완료 알림 전송."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("텔레그램 설정 없음 — 알림 건너뜀")
        return

    import requests

    today = datetime.date.today().isoformat()
    slug = filename.replace(".mdx", "")
    url = f"https://health-blog-flax.vercel.app/posts/{slug}"

    message = (
        f"📢 새 포스트 발행됨!\n\n"
        f"📝 제목: {title}\n"
        f"🔍 키워드: {keyword}\n"
        f"🔗 URL: {url}\n"
        f"📅 발행: {today} 09:00 KST"
    )

    response = requests.post(
        f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
        json={"chat_id": TELEGRAM_CHAT_ID, "text": message},
        timeout=10,
    )

    if response.status_code == 200:
        print("텔레그램 알림 전송 완료")
    else:
        print(f"텔레그램 알림 실패: {response.status_code}")


def main() -> None:
    if not OPENAI_API_KEY:
        print("오류: OPENAI_API_KEY 환경 변수를 설정해주세요.")
        return

    used = load_used_keywords()
    coupang_links = load_coupang_links()

    print("키워드 수집 중...")
    keyword = get_trending_keyword(used)
    print(f"선택된 키워드: {keyword}")

    print("GPT-4o-mini로 SEO 최적화 포스트 생성 중...")
    result = generate_content(keyword)

    filename = save_post(keyword, result, coupang_links)

    used.append(keyword)
    save_used_keywords(used)

    print(f"완료! 파일: {filename}")
    send_telegram_notification(result["title"], keyword, filename)


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: 로컬 테스트 (선택)**

`.env.local`에 `OPENAI_API_KEY=sk-...` 설정 후:

```bash
cd scripts
pip install -r requirements.txt
python generate.py
```

`posts/` 폴더에 새 `.mdx` 파일이 생성되면 성공.

- [ ] **Step 4: 커밋**

```bash
git add scripts/generate.py scripts/requirements.txt
git commit -m "feat: GPT-4o-mini + pytrends + 쿠팡 링크 + 텔레그램 알림으로 generate.py 업그레이드"
```

---

## Task 7: GitHub Actions 워크플로우 업데이트

**Files:**
- Modify: `.github/workflows/daily.yml`

- [ ] **Step 1: daily.yml 전면 교체**

```yaml
# .github/workflows/daily.yml
name: 매일 콘텐츠 자동 생성

on:
  schedule:
    # UTC 00:00 = KST 09:00
    - cron: '0 0 * * *'
  workflow_dispatch:

jobs:
  generate-content:
    runs-on: ubuntu-latest

    steps:
      - name: 코드 체크아웃
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Python 설치
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Python 패키지 설치
        run: pip install -r scripts/requirements.txt

      - name: 콘텐츠 생성
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          TELEGRAM_BOT_TOKEN: ${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: ${{ secrets.TELEGRAM_CHAT_ID }}
        run: python scripts/generate.py

      - name: Git 설정
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: 변경사항 커밋 및 푸시
        run: |
          git add posts/ used_keywords.json
          git diff --cached --quiet || git commit -m "feat: 자동 생성 콘텐츠 추가 $(date +'%Y-%m-%d')"
          git push
```

- [ ] **Step 2: 커밋**

```bash
git add .github/workflows/daily.yml
git commit -m "feat: GitHub Actions를 OpenAI + 텔레그램 알림으로 업데이트"
```

---

## Task 8: GitHub Secrets 설정 안내

> 이 단계는 GitHub 웹사이트에서 직접 진행합니다. 코드 변경 없음.

- [ ] **Step 1: GitHub Secrets 등록**

`https://github.com/hanjh9494/health-blog/settings/secrets/actions` 접속 후 아래 3개 등록:

| Secret 이름 | 값 | 발급처 |
|-------------|-----|--------|
| `OPENAI_API_KEY` | `sk-proj-...` | platform.openai.com → API Keys |
| `TELEGRAM_BOT_TOKEN` | `123456:ABC...` | 텔레그램 @BotFather → /newbot |
| `TELEGRAM_CHAT_ID` | `-100...` 또는 본인 ID | @userinfobot 에게 /start 전송 |

- [ ] **Step 2: 텔레그램 봇 생성 방법**

1. 텔레그램에서 `@BotFather` 검색
2. `/newbot` 명령어 전송
3. 봇 이름 입력 (예: `HealthBlogBot`)
4. 봇 username 입력 (예: `healthblog_notify_bot`)
5. 발급된 Token을 `TELEGRAM_BOT_TOKEN`으로 저장

- [ ] **Step 3: 본인 Chat ID 확인 방법**

1. 텔레그램에서 `@userinfobot` 검색
2. `/start` 전송
3. 응답받은 `Id` 값을 `TELEGRAM_CHAT_ID`로 저장

- [ ] **Step 4: 수동 실행으로 테스트**

`https://github.com/hanjh9494/health-blog/actions` 접속 → [매일 콘텐츠 자동 생성] → [Run workflow] 클릭 → 성공 확인

---

## Task 9: 전체 푸시 및 배포 확인

- [ ] **Step 1: 모든 변경사항 푸시**

```bash
git push origin main
```

- [ ] **Step 2: Vercel 배포 확인**

`https://vercel.com/hanjh9494s-projects/health-blog` 에서 빌드 성공 확인.

- [ ] **Step 3: 사이트맵 확인**

`https://health-blog-flax.vercel.app/sitemap.xml` 접속 — 포스트 목록이 XML로 나타나면 성공.

- [ ] **Step 4: robots.txt 확인**

`https://health-blog-flax.vercel.app/robots.txt` 접속 — `User-agent: *` 내용이 보이면 성공.

---

## 완료 후 체크리스트

- [ ] `sitemap.xml` 구글 서치 콘솔에 제출 (search.google.com/search-console)
- [ ] 포스트 10개 쌓이면 구글 애드센스 신청 (admob.google.com)
- [ ] 쿠팡 파트너스 가입 후 `scripts/coupang_links.json` URL 실제 링크로 교체
- [ ] Vercel 환경변수에 `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` 추가 (애드센스 승인 후)
