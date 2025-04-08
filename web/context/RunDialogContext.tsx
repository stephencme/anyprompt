"use client"

import React, { createContext, useContext, ReactNode, useState } from "react"
import { Database } from "@/database.types"

interface RunDialogContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  promptVersion: Database["public"]["Tables"]["prompt_version"]["Row"] | null
  setPromptVersion: (
    version: Database["public"]["Tables"]["prompt_version"]["Row"] | null,
  ) => void
  templateVariables: string[]
  setTemplateVariables: (variables: string[]) => void
}

const RunDialogContext = createContext<RunDialogContextType | undefined>(
  undefined,
)

export function RunDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [promptVersion, setPromptVersion] = useState<
    Database["public"]["Tables"]["prompt_version"]["Row"] | null
  >(null)
  const [templateVariables, setTemplateVariables] = useState<string[]>([])

  return (
    <RunDialogContext.Provider
      value={{
        isOpen,
        setIsOpen,
        promptVersion,
        setPromptVersion,
        templateVariables,
        setTemplateVariables,
      }}
    >
      {children}
    </RunDialogContext.Provider>
  )
}

export function useRunDialogContext() {
  const context = useContext(RunDialogContext)
  if (context === undefined) {
    throw new Error(
      "useRunDialogContext must be used within a RunDialogProvider",
    )
  }
  return context
}
