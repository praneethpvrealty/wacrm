"use client"

import Link from 'next/link'
import { UserPlus, Briefcase, Radio, Zap } from 'lucide-react'
import type { ComponentType } from 'react'

// Quick-action shortcuts. Each navigates to the page that owns the
// relevant "create" flow. We deliberately don't try to auto-open any
// modal on the target page — that'd require touching those pages,
// which is out of scope here.
interface Action {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
  tint: string
}

const ACTIONS: Action[] = [
  { label: 'New Contact', href: '/contacts', icon: UserPlus, tint: 'text-primary' },
  { label: 'New Deal', href: '/pipelines', icon: Briefcase, tint: 'text-blue-400' },
  { label: 'New Broadcast', href: '/broadcasts/new', icon: Radio, tint: 'text-amber-400' },
  { label: 'New Automation', href: '/automations/new', icon: Zap, tint: 'text-primary' },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ACTIONS.map((a) => {
        const Icon = a.icon
        return (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/45 px-4 py-3.5 transition-all duration-300 hover:border-primary/25 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-primary/4 relative overflow-hidden"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/60 border border-slate-900 text-slate-350 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary/15 group-hover:text-primary group-hover:border-primary/20 shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{a.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
