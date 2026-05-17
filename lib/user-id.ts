"use client"

import { useState, useEffect } from "react"

const KEY = "ai_mom_user_id"

interface AuthUser {
  id: string
  email?: string | null
  nickname?: string
  isPro?: boolean
  remaining?: number
}

function localStorageUserId(): string {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(KEY, id)
  }
  return id
}

// 优先使用登录用户 ID，否则使用 localStorage
export function useUser() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const userId = user?.id || localStorageUserId()
  const isLoggedIn = !!user?.email

  return { userId, user, loading, isLoggedIn }
}

export { localStorageUserId }
