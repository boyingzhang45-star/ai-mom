"use client"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  remaining: number
}

export default function UpgradeModal({ isOpen, onClose, remaining }: UpgradeModalProps) {
  if (!isOpen) return null

  const handleUpgrade = async () => {
    const userId = localStorage.getItem("ai_mom_user_id")
    const res = await fetch("/api/payment/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#FFF8F5] rounded-t-2xl sm:rounded-2xl p-8 animate-slide-up shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🌸</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            继续让妈妈陪着你吧。
          </h2>
          <p className="text-sm text-gray-500">
            她会一直在这里。
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 mb-6 border border-[#F0E4DB]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600">免费额度</span>
            <span className="text-sm font-medium text-red-500">
              {remaining === 0 ? "已用完" : `剩余 ${remaining} 条`}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-red-400 rounded-full transition-all"
              style={{ width: remaining === 0 ? "100%" : "60%" }}
            />
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {[
            { icon: "∞", label: "无限对话" },
            { icon: "🖼️", label: "图片发送" },
            { icon: "🧠", label: "更长记忆" },
            { icon: "🌙", label: "深夜模式" },
            { icon: "⚡", label: "更稳定AI人格" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="text-base w-6 text-center">{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleUpgrade}
          className="w-full py-3.5 rounded-xl bg-[#E8998B] text-white font-semibold text-sm hover:bg-[#D48275] transition-colors active:scale-[0.98] mb-3"
        >
          ¥19/月 · 开启更长久的陪伴
        </button>

        <button
          onClick={onClose}
          className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          暂不需要
        </button>
      </div>
    </div>
  )
}
