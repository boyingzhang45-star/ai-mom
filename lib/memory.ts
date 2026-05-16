import { prisma } from "./db"
import { chatSync } from "./ai"
import { buildMemoryExtractionPrompt } from "./prompt"

interface MemoryRecord {
  category: string
  content: string
  importance: number
}

export async function extractMemories(
  userId: string,
  messages: { role: string; content: string }[]
): Promise<void> {
  if (messages.length < 4) return

  try {
    const prompt = buildMemoryExtractionPrompt(messages)
    const response = await chatSync(
      "你是记忆提取助手。只返回 JSON 数组，不要其他内容。",
      [{ role: "user", content: prompt }]
    )

    const jsonStr = response.replace(/```json|```/g, "").trim()
    const memories = JSON.parse(jsonStr) as {
      category: string
      content: string
      importance: number
    }[]

    if (!Array.isArray(memories) || memories.length === 0) return

    for (const mem of memories) {
      const category = normalizeCategory(mem.category)
      const importance = Math.min(10, Math.max(1, mem.importance || 5))

      const existing = await prisma.longTermMemory.findFirst({
        where: {
          userId,
          category,
          content: mem.content,
        },
      })

      if (existing) {
        await prisma.longTermMemory.update({
          where: { id: existing.id },
          data: {
            importance: Math.max(existing.importance, importance),
            updatedAt: new Date(),
          },
        })
      } else {
        await prisma.longTermMemory.create({
          data: {
            userId,
            category,
            content: mem.content,
            importance,
          },
        })
      }
    }
  } catch (error) {
    console.error("记忆提取失败:", error)
  }
}

function normalizeCategory(cat: string): string {
  const valid = ["personal_info", "preference", "life_event", "emotional", "relationship"]
  const lower = cat.toLowerCase().trim()
  for (const v of valid) {
    if (lower.includes(v)) return v
  }
  return "personal_info"
}

export async function getRelevantMemories(
  userId: string,
  currentMessage?: string,
  limit = 10
): Promise<{ category: string; content: string; importance: number }[]> {
  const memories = await prisma.longTermMemory.findMany({
    where: { userId },
    orderBy: { importance: "desc" },
    take: 20,
  })

  if (!currentMessage || memories.length <= limit) {
    return memories.slice(0, limit).map((m: MemoryRecord) => ({
      category: m.category,
      content: m.content,
      importance: m.importance,
    }))
  }

  const scored = memories.map((m: MemoryRecord) => {
    let score = m.importance * 10
    const content = m.content.toLowerCase()
    const msg = currentMessage.toLowerCase()

    const msgWords = msg.split(/\s+/)
    for (const word of msgWords) {
      if (word.length >= 2 && content.includes(word)) {
        score += 30
      }
    }

    if (
      (m.category === "life_event" || m.category === "emotional") &&
      m.importance >= 7
    ) {
      score += 20
    }

    return { ...m, score }
  })

  scored.sort((a: MemoryRecord & { score: number }, b: MemoryRecord & { score: number }) => b.score - a.score)
  return scored.slice(0, limit).map((m: MemoryRecord & { score: number }) => ({
    category: m.category,
    content: m.content,
    importance: m.importance,
  }))
}

const CATEGORY_LABELS: Record<string, string> = {
  personal_info: "基本信息",
  preference: "喜好",
  life_event: "生活事件",
  emotional: "情绪状态",
  relationship: "关系",
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category
}
