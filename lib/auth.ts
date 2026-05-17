import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { cookies } from "next/headers"

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "momecho-jwt-secret-change-in-production"
)
const TOKEN_NAME = "momecho_token"
const TOKEN_DAYS = 30

export interface AuthUser {
  id: string
  email?: string | null
  nickname: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({ id: user.id, email: user.email, nickname: user.nickname })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_DAYS}d`)
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as AuthUser
  } catch {
    return null
  }
}

// Server-side: get current user from cookie
export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

// Server-side: set auth cookie
export async function setSession(user: AuthUser): Promise<void> {
  const token = await createToken(user)
  const cookieStore = await cookies()
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_DAYS * 86400,
    path: "/",
  })
}

// Server-side: clear auth cookie
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(TOKEN_NAME)
}
