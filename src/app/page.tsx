import { getAllPosts } from '@/lib/posts'
import PostCard from '@/components/PostCard'
import AdUnit from '@/components/AdUnit'

export default function HomePage() {
  const posts = getAllPosts()

  return (
    <div>
      <AdUnit position="top" />
      <h1 className="text-3xl font-bold mb-8">최신 건강 정보</h1>
      {posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">아직 글이 없습니다.</p>
          <p className="text-sm mt-2">자동 생성 스크립트를 실행하면 글이 채워집니다.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {posts.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
