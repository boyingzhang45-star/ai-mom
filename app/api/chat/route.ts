import { prisma } from "@/lib/db"
import { streamChat } from "@/lib/ai"
import { buildSystemPrompt } from "@/lib/prompt"
import { getRelevantMemories, extractMemories } from "@/lib/memory"
import { canSendMessage, useMessageQuota } from "@/lib/subscription"
import { rateLimit, LIMITS } from "@/lib/rate-limit"
import { sanitizeInput, detectPromptInjection } from "@/lib/security"
import { log } from "@/lib/logger"

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, message, conversationId, imageUrl } = body

  if (!userId || !message) {
    return Response.json({ error: "需要 userId 和 message" }, { status: 400 })
  }

  // 限流
  const rl = rateLimit(`chat:${userId}`, LIMITS.chat)
  if (!rl.allowed) {
    return Response.json({ error: "请求太频繁，请稍后再试" }, { status: 429 })
  }

  // 输入安全检查
  const cleaned = sanitizeInput(message)
  if (cleaned.length === 0) {
    return Response.json({ error: "消息内容无效" }, { status: 400 })
  }
  if (detectPromptInjection(cleaned)) {
    return Response.json({ error: "消息内容无效" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { motherProfile: true },
  })

  if (!user?.motherProfile) {
    return Response.json(
      { error: "请先创建母亲角色" },
      { status: 400 }
    )
  }

  // 图片权限：仅 Pro 可发
  if (imageUrl && user.subscriptionStatus !== "pro") {
    return Response.json(
      { success: false, needUpgrade: true, message: "图片功能是 Pro 专属" },
      { status: 403 }
    )
  }

  // 检查额度
  const permission = await canSendMessage(userId)
  if (!permission.allowed) {
    return Response.json(
      { success: false, needUpgrade: true, remaining: 0, message: "免费额度已用完" },
      { status: 403 }
    )
  }

  // 扣减免费额度
  await useMessageQuota(userId)

  let conversation = await prisma.conversation.findFirst({
    where: conversationId ? { id: conversationId } : { userId },
    orderBy: { updatedAt: "desc" },
  })
  if (!conversation) {
    conversation = await prisma.conversation.create({ data: { userId } })
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: cleaned,
      imageUrl: imageUrl || null,
    },
  })

  const recentMessages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const reversedRecent = [...recentMessages].reverse()

  const memories = await getRelevantMemories(userId, message)

  const systemPrompt = buildSystemPrompt(
    {
      name: user.motherProfile.name,
      age: user.motherProfile.age,
      personality: user.motherProfile.personality,
      familyDescription: user.motherProfile.familyDescription,
    },
    memories,
    reversedRecent.map((m) => ({ role: m.role, content: m.content }))
  )

  const messageHistory = reversedRecent.map((m) => ({
    role: m.role === "mother" ? "assistant" : "user",
    content: m.content,
  }))

  const stream = await streamChat(systemPrompt, messageHistory)

  const convId = conversation.id

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

  async function* createResponseStream() {
    const reader = stream.getReader()
    let fullResponse = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      fullResponse += new TextDecoder().decode(value)
    }

    yield `${convId}\n`

    const len = fullResponse.length
    let delay: number
    if (len <= 3) {
      delay = 1000 + Math.random() * 2000
    } else if (len <= 30) {
      delay = 3000 + Math.random() * 5000
    } else {
      delay = 5000 + Math.random() * 10000
    }
    await sleep(delay)

    yield fullResponse

    await prisma.message.create({
      data: {
        conversationId: convId,
        role: "mother",
        content: fullResponse,
      },
    })

    const allMessages = await prisma.message.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: "desc" },
      take: 30,
    })

    extractMemories(
      userId,
      allMessages.reverse().map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))
    ).catch((e) => log({ level: "error", source: "chat", message: "记忆提取失败", detail: String(e), userId }))
  }

  const responseStream = new ReadableStream({
    async pull(controller) {
      const iterator = createResponseStream()
      for await (const chunk of iterator) {
        controller.enqueue(new TextEncoder().encode(chunk))
      }
      controller.close()
    },
  })

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Conversation-Id": conversation.id,
    },
  })
}
