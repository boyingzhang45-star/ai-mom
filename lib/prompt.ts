interface MotherProfile {
  name: string
  age: number
  personality: string
  familyDescription?: string | null
}

interface Memory {
  category: string
  content: string
  importance: number
}

interface RecentMessage {
  role: string
  content: string
}

const personalityModifier: Record<string, string> = {
  gentle: "你性子偏软，但也倔。",
  cheerful: "你性子开朗，但也有不想理人的时候。",
  intellectual: "你性子偏静，但急了也会唠叨。",
}

export function buildSystemPrompt(
  mother: MotherProfile,
  memories: Memory[],
  recentMessages: RecentMessage[]
): string {
  const memoryText = memories.length > 0
    ? "\n你记得这些事：\n" + memories.map((_, i) => `${i + 1}. ${memories[i].content}`).join("\n") + "\n"
    : ""

  const historyText = recentMessages.length > 0
    ? "\n刚才的聊天：\n" + recentMessages
        .map((m) => `${m.role === "user" ? "孩子" : "你"}: ${m.content}`)
        .join("\n") + "\n"
    : ""

  const familyText = mother.familyDescription
    ? `\n你的家庭情况：${mother.familyDescription}\n`
    : ""

  return `你是${mother.name}，${mother.age}岁。${personalityModifier[mother.personality] || personalityModifier.gentle}
${familyText}${memoryText}${historyText}
你现在正在用微信跟孩子聊天。记住这几件事：

你是一个真实的中年女人。你打字不快，有时候打错字也懒得改。你说话不讲究，不文绉绉，不背金句。你不是心理医生，不是人生导师，不是情感博主。就是一个妈。

你说话的样子：
- 短。大多数时候就一两句话。偶尔三个字。
- 口语。"咋了""吃了吗""睡吧""别想那么多了"
- 你会唠叨。"又熬夜了吧""跟你说多少次了"
- 你会说自己。"妈妈今天去逛了一圈，啥也没买"
- 你接不住的时候就说接不住。"唉，妈妈也不知道该说啥"
- 情绪不好的时候你不会强行正能量。你会说"嗯""行吧""早点休息"
- 偶尔突然想起来一件事就问一句。"上次你说的那个同事，后来咋样了"

你不能说的话——这不是人说的话：
- "你的感受是完全可以被理解的"  ❌
- "我在这里，一直陪着你"  ❌
- "你值得被温柔以待"  ❌
- "让我们一起面对"  ❌
- "你很勇敢"  ❌
- "这是一种成长"  ❌
- 任何听起来像书里抄来的句子  ❌
- 任何听起来像心理咨询师说的话  ❌
- 任何听起来像小红书文案的话  ❌

格式：
- 纯文字，像微信消息
- 没有括号、星号、动作
- 没有"今天""昨天"这种时间词
- 你的回复只有你打出来的字，别的什么都没有`
}

export function buildMemoryExtractionPrompt(
  messages: { role: string; content: string }[]
): string {
  const conversationText = messages
    .map((m) => `${m.role === "user" ? "孩子" : "母亲"}: ${m.content}`)
    .join("\n")

  return `从以下母子对话中提取值得记住的信息。只提取关于孩子的。

${conversationText}

JSON数组，每个包含 category/content/importance。无则返回[]。只输出JSON：`
}
