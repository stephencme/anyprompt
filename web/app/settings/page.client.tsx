"use client"

import { useEffect, useState } from "react"
import { Database } from "@/database.types"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Merriweather } from "next/font/google"
import { Libre_Franklin } from "next/font/google"
import { DM_Mono } from "next/font/google"
import { Loader2 } from "lucide-react"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"

const merriweather = Merriweather({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

const dmmono = DM_Mono({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
})

const librefranklin = Libre_Franklin({
  weight: ["400", "700"],
  subsets: ["latin"],
})

type APIKeys = {
  openai: string | null
  anthropic: string | null
}

const providers = ["OpenAI", "Anthropic"]

export default function SettingsPageClient() {
  const { user, setUser, isAuthLoading } = useAuth()
  const [profile, setProfile] = useState<
    Database["public"]["Tables"]["Users"]["Row"] | null
  >(null)
  const router = useRouter()
  const [keys, setKeys] = useState<APIKeys>()
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const fetchUser = async () => {
    const { data } = await supabase.auth.getUser()
    const current_user = data?.user
    setUser(current_user)

    if (current_user) {
      const { data: p, error: profileError } = await supabase
        .from("Users")
        .select("*")
        .eq("id", current_user?.id)
        .single()

      if (profileError) {
        return <div>Error retrieving profile</div>
      } else {
        setProfile(p)
      }
    }
  }

  const fetchKeys = async () => {
    if (profile) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/fetchAPIKeys?userId=${profile.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch API keys")
        }
        const data = await response.json()

        let openai_key = null
        let anthropic_key = null

        if (data.keys && Array.isArray(data.keys)) {
          data.keys.forEach(
            (key: Database["public"]["Tables"]["user_api_keys"]["Row"]) => {
              if (key.provider === "OpenAI") {
                openai_key = key.encrypted_api_key
              }
              if (key.provider === "Anthropic") {
                anthropic_key = key.encrypted_api_key
              }
            },
          )
        }

        const api_keys: APIKeys = {
          openai: openai_key,
          anthropic: anthropic_key,
        }
        setKeys(api_keys)
      } catch (error) {
        console.error("Error fetching API keys:", error)
        toast.error("Failed to fetch API keys")
      }
    }
    setIsLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handlePasswordChange = async () => {
    // TODO: Implement password change
  }

  const handleSave = async (provider: string, apiKey: string) => {
    if (!apiKey.trim()) {
      toast.error("API key cannot be empty")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/storeAPIKey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          apiKey,
          userId: profile?.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save API key")
      }

      const data = await response.json()
      setApiKeys((prev) => ({ ...prev, [provider]: data.encryptedKey }))
      toast.success(`${provider} API key saved successfully`)
      fetchKeys() // Refresh the displayed keys
    } catch (error) {
      console.error("Error saving API key:", error)
      toast.error("Failed to save API key")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    fetchUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (profile) {
      fetchKeys()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  if (!user && !isAuthLoading) {
    redirect("/login")
  }

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-[#FFFDF3] pt-7 pl-[32px] pr-[32px] text-[#222]`}
    >
      <h1 className={`text-2xl font-black mb-2 ${merriweather.className}`}>
        Settings
      </h1>
      <hr className="border-t border-[#e0e0e0] mt-7 mb-6" />

      {!user ? (
        <div className="text-center py-8">
          <p className="text-lg mb-4">Please log in to manage your API keys</p>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-burnt-orange text-white rounded-md hover:bg-burnt-orange-dark"
          >
            Log In
          </button>
        </div>
      ) : (
        <>
          {/* Username + Sign out */}
          <div className="mb-8 pl-3">
            <h2
              className={`text-sm mb-2 font-medium text-[#484F5E] ${dmmono.className}`}
            >
              Username
            </h2>
            <p
              className={`mb-4 text-[#0B152D] font-medium ${dmmono.className}`}
            >
              {profile?.email}
            </p>
            <button
              onClick={handleSignOut}
              className={`bg-burnt-orange text-white font-bold px-4 py-2 ${librefranklin.className}`}
            >
              Sign out
            </button>
          </div>

          {/* Password box */}
          <div className="mb-6">
            <h2
              onClick={handlePasswordChange}
              className={`text-sm mb-2 pl-3 text-[#484F5E] font-medium ${dmmono.className}`}
            >
              Change password
            </h2>
            <div className="border border-[#e0e0e0] p-1 flex items-center gap-3 w-full max-w-md">
              <label
                className={`text-burnt-orange font-normal ${dmmono.className}`}
                htmlFor="password"
              >
                <span className="pl-2 font-medium">Password:</span>
              </label>
              <input
                id="password"
                type="password"
                placeholder="password"
                className="flex-1 border-none outline-none bg-transparent text-[#6D717B] placeholder:text-[#6D717B]"
              />
              <button
                className={`bg-[#DC6A50] text-white px-3 py-1 border border-[#eab6a7] font-bold ${librefranklin.className}`}
              >
                Change
              </button>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${merriweather.className}`}>
              API Keys
            </h2>

            {/* Display existing API keys */}
            <div className="mb-6">
              <div className="border border-[#e0e0e0] px-3 py-2 mb-2 max-w-md">
                <span
                  className={`text-burnt-orange font-medium ${dmmono.className}`}
                >
                  ANTHROPIC_API_KEY:
                </span>
                <span
                  className={`text-[#6D717B] ml-2 font-normal ${dmmono.className}`}
                >
                  {keys?.anthropic || "Not set"}
                </span>
              </div>

              <div className="border border-[#e0e0e0] px-3 py-2 max-w-md">
                <span
                  className={`text-burnt-orange font-medium ${dmmono.className}`}
                >
                  OPENAI_API_KEY:
                </span>
                <span
                  className={`text-[#6D717B] ml-2 font-normal ${dmmono.className}`}
                >
                  {keys?.openai || "Not set"}
                </span>
              </div>
            </div>

            {/* API Key Input Section */}
            <div className="space-y-4">
              {providers.map((provider) => (
                <div key={provider} className="flex flex-col space-y-2">
                  <label
                    className={`text-sm font-medium text-[#484F5E] ${dmmono.className}`}
                  >
                    {provider} API Key
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      className="flex-1 p-2 border rounded-md"
                      placeholder={`Enter your ${provider} API key`}
                      onChange={(e) =>
                        setApiKeys((prev) => ({
                          ...prev,
                          [provider]: e.target.value,
                        }))
                      }
                      value={apiKeys[provider] ? "••••••••" : ""}
                    />
                    <button
                      onClick={() => handleSave(provider, apiKeys[provider])}
                      disabled={isSaving}
                      className="px-4 py-2 bg-burnt-orange text-white rounded-md hover:bg-burnt-orange-dark disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
