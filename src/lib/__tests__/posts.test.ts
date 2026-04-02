import { getAllPosts, getPostBySlug } from '../posts'
import fs from 'fs'

jest.mock('fs')
const mockFs = fs as jest.Mocked<typeof fs>

const SAMPLE_MDX = `---
title: "단백질 보충제 추천 TOP 5"
date: "2026-04-02"
description: "2026년 최고의 단백질 보충제를 비교합니다."
keywords: ["단백질 보충제"]
---

본문 내용입니다.`

describe('getAllPosts', () => {
  it('posts 디렉토리가 없으면 빈 배열 반환', () => {
    mockFs.existsSync.mockReturnValue(false)
    expect(getAllPosts()).toEqual([])
  })

  it('날짜 내림차순으로 정렬된 글 목록 반환', () => {
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readdirSync.mockReturnValue([
      '2026-04-01-older.mdx',
      '2026-04-02-newer.mdx',
    ] as any)
    mockFs.readFileSync.mockImplementation((filePath: any) => {
      const date = filePath.includes('2026-04-01') ? '2026-04-01' : '2026-04-02'
      return `---\ntitle: "글"\ndate: "${date}"\ndescription: "설명"\nkeywords: []\n---\n내용`
    })

    const posts = getAllPosts()
    expect(posts).toHaveLength(2)
    expect(posts[0].date).toBe('2026-04-02')
    expect(posts[1].date).toBe('2026-04-01')
  })

  it('.mdx 파일만 파싱', () => {
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readdirSync.mockReturnValue([
      '2026-04-02-post.mdx',
      'README.md',
      '.DS_Store',
    ] as any)
    mockFs.readFileSync.mockReturnValue(SAMPLE_MDX)

    const posts = getAllPosts()
    expect(posts).toHaveLength(1)
  })
})

describe('getPostBySlug', () => {
  it('존재하지 않는 slug면 null 반환', () => {
    mockFs.existsSync.mockReturnValue(false)
    expect(getPostBySlug('없는-글')).toBeNull()
  })

  it('존재하는 slug면 글 데이터 반환', () => {
    mockFs.existsSync.mockReturnValue(true)
    mockFs.readFileSync.mockReturnValue(SAMPLE_MDX)

    const post = getPostBySlug('2026-04-02-sample')
    expect(post?.title).toBe('단백질 보충제 추천 TOP 5')
    expect(post?.date).toBe('2026-04-02')
    expect(post?.content).toContain('본문 내용입니다.')
    expect(post?.slug).toBe('2026-04-02-sample')
  })
})
