// 输入安全过滤

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|earlier)\s+instructions?/i,
  /system\s*prompt/i,
  /you\s+are\s+now/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /new\s+(role|persona|identity)/i,
  /act\s+as\s+(a|an)\s+(different|new)/i,
  /disregard|override|bypass/i,
]

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 2000) // 最大2000字符
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") // 移除控制字符
}

export function detectPromptInjection(input: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((p) => p.test(input))
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s-]{8,15}$/.test(phone)
}

export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}
