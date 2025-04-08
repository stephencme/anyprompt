"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

export default function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[#FFFDF3] text-gray-800">
      <div className="max-w-2xl bg-white p-10 rounded-lg shadow-lg">
        <h1 className="text-4xl font-extrabold text-[#DC6A50] m-0">404</h1>
        <h2 className="text-2xl mt-2 mb-6">Oops! Page Not Found</h2>
        <p className="mb-6 leading-relaxed">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md font-medium border border-gray-300 hover:bg-gray-200 transition-colors"
          >
            Go Back
          </button>
          <Link
            href="/"
            className="px-6 py-2 bg-orange-600 text-white rounded-md font-medium border border-orange-600 hover:bg-orange-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
