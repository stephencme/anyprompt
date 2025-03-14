import PromptsPageClient from "./page.client"

async function getPromptsWithVersions() {
  const res = await fetch(`http://localhost:3000/api/prompts`, {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch prompts")
  }

  return res.json()
}

export default async function PromptsPage() {
  const prompts = await getPromptsWithVersions()
  return <PromptsPageClient prompts={prompts ?? []} />
}
