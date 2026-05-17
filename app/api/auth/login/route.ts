import { prisma } from "@/lib/db"
import { verifyPassword, setSession } from "@/lib/auth"
import { getUserStatus } from "@/lib/subscription"
import { rateLimit, LIMITS } from "@/lib/rate-limit"

export async function POST(request: Request) {
  // 登录限流
  const rl = rateLimit("login", LIMITS.login)
  if (!rl.allowed) {
    return Response.json({ error: "登录太频繁，请稍后再试" }, { status: 429 })
  }

  const { email, phone, password } = await request.json()

  if (!email && !phone) {
    return Response.json({ error: "需要邮箱或手机号" }, { status: 400 })
  }
  if (!password) {
    return Response.json({ error: "需要密码" }, { status: 400 })
  }

  let user
  if (email) {
    user = await prisma.user.findUnique({ where: { email } })
  } else {
    user = await prisma.user.findUnique({ where: { phone } })
  }

  if (!user || !user.passwordHash) {
    return Response.json({ error: "账号不存在，请先注册" }, { status: 401 })
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return Response.json({ error: "密码错误" }, { status: 401 })
  }

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
