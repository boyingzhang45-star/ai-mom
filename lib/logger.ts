// 轻量错误监控 - 写入数据库

import { prisma } from "./db"

export type LogLevel = "error" | "warn" | "info"

interface LogEntry {
  level: LogLevel
  source: string    // "chat" | "auth" | "payment" | "upload" | "api"
  message: string
  detail?: string
  userId?: string
}

export async function log(entry: LogEntry) {
  try {
    // 输出到控制台
    const prefix = { error: "❌", warn: "⚠️", info: "ℹ️" }[entry.level]
    console.log(`${prefix} [${entry.source}] ${entry.message}${entry.detail ? " | " + entry.detail : ""}`)

    // 写入数据库
    await prisma.errorLog.create({
      data: {
        level: entry.level,
        source: entry.source,
        message: entry.message.slice(0, 500),
        detail: entry.detail?.slice(0, 2000) || "",
        userId: entry.userId || "",
      },
    })
  } catch {
    // 日志本身失败不影响主流程
    console.error("日志写入失败", entry.message)
  }
}

// 获取最近错误
export async function getRecentErrors(limit = 50) {
  return prisma.errorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: { level: true, source: true, message: true, detail: true, userId: true, createdAt: true },
  })
}
