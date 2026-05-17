import { prisma } from "@/lib/db"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")
  if (!userId) {
    return Response.json({ error: "需要 userId" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { motherProfile: true },
  })

  if (!user) {
    const newUser = await prisma.user.create({ data: { id: userId } })
    return Response.json({ user: { ...newUser, motherProfile: null } })
  }

  return Response.json({ user })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, name, age, personality, avatarUrl, nickname, familyDescription } = body

  if (!userId) {
    return Response.json({ error: "需要 userId" }, { status: 400 })
  }

  let user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    user = await prisma.user.create({
      data: { id: userId, nickname: nickname || "孩子" },
    })
  } else if (nickname) {
    user = await prisma.user.update({
      where: { id: userId },
      data: { nickname },
    })
  }

  const existing = await prisma.motherProfile.findUnique({ where: { userId } })
  let mother
  if (existing) {
    mother = await prisma.motherProfile.update({
      where: { userId },
      data: { name, age, personality, avatarUrl, familyDescription },
    })
  } else {
    mother = await prisma.motherProfile.create({
      data: { userId, name, age, personality, avatarUrl, familyDescription },
    })
  }

  return Response.json({ user, mother })
}
