import type { Metadata } from 'next'
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
  return (
    <html lang="ko">
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
