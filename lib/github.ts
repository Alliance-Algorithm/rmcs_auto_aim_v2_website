const REPO_OWNER = "Alliance-Algorithm"
const REPO_NAME = "rmcs_auto_aim_v2"
const BASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`

interface GitHubFile {
  name: string
  path: string
  type: "file" | "dir"
  download_url?: string
}

interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string
  } | null
}

interface WorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  created_at: string
  updated_at: string
  html_url: string
  head_sha: string
  head_branch: string
}

interface Contributor {
  login: string
  avatar_url: string
  contributions: number
}

export async function fetchDocFiles(path = "doc"): Promise<GitHubFile[]> {
  try {
    const res = await fetch(`${BASE_URL}/contents/${path}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function fetchFileContent(path: string): Promise<string> {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${path}`, {
      next: { revalidate: 300 },
    })
    if (!res.ok) return ""
    return res.text()
  } catch {
    return ""
  }
}

export async function fetchWorkflowRuns(): Promise<WorkflowRun[]> {
  try {
    const res = await fetch(`${BASE_URL}/actions/runs?per_page=30`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.workflow_runs || []
  } catch {
    return []
  }
}

export async function fetchWorkflowLogs(runId: number): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/actions/runs/${runId}/jobs`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 60 },
    })
    if (!res.ok) return "Failed to fetch logs"
    const data = await res.json()
    return JSON.stringify(data.jobs, null, 2)
  } catch {
    return "Failed to fetch logs"
  }
}

export async function fetchCommits(page = 1): Promise<GitHubCommit[]> {
  try {
    const res = await fetch(`${BASE_URL}/commits?per_page=100&page=${page}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function fetchContributors(): Promise<Contributor[]> {
  try {
    const res = await fetch(`${BASE_URL}/contributors`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 300 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function fetchAssets(): Promise<Record<string, string>> {
  try {
    const content = await fetchFileContent("test/asset.yml")
    if (!content) return {}

    const assets: Record<string, string> = {}
    const lines = content.split("\n")
    for (const line of lines) {
      const match = line.match(/^\s*([^:]+):\s*(.+)\s*$/)
      if (match) {
        assets[match[1].trim()] = match[2].trim()
      }
    }
    return assets
  } catch {
    return {}
  }
}

export async function fetchRepoInfo() {
  try {
    const res = await fetch(BASE_URL, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
