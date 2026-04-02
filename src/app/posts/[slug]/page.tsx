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

  return (
    <article>
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
