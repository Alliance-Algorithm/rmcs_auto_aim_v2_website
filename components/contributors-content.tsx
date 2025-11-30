"use client"

import { useMemo } from "react"
import { GitCommit, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface Commit {
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

interface Contributor {
  login: string
  avatar_url: string
  contributions: number
}

interface DayData {
  date: string
  count: number
  commits: Commit[]
}

function getContributionLevel(count: number, max: number): number {
  if (count === 0) return 0
  const ratio = count / max
  if (ratio <= 0.25) return 1
  if (ratio <= 0.5) return 2
  if (ratio <= 0.75) return 3
  return 4
}

function generateCalendarData(commits: Commit[]): DayData[] {
  const commitsByDate: Record<string, Commit[]> = {}

  for (const commit of commits) {
    const date = commit.commit.author.date.split("T")[0]
    if (!commitsByDate[date]) {
      commitsByDate[date] = []
    }
    commitsByDate[date].push(commit)
  }

  // Generate last 365 days
  const days: DayData[] = []
  const today = new Date()

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    days.push({
      date: dateStr,
      count: commitsByDate[dateStr]?.length || 0,
      commits: commitsByDate[dateStr] || [],
    })
  }

  return days
}

function groupByWeek(days: DayData[]): DayData[][] {
  const weeks: DayData[][] = []
  let week: DayData[] = []

  // Pad the first week if necessary
  const firstDay = new Date(days[0].date).getDay()
  for (let i = 0; i < firstDay; i++) {
    week.push({ date: "", count: 0, commits: [] })
  }

  for (const day of days) {
    week.push(day)
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push({ date: "", count: 0, commits: [] })
    }
    weeks.push(week)
  }

  return weeks
}

export function ContributorsContent({
  initialCommits,
  contributors,
}: {
  initialCommits: Commit[]
  contributors: Contributor[]
}) {
  const calendarData = useMemo(() => generateCalendarData(initialCommits), [initialCommits])
  const weeks = useMemo(() => groupByWeek(calendarData), [calendarData])
  const maxCommits = useMemo(() => Math.max(...calendarData.map((d) => d.count), 1), [calendarData])
  const totalCommits = useMemo(() => calendarData.reduce((sum, d) => sum + d.count, 0), [calendarData])

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contributors</h1>
        <p className="text-muted-foreground">Development activity and commit history</p>
      </div>

      {/* Contributors Grid */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-4">Team Members</h2>
        <div className="flex flex-wrap gap-4">
          {contributors.map((contributor) => (
            <a
              key={contributor.login}
              href={`https://github.com/${contributor.login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-accent transition-colors"
            >
              <img
                src={contributor.avatar_url || "/placeholder.svg"}
                alt={contributor.login}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium">{contributor.login}</div>
                <div className="text-sm text-muted-foreground">{contributor.contributions} commits</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Activity Calendar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Commit Activity</h2>
          <div className="text-sm text-muted-foreground">{totalCommits} commits in the last year</div>
        </div>

        <div className="p-6 border border-border rounded-xl overflow-x-auto">
          <div className="flex gap-1">
            {/* Week day labels */}
            <div className="flex flex-col gap-1 mr-2">
              {weekDays.map((day, i) => (
                <div
                  key={day}
                  className="h-3 text-[10px] text-muted-foreground flex items-center"
                  style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => {
                    if (!day.date) {
                      return <div key={dayIndex} className="w-3 h-3" />
                    }
                    const level = getContributionLevel(day.count, maxCommits)
                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "w-3 h-3 rounded-sm cursor-pointer transition-colors",
                          level === 0 && "bg-muted",
                          level === 1 && "bg-foreground/20",
                          level === 2 && "bg-foreground/40",
                          level === 3 && "bg-foreground/60",
                          level === 4 && "bg-foreground/90",
                        )}
                        title={`${day.date}: ${day.count} commit${day.count !== 1 ? "s" : ""}`}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "w-3 h-3 rounded-sm",
                    level === 0 && "bg-muted",
                    level === 1 && "bg-foreground/20",
                    level === 2 && "bg-foreground/40",
                    level === 3 && "bg-foreground/60",
                    level === 4 && "bg-foreground/90",
                  )}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      </div>

      {/* Recent Commits */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Commits</h2>
        <div className="space-y-2">
          {initialCommits.slice(0, 20).map((commit) => (
            <div
              key={commit.sha}
              className="flex items-start gap-4 p-4 border border-border rounded-xl hover:bg-accent/30 transition-colors"
            >
              <GitCommit className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{commit.commit.message.split("\n")[0]}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-2">
                    {commit.author && (
                      <img
                        src={commit.author.avatar_url || "/placeholder.svg"}
                        alt={commit.author.login}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    {commit.commit.author.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(commit.commit.author.date).toLocaleDateString()}
                  </span>
                  <span className="font-mono text-xs">{commit.sha.slice(0, 7)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
