import { Header } from "@/components/header"
import { DocsContent } from "@/components/docs-content"
import { fetchDocFiles } from "@/lib/github"

export default async function DocsPage() {
  const files = await fetchDocFiles()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DocsContent initialFiles={files} />
    </div>
  )
}
