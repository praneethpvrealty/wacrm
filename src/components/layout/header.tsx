"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Menu, Settings as SettingsIcon, User, Search } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inbox": "Inbox",
  "/contacts": "Contacts",
  "/pipelines": "Pipelines",
  "/broadcasts": "Broadcasts",
  "/automations": "Automations",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const match = Object.entries(pageTitles).find(([path]) =>
    pathname.startsWith(path),
  );
  return match ? match[1] : "Dashboard";
}

interface HeaderProps {
  /** Wired to the shell's drawer state. Used only on mobile — the
   *  hamburger button is hidden on lg+. */
  onOpenSidebar?: () => void;
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const title = getPageTitle(pathname);

  const initial =
    profile?.full_name?.charAt(0)?.toUpperCase() ??
    profile?.email?.charAt(0)?.toUpperCase() ??
    "U";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-900/60 bg-slate-950/80 backdrop-blur-md px-4 lg:px-6 relative z-20">
      <div className="flex min-w-0 items-center gap-2">
        {/* Hamburger — mobile only. 44×44 hit target per Apple HIG. */}
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-800/40 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base font-bold text-white sm:text-lg mr-4">
          {title}
        </h1>
      </div>

      {/* Global Search Bar mockup */}
      <div className="relative hidden md:block w-72 lg:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search deals, contacts, or tasks..."
          className="w-full bg-slate-900/40 border border-slate-900 rounded-lg pl-9 pr-12 py-1.5 text-xs text-slate-200 placeholder:text-slate-650 focus:outline-none focus:border-primary transition-all focus:bg-slate-950"
        />
        <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-800 bg-slate-950 px-1.5 font-mono text-[9px] font-medium text-slate-500">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-slate-800/70 focus:bg-slate-800/70 focus:outline-none data-popup-open:bg-slate-800/70 sm:gap-3 sm:pl-1 sm:pr-3"
          aria-label="Open account menu"
        >
          <Avatar className="size-8">
            {profile?.avatar_url ? (
              <AvatarImage
                src={profile.avatar_url}
                alt={profile.full_name ?? "Avatar"}
              />
            ) : null}
            <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <span className="hidden text-sm font-medium text-white sm:inline">
            {profile?.full_name ?? "User"}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="min-w-56 bg-slate-900 text-slate-100 ring-slate-700"
        >
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium text-white">
              {profile?.full_name ?? "User"}
            </p>
            <p className="truncate text-xs text-slate-400">
              {profile?.email ?? ""}
            </p>
          </div>
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem
            render={
              <Link
                href="/settings?tab=profile"
                className="text-slate-200 focus:bg-slate-800 focus:text-white"
              />
            }
          >
            <User className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            render={
              <Link
                href="/settings?tab=whatsapp"
                className="text-slate-200 focus:bg-slate-800 focus:text-white"
              />
            }
          >
            <SettingsIcon className="size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-800" />
          <DropdownMenuItem
            onClick={signOut}
            className="text-slate-200 focus:bg-slate-800 focus:text-white"
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
