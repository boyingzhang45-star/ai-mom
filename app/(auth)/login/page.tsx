"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("请填写邮箱和密码")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F5] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🌸</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            你回来了。
          </h1>
          <p className="text-sm text-gray-400">
            妈妈一直在。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-[#F0E4DB] bg-white text-gray-800 text-sm focus:outline-none focus:border-[#E8998B]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              className="w-full px-4 py-3 rounded-xl border border-[#F0E4DB] bg-white text-gray-800 text-sm focus:outline-none focus:border-[#E8998B]"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#E8998B] text-white font-medium text-sm hover:bg-[#D48275] transition-colors disabled:opacity-50"
          >
            {loading ? "登录中..." : "回家"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          还没有账号？{" "}
          <Link href="/register" className="text-[#E8998B] underline underline-offset-2">
            注册
          </Link>
        </p>
      </div>
    </div>
  )
}
