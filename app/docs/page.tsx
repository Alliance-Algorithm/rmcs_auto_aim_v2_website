import { Header } from "@/components/header"
import { DocsContent } from "@/components/docs-content"
export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DocsContent initialFiles={[]} />
    </div>
  )
}
