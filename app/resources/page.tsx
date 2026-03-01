import { Header } from "@/components/header"
import { ResourcesContent } from "@/components/resources-content"
export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ResourcesContent assets={{}} />
    </div>
  )
}
