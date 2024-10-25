import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from 'next/font/local'
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

// 加载自定义字体
const zcoolFont = localFont({
  src: '../public/fonts/ZCOOLQingKeHuangYou-Regular.ttf',
  variable: '--font-zcool'
})

export const metadata: Metadata = {
  title: "像素假游戏",
  description: "一个有趣的像素艺术创作游戏",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh" className={`${zcoolFont.variable} ${inter.className}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
