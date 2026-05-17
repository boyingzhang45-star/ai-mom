import { activatePro } from "@/lib/subscription"

export async function POST(request: Request) {
  const { userId, secret } = await request.json()

  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "无权限" }, { status: 403 })
  }

  if (!userId) {
    return Response.json({ error: "需要 userId" }, { status: 400 })
  }

  await activatePro(userId, "manual")

  return Response.json({ success: true })
}
