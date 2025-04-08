import PromptClient from "./page.client"
interface PageParams {
  params: {
    id: string
  }
}

export default async function PromptPage({ params }: PageParams) {
  const id = await params.id

  return (
    <div className="container mx-auto px-8 py-6">
      <PromptClient id={id} />
    </div>
  )
}
