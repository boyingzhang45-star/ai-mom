import { getUserStatus } from "@/lib/subscription"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId")
  if (!userId) {
    return Response.json({ error: "需要 userId" }, { status: 400 })
  }
  const status = await getUserStatus(userId)
  return Response.json(status)
}
