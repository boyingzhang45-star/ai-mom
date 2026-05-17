import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { getUserStatus } from "@/lib/subscription"

export async function GET() {
  const session = await getSession()
  if (!session) {
    return Response.json({ user: null })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { motherProfile: true },
  })

  if (!user) {
    return Response.json({ user: null })
  }

  const status = await getUserStatus(user.id)

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      phone: user.phone,
      nickname: user.nickname,
      hasMother: !!user.motherProfile,
      motherName: user.motherProfile?.name || null,
      isPro: status.isPro,
      remaining: status.remaining,
      used: status.used,
    },
  })
}
