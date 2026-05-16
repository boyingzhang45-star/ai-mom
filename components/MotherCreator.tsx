"use client"

import { useState } from "react"

const AVATARS = [
  { id: "1", emoji: "🌸", color: "#FFF0ED", label: "温柔" },
  { id: "2", emoji: "🌺", color: "#FCE4EC", label: "热情" },
  { id: "3", emoji: "🌼", color: "#FFF8E1", label: "阳光" },
  { id: "4", emoji: "💐", color: "#F3E5F5", label: "优雅" },
  { id: "5", emoji: "🍀", color: "#E8F5E9", label: "平和" },
  { id: "6", emoji: "🌷", color: "#FCE4EC", label: "甜美" },
]

const PERSONALITIES = [
  { value: "gentle", label: "温柔慈爱", desc: "说话轻柔温暖，像一杯热牛奶" },
  { value: "cheerful", label: "开朗活泼", desc: "心态年轻，像朋友一样的妈妈" },
  { value: "intellectual", label: "知性优雅", desc: "从容睿智，温暖中带着智慧" },
]

interface MotherCreatorProps {
  onSave: (data: {
    nickname: string
    name: string
    age: number
    personality: string
    avatarUrl: string
    familyDescription: string
  }) => void
  saving?: boolean
  initialData?: {
    nickname?: string
    name?: string
    age?: number
    personality?: string
    avatarUrl?: string
    familyDescription?: string
  }
}

export default function MotherCreator({ onSave, saving, initialData }: MotherCreatorProps) {
  const [step, setStep] = useState(1)
  const [nickname, setNickname] = useState(initialData?.nickname || "")
  const [name, setName] = useState(initialData?.name || "")
  const [age, setAge] = useState(initialData?.age || 45)
  const [personality, setPersonality] = useState(initialData?.personality || "gentle")
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || AVATARS[0].emoji)
  const [familyDescription, setFamilyDescription] = useState(initialData?.familyDescription || "")

  const handleSubmit = () => {
    if (!nickname.trim()) return
    if (!name.trim()) return
    onSave({
      nickname: nickname.trim(),
      name: name.trim(),
      age,
      personality,
      avatarUrl,
      familyDescription: familyDescription.trim(),
    })
  }

  return (
    <div className="flex flex-col h-full">
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          <img src="/images/logo.jpg" alt="" className="w-24 h-24 mb-6 object-contain mix-blend-multiply" />
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">创建你的 AI 母亲</h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            她会一直陪伴你、关心你、记住你说的每一件事
          </p>

          <div className="w-full max-w-xs space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">妈妈怎么称呼你？</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="如：小明、宝贝"
                className="w-full px-4 py-3 rounded-xl border border-[#F0E4DB] bg-[#FFF8F5] text-gray-800 text-sm focus:outline-none focus:border-[#E8998B] placeholder-gray-400"
              />
            </div>
            <button
              onClick={() => nickname.trim() && setStep(2)}
              disabled={!nickname.trim()}
              className="w-full py-3 rounded-xl bg-[#E8998B] text-white font-medium hover:bg-[#D48275] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              继续
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col px-8 py-12 overflow-y-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">设定母亲角色</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">母亲的名字</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="如：李妈妈"
                className="w-full px-4 py-3 rounded-xl border border-[#F0E4DB] bg-[#FFF8F5] text-gray-800 text-sm focus:outline-none focus:border-[#E8998B]"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">母亲的年龄</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={35}
                  max={65}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="flex-1 accent-[#E8998B]"
                />
                <span className="text-sm text-gray-700 w-12 text-right">{age}岁</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-3">母亲的性格</label>
              <div className="space-y-2">
                {PERSONALITIES.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPersonality(p.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      personality === p.value
                        ? "border-[#E8998B] bg-[#FFF8F5]"
                        : "border-[#F0E4DB] bg-white hover:bg-[#FFF3F0]"
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-800">{p.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-3">母亲的头像</label>
              <div className="grid grid-cols-6 gap-3">
                {AVATARS.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setAvatarUrl(a.emoji)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                      avatarUrl === a.emoji
                        ? "ring-2 ring-[#E8998B] ring-offset-2 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: a.color }}
                    title={a.label}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                家庭现状 <span className="text-gray-400 font-normal">（可选）</span>
              </label>
              <textarea
                value={familyDescription}
                onChange={(e) => setFamilyDescription(e.target.value)}
                placeholder="如：妈妈是退休教师，和爸爸住在老家，孩子在外地工作..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#F0E4DB] bg-[#FFF8F5] text-gray-800 text-sm focus:outline-none focus:border-[#E8998B] placeholder-gray-400 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-[#F0E4DB] bg-white text-gray-600 font-medium hover:bg-gray-50 transition-colors"
              >
                上一步
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || saving}
                className="flex-1 py-3 rounded-xl bg-[#E8998B] text-white font-medium hover:bg-[#D48275] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? "创建中..." : "创建母亲"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
