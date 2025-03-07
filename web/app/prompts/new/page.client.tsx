"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { merriweather } from "@/app/fonts"
import Link from "next/link"
import { Play, X } from "lucide-react"

const NewPromptClient = () => {
  const router = useRouter()
  const [promptName, setPromptName] = useState<string>("Untitled")
  const [version, setVersion] = useState<string>("0.0.1")
  const [template, setTemplate] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<{
    name?: string
    version?: string
    template?: string
    general?: string
  }>({})

  // Extract template variables from the template
  const extractTemplateVariables = (templateText: string): string[] => {
    const regex = /{{([^{}]+)}}/g
    const matches = [...templateText.matchAll(regex)]
    const variables = matches.map((match) => match[1].trim())
    // Remove duplicates
    return [...new Set(variables)]
  }

  // Validate form fields
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!promptName || promptName.trim() === "") {
      newErrors.name = "Prompt name is required"
    }

    if (!version || !version.match(/^\d+\.\d+\.\d+$/)) {
      newErrors.version = "Version must be in format x.y.z (e.g. 0.0.1)"
    }

    if (!template || template.trim() === "") {
      newErrors.template = "Template is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Extract template variables
      const templateVariables = extractTemplateVariables(template)

      // Call our API route instead of Supabase directly
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: promptName,
          template,
          version,
          templateVariables,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save prompt")
      }

      // Navigate back to prompts page on success
      router.push("/prompts")
    } catch (error) {
      console.error("Error saving prompt:", error)
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "Failed to save prompt. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRun = async () => {
    // TODO: Implement run functionality
    console.log("Running prompt:", { name: promptName, version, template })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 text-2xl font-bold">
          <p className={`${merriweather.className}`}>New prompt</p>
          <p className="font-mono">/</p>
          <p className="font-mono font-normal">{promptName}</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className={`flex items-center gap-2 font-bold ${
              isLoading
                ? "bg-gray-400"
                : "bg-burnt-orange hover:bg-burnt-orange-dark"
            } text-white px-4 py-2 transition-all duration-300`}
          >
            <p className="font-bold">{isLoading ? "Saving..." : "Save"}</p>
          </button>
          <Link href="/prompts" className="px-2">
            <X />
          </Link>
        </div>
      </div>

      {errors.general && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-300 rounded">
          {errors.general}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 flex-grow">
        <div className="col-span-2 flex flex-col space-y-4">
          <div>
            <div
              className={`flex border-2 ${
                errors.name ? "border-red-500" : "border-gray-200"
              } focus-within:border-burnt-orange focus-within:ring-1 focus-within:ring-burnt-orange`}
            >
              <span className="text-burnt-orange py-2 pl-2 pr-1 font-medium min-w-[80px] bg-cream font-dm-mono">
                Name:
              </span>
              <input
                type="text"
                value={promptName}
                onChange={(e) => setPromptName(e.target.value)}
                className="w-full p-2 outline-none border-none font-dm-mono bg-cream"
                placeholder="Untitled"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div>
            <div
              className={`flex border-2 ${
                errors.version ? "border-red-500" : "border-gray-200"
              } focus-within:border-burnt-orange focus-within:ring-1 focus-within:ring-burnt-orange`}
            >
              <span className="text-burnt-orange py-2 pl-2 pr-1 font-medium min-w-[80px] bg-cream font-dm-mono">
                Version:
              </span>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full p-2 outline-none border-none font-dm-mono bg-cream"
                placeholder="e.g. 0.0.1"
              />
            </div>
            {errors.version && (
              <p className="text-red-500 text-sm mt-1">{errors.version}</p>
            )}
          </div>

          <div className="flex flex-col flex-grow">
            <label className="block mb-1 text-gray-500 font-dm-mono font-medium">
              Template
            </label>
            <div
              className={`border-2 ${
                errors.template ? "border-red-500" : "border-gray-200"
              } focus-within:border-burnt-orange focus-within:ring-1 focus-within:ring-burnt-orange bg-cream`}
            >
              <textarea
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full p-2 outline-none border-none font-dm-mono bg-cream resize-y min-h-[200px]"
                placeholder='e.g. Always respond "hello world". Use {{variable}} for template variables.'
                rows={10}
              />
            </div>
            {errors.template && (
              <p className="text-red-500 text-sm mt-1">{errors.template}</p>
            )}

            {template && (
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-600">
                  Template Variables Detected:
                </h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  {extractTemplateVariables(template).length > 0 ? (
                    extractTemplateVariables(template).map((variable, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                      >
                        {variable}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      No variables detected. Use {`{{variable_name}}`} syntax.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 flex flex-col">
          <div className="mb-2 text-gray-500 font-dm-mono font-medium">
            Run history
          </div>
          <div className="flex flex-col gap-2 border-2 border-dashed border-gray-200 p-4 flex-grow">
            <div className="flex justify-between items-center">
              <select className="border-2 border-gray-200 p-1 focus:border-burnt-orange focus:ring-1 focus:ring-burnt-orange outline-none font-dm-mono">
                <option className="text-gray-400">No runs to show</option>
              </select>
              <button
                onClick={handleRun}
                className="flex items-center gap-2 font-bold bg-burnt-orange text-white px-4 py-2 hover:bg-burnt-orange-dark transition-all duration-300"
              >
                <Play className="w-4 h-4 text-white" fill="white" />
                <p className="font-bold">Run</p>
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 p-4 flex-grow mt-2 flex items-center justify-center text-gray-400">
              Run results will appear here
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewPromptClient
