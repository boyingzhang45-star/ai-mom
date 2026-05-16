import Anthropic from "@anthropic-ai/sdk"
import OpenAI from "openai"

let anthropicClient: Anthropic | null = null
let openaiClient: OpenAI | null = null
let deepseekClient: OpenAI | null = null

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    })
  }
  return anthropicClient
}

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    })
  }
  return openaiClient
}

function getDeepSeekClient(): OpenAI {
  if (!deepseekClient) {
    deepseekClient = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || "",
      baseURL: "https://api.deepseek.com",
    })
  }
  return deepseekClient
}

export type AIModel = "claude" | "openai" | "deepseek"

function detectModel(): AIModel {
  if (process.env.ANTHROPIC_API_KEY && process.env.ANTHROPIC_API_KEY !== "your_anthropic_api_key_here") {
    return "claude"
  }
  if (process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY !== "your_deepseek_api_key_here") {
    return "deepseek"
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_openai_api_key_here") {
    return "openai"
  }
  throw new Error("请在 .env.local 中配置 DEEPSEEK_API_KEY、ANTHROPIC_API_KEY 或 OPENAI_API_KEY")
}

export async function streamChat(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  signal?: AbortSignal
): Promise<ReadableStream> {
  const model = detectModel()

  if (model === "claude") {
    return streamClaude(systemPrompt, messages, signal)
  }
  if (model === "deepseek") {
    return streamDeepSeek(systemPrompt, messages, signal)
  }
  return streamOpenAI(systemPrompt, messages, signal)
}

async function streamClaude(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  signal?: AbortSignal
): Promise<ReadableStream> {
  const client = getAnthropicClient()
  const model = process.env.AI_MODEL || "claude-sonnet-4-6"

  const userMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: userMessages,
    stream: true,
  })

  const encoder = new TextEncoder()
  return new ReadableStream({
    async pull(controller) {
      for await (const event of response) {
        if (signal?.aborted) {
          controller.close()
          return
        }
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(event.delta.text))
        }
      }
      controller.close()
    },
  })
}

async function streamOpenAI(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  signal?: AbortSignal
): Promise<ReadableStream> {
  const client = getOpenAIClient()
  const model = process.env.AI_MODEL || "gpt-4o"

  const systemMessage = { role: "system" as const, content: systemPrompt }
  const userMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  return streamWithClient(client, model, systemMessage, userMessages, signal)
}

async function streamDeepSeek(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  signal?: AbortSignal
): Promise<ReadableStream> {
  const client = getDeepSeekClient()
  const model = process.env.AI_MODEL || "deepseek-chat"

  const systemMessage = { role: "system" as const, content: systemPrompt }
  const userMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  return streamWithClient(client, model, systemMessage, userMessages, signal)
}

async function streamWithClient(
  client: OpenAI,
  model: string,
  systemMessage: { role: "system"; content: string },
  userMessages: { role: "user" | "assistant"; content: string }[],
  signal?: AbortSignal
): Promise<ReadableStream> {
  const response = await client.chat.completions.create({
    model,
    messages: [systemMessage, ...userMessages],
    stream: true,
  })

  const encoder = new TextEncoder()
  return new ReadableStream({
    async pull(controller) {
      for await (const chunk of response) {
        if (signal?.aborted) {
          controller.close()
          return
        }
        const content = chunk.choices[0]?.delta?.content
        if (content) {
          controller.enqueue(encoder.encode(content))
        }
      }
      controller.close()
    },
  })
}

export async function chatSync(
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const model = detectModel()

  if (model === "claude") {
    const client = getAnthropicClient()
    const claudeModel = process.env.AI_MODEL || "claude-sonnet-4-6"

    const userMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

    const response = await client.messages.create({
      model: claudeModel,
      max_tokens: 1024,
      system: systemPrompt,
      messages: userMessages,
    })

    return response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
  }

  const client = model === "deepseek" ? getDeepSeekClient() : getOpenAIClient()
  const modelName = process.env.AI_MODEL || (model === "deepseek" ? "deepseek-chat" : "gpt-4o")

  const systemMessage = { role: "system" as const, content: systemPrompt }
  const userMessages = messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  const response = await client.chat.completions.create({
    model: modelName,
    messages: [systemMessage, ...userMessages],
  })

  return response.choices[0]?.message?.content || ""
}
