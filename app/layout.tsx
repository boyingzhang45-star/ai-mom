import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "妈妈的陪伴",
  description: "一个像妈妈一样陪伴你的 AI",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
