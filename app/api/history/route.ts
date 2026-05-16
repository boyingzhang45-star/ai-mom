import { prisma } from "@/lib/db"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")
  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "50")

  if (!userId) {
    return Response.json({ error: "需要 userId" }, { status: 400 })
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 1,
  })

  if (conversations.length === 0) {
    return Response.json({ messages: [] })
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: conversations[0].id },
    orderBy: { createdAt: "asc" },
    take: limit,
  })

  return Response.json({ messages })
}
