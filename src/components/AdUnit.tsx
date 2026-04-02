'use client'

interface Props {
  position?: 'top' | 'middle' | 'bottom'
}

export default function AdUnit({ position = 'middle' }: Props) {
  // 애드센스 심사 승인 후 아래 주석을 해제하고 실제 코드로 교체
  // <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
  // <ins class="adsbygoogle" data-ad-client="ca-pub-XXXXX" data-ad-slot="XXXXX"></ins>
  return (
    <div
      className="my-6 p-4 bg-gray-50 border border-dashed border-gray-300 text-center text-gray-400 text-sm rounded"
      data-position={position}
    >
      광고 영역 — 애드센스 심사 통과 후 활성화
    </div>
  )
}
