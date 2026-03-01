import { Header } from "@/components/header"
import { ContributorsContent } from "@/components/contributors-content"
export default function ContributorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ContributorsContent initialCommits={[]} contributors={[]} />
    </div>
  )
}
