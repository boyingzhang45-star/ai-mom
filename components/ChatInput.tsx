"use client"

import { useState, useRef, useEffect } from "react"

interface ChatInputProps {
  onSend: (data: { text?: string; imageUrl?: string }) => void
  disabled?: boolean
  isPro?: boolean
  onImageBlocked?: () => void
}

export default function ChatInput({ onSend, disabled, isPro, onImageBlocked }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px"
    }
  }, [input])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend({ text: trimmed })
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!isPro) {
      onImageBlocked?.()
      if (fileInputRef.current) fileInputRef.current.value = ""
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("上传失败")
      const data = await res.json()
      onSend({ imageUrl: data.url })
    } catch {
      // silently fail
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex gap-2 px-4 py-3 bg-white/90 backdrop-blur-sm border-t border-[#F0E4DB]">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || uploading}
        className="shrink-0 w-10 h-10 rounded-xl bg-[#FFF8F5] border border-[#F0E4DB] text-gray-400 flex items-center justify-center hover:bg-[#FFF0ED] transition-colors disabled:opacity-50"
      >
        {uploading ? (
          <span className="text-xs">...</span>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21,15 16,10 5,21"/>
          </svg>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="跟妈妈说说话..."
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none rounded-xl px-4 py-2.5 text-sm bg-[#FFF8F5] border border-[#F0E4DB] focus:outline-none focus:border-[#E8998B] text-gray-800 placeholder-gray-400 disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        className="shrink-0 w-12 h-10 rounded-xl bg-[#E8998B] text-white font-medium text-sm flex items-center justify-center hover:bg-[#D48275] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        发送
      </button>
    </div>
  )
}
