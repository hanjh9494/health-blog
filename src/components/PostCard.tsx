import Link from 'next/link'
import { PostMeta } from '@/lib/posts'

interface Props {
  post: PostMeta
}

export default function PostCard({ post }: Props) {
  return (
    <article className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <Link href={`/posts/${post.slug}`}>
        <h2 className="text-xl font-bold text-blue-700 hover:underline mb-2">
          {post.title}
        </h2>
      </Link>
      <p className="text-gray-400 text-sm mb-3">{post.date}</p>
      <p className="text-gray-600 leading-relaxed">{post.description}</p>
      <Link
        href={`/posts/${post.slug}`}
        className="inline-block mt-4 text-blue-600 text-sm hover:underline"
      >
        자세히 보기 →
      </Link>
    </article>
  )
}
