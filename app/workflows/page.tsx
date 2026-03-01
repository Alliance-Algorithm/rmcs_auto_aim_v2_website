import { Header } from "@/components/header"
import { WorkflowsContent } from "@/components/workflows-content"
export default function WorkflowsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <WorkflowsContent initialRuns={[]} />
    </div>
  )
}
