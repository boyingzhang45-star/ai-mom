import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuid } from "uuid"

const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return Response.json({ error: "请选择图片" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return Response.json({ error: "只支持图片文件" }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: "图片不能超过5MB" }, { status: 400 })
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
    if (!["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return Response.json({ error: "不支持的图片格式" }, { status: 400 })
    }
    const filename = `${uuid()}.${ext}`

    const uploadsDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    const url = `/uploads/${filename}`
    return Response.json({ url })
  } catch (error) {
    console.error("上传失败:", error)
    return Response.json({ error: "上传失败" }, { status: 500 })
  }
}
