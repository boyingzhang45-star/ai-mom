"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ChatList from "@/components/ChatList"
import ChatInput from "@/components/ChatInput"

interface MotherProfile {
  name: string
  age: number
  personality: string
  avatarUrl: string | null
}

interface Message {
  id: string
  role: "user" | "mother"
  content: string
  createdAt: string
  imageUrl?: string | null
}

export default function HomePage() {
  const router = useRouter()
  const [mother, setMother] = useState<MotherProfile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [streamingContent, setStreamingContent] = useState("")
  const [, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  const userId = "default-user"

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/history?userId=${userId}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        if (data.messages?.length > 0) {
          setConversationId(data.messages[0].conversationId)
        }
      }
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetch(`/api/mother?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.motherProfile) {
          setMother(data.user.motherProfile)
          loadMessages()
        } else {
          router.push("/onboarding")
        }
      })
      .catch(() => setLoading(false))
  }, [loadMessages, router, userId])

  const handleSend = async (data: { text?: string; imageUrl?: string }) => {
    if (sending) return

    const content = data.text || ""
    const imageUrl = data.imageUrl || null

    const tempId = `temp-${Date.now()}`
    const userMsg: Message = {
      id: tempId,
      role: "user",
      content,
      imageUrl,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setSending(true)
    setStreamingContent("")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          message: content || "[图片]",
          imageUrl,
          conversationId,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "发送失败")
      }

      const convId = res.headers.get("X-Conversation-Id")
      if (convId && !conversationId) {
        setConversationId(convId)
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error("无响应流")

      let fullResponse = ""
      let serverConvId = ""
      let firstLine = true

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = new TextDecoder().decode(value)
        if (firstLine) {
          const lines = chunk.split("\n")
          serverConvId = lines[0]
          if (serverConvId && !conversationId) {
            setConversationId(serverConvId)
          }
          fullResponse = chunk.substring(serverConvId.length + 1)
          firstLine = false
        } else {
          fullResponse += chunk
        }
        setStreamingContent(fullResponse)
      }

      const motherMsg: Message = {
        id: `msg-${Date.now()}`,
        role: "mother",
        content: fullResponse,
        createdAt: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, motherMsg])
      setStreamingContent("")
    } catch (e) {
      console.error("发送失败:", e)
    } finally {
      setSending(false)
    }
  }

  if (!mother) {
    return (
      <div className="h-screen bg-[#FFF5F5] flex items-center justify-center">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#FFF5F5] flex flex-col max-w-lg mx-auto">
      <header className="flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-[#F0E0E0]">
        <Link href="/settings" className="shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-2xl hover:opacity-80 transition-opacity cursor-pointer"
            style={{ backgroundColor: "#FDE8E8" }}
          >
            {mother.avatarUrl || "🌸"}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-medium text-gray-800 text-sm truncate">{mother.name}</h1>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
          </div>
          <p className="text-xs text-gray-400">在线 · {mother.age}岁</p>
        </div>
      </header>

      <ChatList
        messages={messages}
        streamingContent={streamingContent}
        motherAvatar={mother.avatarUrl}
        isTyping={sending && !streamingContent}
      />

      <ChatInput onSend={handleSend} disabled={sending} />
    </div>
  )
}
