"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ChatList from "@/components/ChatList"
import ChatInput from "@/components/ChatInput"
import UpgradeModal from "@/components/UpgradeModal"
import { useUser } from "@/lib/user-id"

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
  const [isPro, setIsPro] = useState(false)
  const [remaining, setRemaining] = useState(20)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const { userId, isLoggedIn } = useUser()
  const [authChecked, setAuthChecked] = useState(false)

  // 加载用户会员状态
  useEffect(() => {
    if (!userId) return
    setAuthChecked(true)
    fetch(`/api/user-status?userId=${userId}`)
      .then((r) => r.json())
      .then((d) => {
        setIsPro(d.isPro)
        setRemaining(d.remaining)
      })
      .catch(() => {})
  }, [userId])

  // Stripe 支付回调
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("upgrade") === "success") {
      setShowUpgrade(false)
      window.history.replaceState({}, "", "/")
      // 重新获取状态
      fetch(`/api/user-status?userId=${userId}`)
        .then((r) => r.json())
        .then((d) => {
          setIsPro(d.isPro)
          setRemaining(d.remaining)
        })
    }
  }, [userId])

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
    if (!userId) return
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
  }, [userId])

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
        if (err.needUpgrade) {
          setShowUpgrade(true)
          setSending(false)
          return
        }
        if (err.error === "LIMIT_REACHED") {
          setLimitReached(true)
          return
        }
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

  if (!authChecked) {
    return (
      <div className="h-screen bg-[#FFF7F0] flex items-center justify-center">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    )
  }

  if (!mother) {
    return (
      <div className="h-screen bg-[#FFF7F0] flex items-center justify-center">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#FFF7F0] flex flex-col max-w-lg mx-auto">
      <header className="flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-[#F0E0CF]">
        <Link href="/settings" className="shrink-0">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-2xl hover:opacity-80 transition-opacity cursor-pointer"
            style={{ backgroundColor: "#FFF0EB" }}
          >
            {mother.avatarUrl || "🌸"}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="font-medium text-gray-800 text-sm truncate">{mother.name}</h1>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
          </div>
          {isPro ? (
              <p className="text-xs text-[#E8927C] font-medium">Pro 会员</p>
            ) : (
              <p className="text-xs text-gray-400">
                剩余 {remaining} 条 ·{" "}
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="text-[#E8927C] underline underline-offset-2"
                >
                  升级
                </button>
              </p>
            )}
          </div>
        </header>

      <ChatList
        messages={messages}
        streamingContent={streamingContent}
        motherAvatar={mother.avatarUrl}
        isTyping={sending && !streamingContent}
      />

      {limitReached && (
        <div className="px-4 py-3 text-center text-sm text-[#E8927C] bg-white/90 border-t border-[#F0E0CF]">
          这次体验已经结束了，谢谢你陪她聊了这么久。
        </div>
      )}
      {!limitReached && (
        <ChatInput
          onSend={handleSend}
          disabled={sending}
          isPro={isPro}
          onImageBlocked={() => setShowUpgrade(true)}
        />
      )}

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        remaining={remaining}
      />
    </div>
  )
}
