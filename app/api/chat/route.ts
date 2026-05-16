import { prisma } from "@/lib/db"
import { streamChat } from "@/lib/ai"
import { buildSystemPrompt } from "@/lib/prompt"
import { getRelevantMemories, extractMemories } from "@/lib/memory"

export async function POST(request: Request) {
  const body = await request.json()
  const { userId, message, conversationId, imageUrl } = body

  if (!userId || !message) {
    return Response.json({ error: "需要 userId 和 message" }, { status: 400 })
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

  let conversation = await prisma.conversation.findFirst({
    where: conversationId ? { id: conversationId } : { userId },
    orderBy: { updatedAt: "desc" },
  })
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: { userId },
    })
  }

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: message,
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

    // 先读完 AI 的全部回复
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      fullResponse += new TextDecoder().decode(value)
    }

    yield `${convId}\n`

    // 关系节奏感：回复时间不固定，模拟真实妈妈的节奏
    const len = fullResponse.length
    let delay: number
    if (len <= 3) {
      // "嗯" "好" "知道了" → 很快（1-3s，妈妈秒回）
      delay = 1000 + Math.random() * 2000
    } else if (len <= 30) {
      // 简短日常回复 → 中等（3-8s，妈妈看了一眼，想了想）
      delay = 3000 + Math.random() * 5000
    } else {
      // 较长回复 → 慢一些（5-15s，妈妈认真打字）
      delay = 5000 + Math.random() * 10000
    }
    await sleep(delay)

    // 一次性发出完整消息
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
    ).catch(console.error)
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
