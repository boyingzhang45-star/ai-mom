// 简易内存限流，生产环境建议用 Upstash Redis

const store = new Map<string, { count: number; resetAt: number }>()

interface RateLimitConfig {
  windowMs: number   // 时间窗口
  max: number        // 最大请求数
}

export function rateLimit(key: string, config: RateLimitConfig): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
    return { allowed: true, remaining: config.max - 1 }
  }

  if (entry.count >= config.max) {
    return { allowed: false, remaining: 0 }
  }

  entry.count++
  return { allowed: true, remaining: config.max - entry.count }
}

// 定期清理
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key)
  }
}, 60000)

// 预定义限流配置
export const LIMITS = {
  chat: { windowMs: 60000, max: 10 },        // 聊天: 10次/分钟
  register: { windowMs: 3600000, max: 5 },    // 注册: 5次/小时
  login: { windowMs: 900000, max: 10 },       // 登录: 10次/15分钟
  upload: { windowMs: 60000, max: 5 },        // 上传: 5次/分钟
  payment: { windowMs: 60000, max: 3 },       // 支付: 3次/分钟
}
