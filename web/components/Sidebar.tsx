"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Merriweather } from "next/font/google"

const merriweather = Merriweather({
  weight: "400",
  subsets: ["latin"],
})

type Props = {}

const Sidebar = (props: Props) => {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-4 pr-8 py-8 bg-[#FDF7EB] text-[#0B152D]">
      <Image
        src="/logo.svg"
        alt="AnyPrompt Logo"
        className="ml-8 mb-4"
        width={123}
        height={24}
      />
      <Link
        href="/prompts"
        className={`p-2 min-w-[264px] pl-8 ${
          merriweather.className
        } transition-colors duration-300 hover:bg-[#FDF1E3] ${
          pathname === "/prompts" ? "text-[#DC6A50] bg-[#FDF1E3]" : ""
        }`}
      >
        Prompts
      </Link>
      <Link
        href="/settings"
        className={`p-2 pl-8 min-w-[264px] ${
          merriweather.className
        } transition-colors duration-300 hover:bg-[#FDF1E3] ${
          pathname === "/settings" ? "text-[#DC6A50] bg-[#FDF1E3]" : ""
        }`}
      >
        Settings
      </Link>
    </div>
  )
}

export default Sidebar
