import { getRecentErrors } from "@/lib/logger"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret")
  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "无权限" }, { status: 403 })
  }

  const errors = await getRecentErrors()
  return Response.json({ errors })
}
