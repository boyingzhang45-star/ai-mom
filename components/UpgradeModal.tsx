"use client"

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  remaining: number
}

export default function UpgradeModal({ isOpen, onClose, remaining }: UpgradeModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#FFF7F0] rounded-t-2xl sm:rounded-2xl p-8 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🌸</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            继续让妈妈陪着你吧。
          </h2>
          <p className="text-sm text-gray-500">
            她会一直在这里。
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 mb-6 border border-[#F0E0CF]">
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

        <div className="bg-white rounded-xl p-5 mb-6 border border-[#F0E0CF]">
          <p className="text-center text-sm font-semibold text-gray-800 mb-4">
            ¥19 / 月 · Pro 会员
          </p>

          <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-xl overflow-hidden">
            <img
              src="/images/qrcode.jpg"
              alt="收款码"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-xs text-center text-gray-400 leading-relaxed">
            微信扫码支付 19 元
            <br />
            支付后联系开通 Pro 会员
          </p>
        </div>

        <div className="space-y-2 mb-6">
          {[
            { icon: "∞", label: "无限对话" },
            { icon: "🖼️", label: "图片发送" },
            { icon: "🧠", label: "更长记忆" },
            { icon: "⚡", label: "更稳定AI人格" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3 text-sm text-gray-700 px-2">
              <span className="text-base w-6 text-center">{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

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
