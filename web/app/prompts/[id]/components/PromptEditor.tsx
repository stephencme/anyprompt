"use client"

import React from "react"
import VersionSelector from "./VersionSelector"
import { Database } from "@/database.types"

interface PromptEditorProps {
  promptName: string
  version: string
  versions: Database["public"]["Tables"]["prompt_version"]["Row"][]
  description: string
  template: string
  errors: {
    description?: string
    template?: string
  }
  onDescriptionChange: (value: string) => void
  onTemplateChange: (value: string) => void
  onVersionChange: (value: string) => void
}

export default function PromptEditor({
  promptName,
  description,
  template,
  errors,
  onDescriptionChange,
  onTemplateChange,
  version,
  versions,
  onVersionChange,
}: PromptEditorProps) {
  // Extract template variables from the template
  const extractTemplateVariables = (templateText: string): string[] => {
    const regex = /{{([^{}]+)}}/g
    const matches = [...templateText.matchAll(regex)]
    const variables = matches.map((match) => match[1].trim())
    // Remove duplicates
    return [...new Set(variables)]
  }

  return (
    <div className="flex flex-col space-y-4">
      <div>
        <p className="text-gray-500 font-dm-mono font-medium">Name</p>
        <p className="text-2xl font-dm-mono font-medium">{promptName}</p>
      </div>

      <VersionSelector
        version={version}
        versions={versions}
        onVersionChange={onVersionChange}
      />

      <div className="flex flex-col">
        <label className="block mb-1 text-gray-500 font-dm-mono font-medium">
          Description
        </label>
        <div
          className={`border-2 ${
            errors.description ? "border-red-500" : "border-gray-200"
          } focus-within:border-burnt-orange focus-within:ring-1 focus-within:ring-burnt-orange bg-cream`}
        >
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full p-2 outline-none border-none font-dm-mono bg-cream resize-y min-h-[42px]"
            placeholder="e.g. What does this prompt do?"
            rows={1}
          />
        </div>
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
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
            onChange={(e) => onTemplateChange(e.target.value)}
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
  )
}
