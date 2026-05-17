"use client"

import { useState, useEffect } from "react"

interface UserItem {
  id: string
  nickname: string
  motherName: string
  isPro: boolean
  freeUsed: number
  freeLimit: number
  totalMsgs: number
  createdAt: string
}

export default function AdminPage() {
  const [secret, setSecret] = useState("")
  const [loggedIn, setLoggedIn] = useState(false)
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(false)

  const loadUsers = async (s: string) => {
    setLoading(true)
    const res = await fetch(`/api/admin/users?secret=${s}`)
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  const handleLogin = () => {
    loadUsers(secret).then(() => setLoggedIn(true))
  }

  const handleActivate = async (userId: string) => {
    await fetch("/api/admin/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, secret }),
    })
    loadUsers(secret)
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center">
        <div className="w-80 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">管理后台</h2>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="输入管理密钥"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm mb-4 focus:outline-none focus:border-[#E8998B]"
          />
          <button
            onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-[#E8998B] text-white font-medium text-sm"
          >
            进入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] max-w-lg mx-auto p-6">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">用户管理</h1>

      {loading ? (
        <p className="text-gray-400 text-sm">加载中...</p>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white rounded-xl p-4 border border-[#F0E4DB]"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium text-sm text-gray-800">{u.nickname}</span>
                  <span className="text-xs text-gray-400 ml-2">→ {u.motherName}</span>
                </div>
                {u.isPro ? (
                  <span className="text-xs bg-[#E8998B] text-white px-2 py-0.5 rounded-full">Pro</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">免费</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mb-3">
                免费额度 {u.freeUsed}/{u.freeLimit} · 总消息 {u.totalMsgs}
              </div>
              {!u.isPro && (
                <button
                  onClick={() => handleActivate(u.id)}
                  className="w-full py-2 rounded-lg bg-[#E8998B] text-white text-xs font-medium hover:bg-[#D48275] transition-colors"
                >
                  开通 Pro（19元/月）
                </button>
              )}
            </div>
          ))}

          {users.length === 0 && (
            <p className="text-gray-400 text-sm text-center">暂无用户</p>
          )}
        </div>
      )}
    </div>
  )
}
