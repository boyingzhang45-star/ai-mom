"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MotherCreator from "@/components/MotherCreator"
import { useUser } from "@/lib/user-id"

export default function OnboardingPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [limitReached, setLimitReached] = useState(false)
  const { userId } = useUser()

  const handleSave = async (data: {
    nickname: string
    name: string
    age: number
    personality: string
    avatarUrl: string
    familyDescription: string
  }) => {
    setSaving(true)
    setError("")

    try {
      const res = await fetch("/api/mother", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      })

      if (!res.ok) {
        const json = await res.json()
        if (json.error === "LIMIT_REACHED") {
          setLimitReached(true)
          return
        }
        throw new Error(json.error || "创建失败")
      }

      router.push("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  if (limitReached) {
    return (
      <div className="h-screen bg-[#FFF7F0] flex flex-col items-center justify-center px-8 text-center">
        <div className="text-5xl mb-6">🌸</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">内测名额已满</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          感谢你的关注。目前种子用户内测已关闭，
          <br />
          期待下次与你相遇。
        </p>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#FFF7F0] flex flex-col">
      <MotherCreator onSave={handleSave} saving={saving} />
      {error && (
        <div className="px-8 pb-4">
          <p className="text-red-500 text-sm text-center">{error}</p>
        </div>
      )}
    </div>
  )
}
