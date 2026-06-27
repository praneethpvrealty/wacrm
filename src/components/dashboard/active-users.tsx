"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ActiveUser {
  id: string
  name: string
  role: string
  status: "Online" | "Away" | "Offline"
  action: string
  avatar: string
}

const USERS: ActiveUser[] = [
  {
    id: "1",
    name: "Mia L.",
    role: "Manager",
    status: "Online",
    action: "Closed ₹15.8L Deal",
    avatar: "ML",
  },
  {
    id: "2",
    name: "Ryan P.",
    role: "Agent",
    status: "Online",
    action: "Updated Pipeline",
    avatar: "RP",
  },
  {
    id: "3",
    name: "David K.",
    role: "Client",
    status: "Online",
    action: "Joined WhatsApp Chat",
    avatar: "DK",
  },
]

export function ActiveUsers() {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/45 backdrop-blur-sm shadow-md hover:border-primary/20 transition-all duration-300 relative group overflow-hidden h-full">
      <header className="border-b border-slate-900/60 px-5 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Active Users</h2>
          <p className="mt-0.5 text-xs text-slate-500">Live agent & client statuses</p>
        </div>
      </header>

      <div className="flex-1 p-5 space-y-4 overflow-y-auto">
        {USERS.map((u) => (
          <div
            key={u.id}
            className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-950/20 border border-slate-900 hover:border-slate-850 hover:bg-slate-950/40 transition-all duration-200"
          >
            <Avatar className="size-9 border border-slate-800 shrink-0">
              <AvatarFallback className="bg-primary/10 text-xs font-black text-primary">
                {u.avatar}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-white truncate">{u.name}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {u.status}
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">{u.role}</p>

              {/* Status Badge */}
              <div className="mt-2 inline-flex items-center text-[9px] font-bold text-slate-300 bg-slate-950/60 border border-slate-900 px-2 py-0.5 rounded-lg">
                {u.action}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
