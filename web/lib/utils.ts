import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractTemplateVariables(template: string) {
  if (!template) {
    return []
  }

  const regex = /{{([^{}]+)}}/g
  const matches = [...template.matchAll(regex)]
  return matches.map((match) => match[1].trim())
}
