"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getUserId } from "@/lib/user-id"

const PERSONALITIES = [
  { value: "gentle", label: "温柔慈爱", desc: "说话轻柔温暖，像一杯热牛奶" },
  { value: "cheerful", label: "开朗活泼", desc: "心态年轻，像朋友一样的妈妈" },
  { value: "intellectual", label: "知性优雅", desc: "从容睿智，温暖中带着智慧" },
]

const AVATARS = [
  { id: "1", emoji: "🌸", color: "#FDE8E8" },
  { id: "2", emoji: "🌺", color: "#FCE4EC" },
  { id: "3", emoji: "🌼", color: "#FFF8E1" },
  { id: "4", emoji: "💐", color: "#F3E5F5" },
  { id: "5", emoji: "🍀", color: "#E8F5E9" },
  { id: "6", emoji: "🌷", color: "#FCE4EC" },
]

interface MotherData {
  name: string
  age: number
  personality: string
  avatarUrl: string | null
  familyDescription: string | null
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mother, setMother] = useState<MotherData | null>(null)
  const [name, setName] = useState("")
  const [age, setAge] = useState(45)
  const [personality, setPersonality] = useState("gentle")
  const [avatarUrl, setAvatarUrl] = useState("🌸")
  const [familyDescription, setFamilyDescription] = useState("")

  const userId = getUserId()

  useEffect(() => {
    fetch(`/api/mother?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.motherProfile) {
          const m = data.user.motherProfile
          setMother(m)
          setName(m.name)
          setAge(m.age)
          setPersonality(m.personality)
          setAvatarUrl(m.avatarUrl || "🌸")
          setFamilyDescription(m.familyDescription || "")
        }
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await fetch("/api/mother", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        nickname: "孩子",
        name,
        age,
        personality,
        avatarUrl,
        familyDescription,
      }),
    })
    setSaving(false)
    router.push("/")
  }

  if (loading) {
    return (
      <div className="h-screen bg-[#FFF5F5] flex items-center justify-center">
        <span className="text-gray-400 text-sm">加载中...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF5F5] max-w-lg mx-auto">
      <header className="flex items-center gap-4 px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-[#F0E0E0]">
        <button onClick={() => router.back()} className="text-gray-500 text-sm">
          取消
        </button>
        <h1 className="flex-1 text-center font-medium text-gray-800 text-sm">母亲设定</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-[#E8B4B8] text-sm font-medium disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </header>

      <div className="px-6 py-8 space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">{avatarUrl}</div>
          <p className="text-gray-400 text-xs">点击下方头像更换</p>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-3">头像</label>
          <div className="grid grid-cols-6 gap-3">
            {AVATARS.map((a) => (
              <button
                key={a.id}
                onClick={() => setAvatarUrl(a.emoji)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                  avatarUrl === a.emoji
                    ? "ring-2 ring-[#E8B4B8] ring-offset-2 scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: a.color }}
              >
                {a.emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">名字</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#F0E0E0] bg-white text-gray-800 text-sm focus:outline-none focus:border-[#E8B4B8]"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">年龄 · {age}岁</label>
          <input
            type="range"
            min={35}
            max={65}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full accent-[#E8B4B8]"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-3">性格</label>
          <div className="space-y-2">
            {PERSONALITIES.map((p) => (
              <button
                key={p.value}
                onClick={() => setPersonality(p.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                  personality === p.value
                    ? "border-[#E8B4B8] bg-[#FFF5F5]"
                    : "border-[#F0E0E0] bg-white hover:bg-[#FFF8F8]"
                }`}
              >
                <div className="font-medium text-sm text-gray-800">{p.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">家庭现状</label>
          <textarea
            value={familyDescription}
            onChange={(e) => setFamilyDescription(e.target.value)}
            placeholder="如：妈妈是退休教师，和爸爸住在老家..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[#F0E0E0] bg-white text-gray-800 text-sm focus:outline-none focus:border-[#E8B4B8] placeholder-gray-400 resize-none"
          />
        </div>
      </div>
    </div>
  )
}
