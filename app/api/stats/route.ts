import { prisma } from "@/lib/db"

export async function GET() {
  const userCount = await prisma.motherProfile.count()
  const totalMessages = await prisma.message.count({ where: { role: "user" } })

  const users = await prisma.user.findMany({
    include: {
      motherProfile: true,
      conversations: {
        include: {
          messages: { where: { role: "user" }, orderBy: { createdAt: "asc" }, take: 1 },
        },
      },
    },
  })

  const list = await Promise.all(
    users
      .filter((u) => u.motherProfile)
      .map(async (u) => {
        const msgCount = await prisma.message.count({
          where: { conversation: { userId: u.id }, role: "user" },
        })
        return {
          nickname: u.nickname,
          motherName: u.motherProfile?.name || "未设定",
          personality: u.motherProfile?.personality || "-",
          messages: msgCount,
          remaining: Math.max(0, 50 - msgCount),
          createdAt: u.createdAt.toISOString(),
        }
      })
  )

  return Response.json({
    userCount,
    totalMessages,
    maxUsers: 10,
    maxMessages: 50,
    users: list,
  })
}
