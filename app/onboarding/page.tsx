"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MotherCreator from "@/components/MotherCreator"

export default function OnboardingPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

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
      const userId = "default-user"
      const res = await fetch("/api/mother", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "创建失败")
      }

      router.push("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败，请重试")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-screen bg-[#FFF5F5] flex flex-col">
      <MotherCreator onSave={handleSave} saving={saving} />
      {error && (
        <div className="px-8 pb-4">
          <p className="text-red-500 text-sm text-center">{error}</p>
        </div>
      )}
    </div>
  )
}
