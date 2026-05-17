"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email.includes("@")) {
      setError("请输入有效的邮箱")
      return
    }
    if (password.length < 6) {
      setError("密码至少6位")
      return
    }
    if (password !== confirm) {
      setError("两次密码不一致")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push("/")
    } catch (e) {
      setError(e instanceof Error ? e.message : "注册失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF7F0] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <img src="/images/logo.jpg" alt="" className="w-64 h-64 mb-6 object-contain mix-blend-multiply mx-auto" />
          <h1 className="text-xl font-semibold text-gray-800 mb-2">
            让她真正记住你。
          </h1>
          <p className="text-sm text-gray-400">
            从今天开始，你不用再一个人消化情绪。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2 text-center">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-[#F0E0CF] bg-white text-gray-800 text-sm focus:outline-none focus:border-[#E8927C] text-center"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2 text-center">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少6位"
              className="w-full px-4 py-3 rounded-xl border border-[#F0E0CF] bg-white text-gray-800 text-sm focus:outline-none focus:border-[#E8927C] text-center"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2 text-center">确认密码</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="再次输入密码"
              className="w-full px-4 py-3 rounded-xl border border-[#F0E0CF] bg-white text-gray-800 text-sm focus:outline-none focus:border-[#E8927C] text-center"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#E8927C] text-white font-medium text-sm hover:bg-[#D47E6A] transition-colors disabled:opacity-50"
          >
            {loading ? "注册中..." : "创建账号"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-8">
          已有账号？{" "}
          <Link href="/login" className="text-[#E8927C] underline underline-offset-2">
            登录
          </Link>
        </p>
      </div>
    </div>
  )
}
