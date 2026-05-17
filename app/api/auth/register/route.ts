import { prisma } from "@/lib/db"
import { hashPassword, setSession } from "@/lib/auth"
import { getUserStatus } from "@/lib/subscription"

export async function POST(request: Request) {
  const { email, password, phone } = await request.json()

  if (!email && !phone) {
    return Response.json({ error: "需要邮箱或手机号" }, { status: 400 })
  }
  if (!password || password.length < 6) {
    return Response.json({ error: "密码至少6位" }, { status: 400 })
  }

  // 检查是否已存在
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return Response.json({ error: "该邮箱已注册，请直接登录" }, { status: 409 })
    }
  }
  if (phone) {
    const existing = await prisma.user.findUnique({ where: { phone } })
    if (existing) {
      return Response.json({ error: "该手机号已注册" }, { status: 409 })
    }
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email: email || null,
      phone: phone || null,
      passwordHash,
      freeMsgsLimit: 20,
    },
  })

  await setSession({ id: user.id, email: user.email, nickname: user.nickname })

  const status = await getUserStatus(user.id)

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      isPro: status.isPro,
      remaining: status.remaining,
    },
  })
}
