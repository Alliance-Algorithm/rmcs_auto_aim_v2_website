const REPO_OWNER = "Alliance-Algorithm"
const REPO_NAME = "rmcs_auto_aim_v2"
const BASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`

function getGitHubHeaders() {
  const token = typeof process !== "undefined" ? process.env.GITHUB_TOKEN : undefined
  return {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "rmcs-auto-aim-web",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function fetchViaJina<T>(url: string): Promise<T | null> {
  try {
    const mirroredUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`
    const res = await fetch(mirroredUrl, { cache: "no-store" })
    if (!res.ok) return null

    const raw = await res.text()
    const objectStart = raw.indexOf("{")
    const arrayStart = raw.indexOf("[")
    const jsonStart =
      objectStart === -1 ? arrayStart : arrayStart === -1 ? objectStart : Math.min(objectStart, arrayStart)

    if (jsonStart === -1) return null
    return JSON.parse(raw.slice(jsonStart)) as T
  } catch {
    return null
  }
}

async function fetchGitHubJson<T>(path: string): Promise<T | null> {
  const url = `${BASE_URL}${path}`

  try {
    const res = await fetch(url, {
      headers: getGitHubHeaders(),
      cache: "no-store",
    })

    if (res.ok) {
      return (await res.json()) as T
    }

    if (res.status === 403) {
      return await fetchViaJina<T>(url)
    }

    return null
  } catch {
    return await fetchViaJina<T>(url)
  }
}

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
  const safePath = path ? `/${path}` : ""
  const files = await fetchGitHubJson<GitHubFile[]>(`/contents${safePath}`)
  return files || []
}

export async function fetchFileContent(path: string): Promise<string> {
  try {
    const res = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${path}`, {
      cache: "no-store",
    })
    if (!res.ok) return ""
    return res.text()
  } catch {
    return ""
  }
}

export async function fetchWorkflowRuns(): Promise<WorkflowRun[]> {
  const data = await fetchGitHubJson<{ workflow_runs?: WorkflowRun[] }>("/actions/runs?per_page=30")
  return data?.workflow_runs || []
}

export async function fetchWorkflowLogs(runId: number): Promise<string> {
  const data = await fetchGitHubJson<{ jobs?: unknown[] }>(`/actions/runs/${runId}/jobs`)
  if (!data) return "Failed to fetch logs"
  return JSON.stringify(data.jobs || [], null, 2)
}

export async function fetchCommits(page = 1): Promise<GitHubCommit[]> {
  const commits = await fetchGitHubJson<GitHubCommit[]>(`/commits?per_page=100&page=${page}`)
  return commits || []
}

export async function fetchContributors(): Promise<Contributor[]> {
  const contributors = await fetchGitHubJson<Contributor[]>("/contributors")
  return contributors || []
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
        const rawUrl = match[2].trim()
        const cleanUrl = rawUrl.replace(/^['"]+|['"]+$/g, "")
        assets[match[1].trim()] = cleanUrl
      }
    }
    return assets
  } catch {
    return {}
  }
}

export async function fetchRepoInfo() {
  return fetchGitHubJson("")
}
