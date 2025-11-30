import { Header } from "@/components/header"
import { ContributorsContent } from "@/components/contributors-content"
import { fetchCommits, fetchContributors } from "@/lib/github"

export default async function ContributorsPage() {
  const [commits, contributors] = await Promise.all([fetchCommits(), fetchContributors()])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ContributorsContent initialCommits={commits} contributors={contributors} />
    </div>
  )
}
