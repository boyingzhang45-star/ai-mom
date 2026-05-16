import { prisma } from "./db"

const MAX_USERS = 10
const MAX_MESSAGES = 50

// 获取当前已有多少用户（有 motherProfile 才算注册用户）
export async function getUserCount(): Promise<number> {
  return prisma.motherProfile.count()
}

// 检查是否允许新用户注册
export async function canRegister(): Promise<boolean> {
  const count = await getUserCount()
  return count < MAX_USERS
}

// 获取某个用户的 message 数量
export async function getUserMessageCount(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      conversation: { userId },
      role: "user",
    },
  })
}

// 检查用户是否还能发消息
export async function canSendMessage(userId: string): Promise<boolean> {
  const count = await getUserMessageCount(userId)
  return count < MAX_MESSAGES
}

// 获取剩余轮数
export async function getRemainingMessages(userId: string): Promise<number> {
  const count = await getUserMessageCount(userId)
  return Math.max(0, MAX_MESSAGES - count)
}

export { MAX_USERS, MAX_MESSAGES }
