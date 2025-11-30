import { Header } from "@/components/header"
import { ResourcesContent } from "@/components/resources-content"
import { fetchAssets } from "@/lib/github"

export default async function ResourcesPage() {
  const assets = await fetchAssets()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ResourcesContent assets={assets} />
    </div>
  )
}
