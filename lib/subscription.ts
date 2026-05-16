import { prisma } from "./db"

export const FREE_MSG_LIMIT = 20
export const PRO_PRICE_MONTHLY = 1900 // 19元 = 1900分

export async function getUserStatus(userId: string) {
  let user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    user = await prisma.user.create({
      data: { id: userId, freeMsgsLimit: FREE_MSG_LIMIT },
    })
  }

  // 检查 Pro 是否过期
  if (user.subscriptionStatus === "pro" && user.subExpiresAt && user.subExpiresAt < new Date()) {
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: "free", stripeSubId: null },
    })
    user.subscriptionStatus = "free"
  }

  const isPro = user.subscriptionStatus === "pro"
  const remaining = Math.max(0, user.freeMsgsLimit - user.freeMsgsUsed)

  return {
    isPro,
    remaining,
    used: user.freeMsgsUsed,
    limit: user.freeMsgsLimit,
  }
}

export async function canSendMessage(userId: string): Promise<{
  allowed: boolean
  isPro: boolean
  remaining: number
  needUpgrade: boolean
}> {
  const status = await getUserStatus(userId)

  if (status.isPro) {
    return { allowed: true, isPro: true, remaining: Infinity, needUpgrade: false }
  }

  if (status.remaining > 0) {
    return { allowed: true, isPro: false, remaining: status.remaining, needUpgrade: false }
  }

  return { allowed: false, isPro: false, remaining: 0, needUpgrade: true }
}

export async function useMessageQuota(userId: string): Promise<void> {
  const status = await getUserStatus(userId)
  if (status.isPro) return // Pro 不限量

  await prisma.user.update({
    where: { id: userId },
    data: { freeMsgsUsed: { increment: 1 } },
  })
}

export async function canUploadImage(userId: string): Promise<boolean> {
  const status = await getUserStatus(userId)
  return status.isPro
}

export async function activatePro(userId: string, stripeSubId: string): Promise<void> {
  const expireDate = new Date()
  expireDate.setMonth(expireDate.getMonth() + 1)

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "pro",
      stripeSubId,
      subExpiresAt: expireDate,
    },
  })

  // 同步 Subscription 表
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      status: "active",
      plan: "pro_monthly",
      stripeSubId,
    },
    update: {
      status: "active",
      plan: "pro_monthly",
      stripeSubId,
    },
  })
}

export async function cancelPro(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "free",
      stripeSubId: null,
      subExpiresAt: null,
    },
  })

  await prisma.subscription.update({
    where: { userId },
    data: { status: "cancelled", plan: "free" },
  })
}
