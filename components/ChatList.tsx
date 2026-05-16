"use client"

import { useEffect, useRef } from "react"
import ChatBubble from "./ChatBubble"

interface Message {
  id: string
  role: "user" | "mother"
  content: string
  createdAt: string
  imageUrl?: string | null
}

interface ChatListProps {
  messages: Message[]
  streamingContent?: string
  motherAvatar?: string | null
  isTyping?: boolean
}

export default function ChatList({ messages, streamingContent, motherAvatar, isTyping }: ChatListProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamingContent])

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  return (
    <div className="flex-1 overflow-y-auto py-4">
      {messages.length === 0 && !streamingContent && (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="text-5xl mb-4">🌸</div>
          <p className="text-gray-400 text-sm">妈妈一直在，想说什么都可以</p>
        </div>
      )}
      {messages.map((msg) => (
        <ChatBubble
          key={msg.id}
          role={msg.role}
          content={msg.content}
          time={formatTime(msg.createdAt)}
          avatarUrl={msg.role === "mother" ? motherAvatar : null}
          imageUrl={msg.imageUrl}
        />
      ))}
      {isTyping && (
        <div className="flex gap-3 px-4 py-2">
          <div className="w-10 h-10 rounded-full bg-[#E8B4B8] flex items-center justify-center text-white text-sm font-medium shrink-0">
            妈
          </div>
          <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.06)" }}>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
      {streamingContent && (
        <ChatBubble
          role="mother"
          content={streamingContent}
          time="..."
          avatarUrl={motherAvatar}
        />
      )}
      <div ref={bottomRef} />
    </div>
  )
}
