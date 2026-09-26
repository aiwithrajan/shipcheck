'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitBranch, Clock, Home, BarChart2, Layers, Database, Activity, Bot, Cpu } from 'lucide-react';

const NAV_LINKS = [
  { href: '/',          label: 'Agent Terminal', icon: Bot },
  { href: '/analysis',  label: 'Cognitive Trace',   icon: GitBranch },
  { href: '/compare',   label: 'Comparison',        icon: BarChart2 },
  { href: '/knowledge', label: 'Knowledge Base',    icon: Database },
];

interface NavBarProps {
  projectId?: string;
  latency?: number | null;
}

export default function NavBar({ projectId, latency }: NavBarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[#1e293b] bg-[#0a0e1a]/95 backdrop-blur-md">
      <div className="w-full max-w-screen-2xl mx-auto px-6 lg:px-12 py-3.5 flex items-center justify-between gap-6">

        {/* Logo & Agent Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0e7490] flex items-center justify-center shadow-lg shadow-[#06b6d4]/25 animate-float relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10b981]" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold text-white tracking-tight leading-none">
                SHIPCHECK
              </span>
              <span className="text-[10px] bg-[#06b6d4]/10 text-[#22d3ee] border border-[#06b6d4]/40 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wide">
                AI AGENT
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous Pre-Flight Release Gatekeeper
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                  active
                    ? 'bg-[#06b6d4]/10 text-[#22d3ee] border border-[#06b6d4]/40 shadow-sm shadow-[#06b6d4]/10'
                    : 'text-slate-400 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status badges */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-2 bg-[#0a1a14] border border-[#10b981]/30 text-[#10b981] px-3 py-1.5 rounded-lg font-mono text-xs font-semibold">
            <span className="neon-dot" />
            <span className="hidden sm:inline">Sanity Lake</span>
            <span>{projectId || '70rd1u6b'}</span>
          </span>
          {latency != null && (
            <span className="hidden sm:flex items-center gap-1.5 bg-[#111827] border border-[#1e293b] text-slate-300 px-3 py-1.5 rounded-lg font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-[#06b6d4]" />
              {latency}ms
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
