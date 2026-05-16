"use client"

interface ChatBubbleProps {
  role: "user" | "mother"
  content: string
  time: string
  avatarUrl?: string | null
  imageUrl?: string | null
}

export default function ChatBubble({ role, content, time, avatarUrl, imageUrl }: ChatBubbleProps) {
  const isMother = role === "mother"

  return (
    <div className={`flex gap-3 px-4 py-2 ${isMother ? "justify-start" : "justify-end"}`}>
      {isMother && (
        <div className="w-10 h-10 rounded-full bg-[#E8B4B8] flex items-center justify-center text-white text-sm font-medium shrink-0 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            "妈"
          )}
        </div>
      )}

      <div className={`max-w-[70%] flex flex-col ${isMother ? "items-start" : "items-end"}`}>
        {imageUrl && (
          <div
            className={`mb-1 overflow-hidden rounded-xl ${
              isMother ? "rounded-tl-sm" : "rounded-tr-sm"
            }`}
          >
            <img
              src={imageUrl}
              alt=""
              className="max-w-[200px] max-h-[200px] object-cover"
              loading="lazy"
            />
          </div>
        )}
        {content && (
          <div
            className={`px-4 py-2.5 text-sm leading-relaxed break-words ${
              isMother
                ? "bg-white text-gray-800 rounded-2xl rounded-tl-sm"
                : "bg-[#95EC69] text-gray-900 rounded-2xl rounded-tr-sm"
            }`}
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}
          >
            {content}
          </div>
        )}
        <span className="text-xs text-gray-400 mt-1 px-1">{time}</span>
      </div>

      {!isMother && (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-medium shrink-0">
          我
        </div>
      )}
    </div>
  )
}
