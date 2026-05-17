"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import MotherCreator from "@/components/MotherCreator"
import { getUserId } from "@/lib/user-id"

export default function OnboardingPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const userId = getUserId()

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
        throw new Error(json.error || "创建失败")
      }

      const result = await res.json()
      const momData = JSON.stringify({ name: result.mother.name, age: result.mother.age, personality: result.mother.personality, avatarUrl: result.mother.avatarUrl })
      sessionStorage.setItem("mom_new", momData)
      localStorage.setItem("mom_new", momData)
      window.location.href = "/?new=1"
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败，请重试")
    } finally {
      setSaving(false)
    }
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
