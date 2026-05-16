import { prisma } from "@/lib/db"
import { extractMemories, getCategoryLabel } from "@/lib/memory"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")
  if (!userId) {
    return Response.json({ error: "需要 userId" }, { status: 400 })
  }

  const memories = await prisma.longTermMemory.findMany({
    where: { userId },
    orderBy: { importance: "desc" },
    take: 50,
  })

  return Response.json({
    memories: memories.map((m: { category: string }) => ({
      ...m,
      categoryLabel: getCategoryLabel(m.category),
    })),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, conversationId } = body

  if (!userId) {
    return Response.json({ error: "需要 userId" }, { status: 400 })
  }

  if (conversationId) {
    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      take: 50,
    })

    await extractMemories(
      userId,
      messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))
    )
  }

  const allMemories = await prisma.longTermMemory.findMany({
    where: { userId },
    orderBy: { importance: "desc" },
    take: 50,
  })

  return Response.json({
    memories: allMemories.map((m: { category: string }) => ({
      ...m,
      categoryLabel: getCategoryLabel(m.category),
    })),
  })
}

export async function DELETE(request: Request) {
  const body = await request.json()
  const { memoryId } = body

  if (!memoryId) {
    return Response.json({ error: "需要 memoryId" }, { status: 400 })
  }

  await prisma.longTermMemory.delete({ where: { id: memoryId } })
  return Response.json({ success: true })
}
