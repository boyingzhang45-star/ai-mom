import { prisma } from "@/lib/db"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "无权限" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    where: { motherProfile: { isNot: null } },
    include: { motherProfile: true },
    orderBy: { createdAt: "desc" },
  })

  const list = await Promise.all(
    users.map(async (u) => {
      const msgCount = await prisma.message.count({
        where: { conversation: { userId: u.id }, role: "user" },
      })
      return {
        id: u.id,
        nickname: u.nickname,
        motherName: u.motherProfile?.name || "-",
        isPro: u.subscriptionStatus === "pro",
        freeUsed: u.freeMsgsUsed,
        freeLimit: u.freeMsgsLimit,
        totalMsgs: msgCount,
        createdAt: u.createdAt.toISOString(),
      }
    })
  )

  return Response.json({ users: list })
}
