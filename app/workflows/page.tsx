import { Header } from "@/components/header"
import { WorkflowsContent } from "@/components/workflows-content"
import { fetchWorkflowRuns } from "@/lib/github"

export default async function WorkflowsPage() {
  const runs = await fetchWorkflowRuns()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WorkflowsContent initialRuns={runs} />
    </div>
  )
}
