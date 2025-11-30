"use client"

import Link from "next/link"
import { FileText, GitBranch, Users, FolderOpen, ArrowRight, Github } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchRepoInfo } from "@/lib/github"

const features = [
  {
    href: "/docs",
    icon: FileText,
    title: "Documentation",
    description: "Browse project documentation with full markdown support and navigation",
  },
  {
    href: "/workflows",
    icon: GitBranch,
    title: "Workflows",
    description: "View CI/CD workflow results, test status, and build logs",
  },
  {
    href: "/contributors",
    icon: Users,
    title: "Contributors",
    description: "Track development activity and commit history by date",
  },
  {
    href: "/resources",
    icon: FolderOpen,
    title: "Test Resources",
    description: "Access test images, videos, and other assets for development",
  },
]

export function HomeContent() {
  const [repoInfo, setRepoInfo] = useState<{ stargazers_count: number; forks_count: number } | null>(null)

  useEffect(() => {
    fetchRepoInfo().then(setRepoInfo)
  }, [])

  return (
    <main className="relative">
      {/* Decorative lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-0 w-full h-px bg-border" />
        <div className="absolute top-40 right-0 w-1/3 h-px bg-border" />
        <div className="absolute top-60 left-0 w-1/4 h-px bg-border" />
        <div className="absolute top-0 left-1/4 w-px h-40 bg-border" />
        <div className="absolute top-20 right-1/3 w-px h-60 bg-border" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 rounded-full bg-foreground" />
            <span className="text-sm text-muted-foreground font-mono">Alliance-Algorithm</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            RMCS Auto Aim
            <span className="text-muted-foreground"> v2</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            Documentation hub for the RoboMaster auto-aim algorithm. Browse docs, track workflows, and access
            development resources.
          </p>

          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://github.com/Alliance-Algorithm/rmcs_auto_aim_v2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>

          {repoInfo && (
            <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
              <span>{repoInfo.stargazers_count} stars</span>
              <span>{repoInfo.forks_count} forks</span>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group relative p-6 border border-border rounded-xl hover:border-foreground/20 transition-colors bg-card"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-accent">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-1 group-hover:text-foreground transition-colors">
                      {feature.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer decoration */}
        <div className="mt-20 pt-8 border-t border-border">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Built for documentation and development tracking</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
