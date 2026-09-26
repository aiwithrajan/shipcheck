'use client';

import React from 'react';
import Link from 'next/link';
import { Database, GitBranch, Shield, ArrowRight, Bot, Sparkles } from 'lucide-react';
import NavBar from '@/components/NavBar';
import AgentStudio from '@/components/AgentStudio';

export default function HomePage() {
  return (
    <>
      <div className="scan-line-wrap" aria-hidden><div className="scan-line" /></div>
      <NavBar projectId="70rd1u6b" />

      <main className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-8">

        {/* ── THE AGENT STUDIO ── */}
        <AgentStudio />

        {/* ── EXPLORE MORE ── */}
        <div className="mt-12 mb-4">
          <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#06b6d4]" />
            Explore More
          </h2>
          <p className="text-sm text-slate-400">Dive deeper into how SHIPCHECK analyzes your deployments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { href: '/analysis', label: 'Dependency Analysis', desc: 'See the full chain of dependencies the agent checked, step by step.', icon: GitBranch, badge: 'Graph View' },
            { href: '/compare', label: 'Why Not Vector Search?', desc: 'See why smart search beats keyword matching for catching real deployment bugs.', icon: Shield, badge: 'Comparison' },
            { href: '/knowledge', label: 'Knowledge Base', desc: 'Browse all 18 documents the agent uses to make decisions.', icon: Database, badge: '18 Docs' },
          ].map(({ href, label, desc, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className="group card-premium p-6 flex flex-col justify-between hover:border-[#06b6d4]/50 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 bg-[#06b6d4]/10 rounded-xl text-[#06b6d4] border border-[#06b6d4]/25">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-400 bg-[#111827] border border-[#1e293b] px-2.5 py-1 rounded">{badge}</span>
                </div>
                <div className="text-base font-bold text-white mb-2 group-hover:text-[#22d3ee] transition">{label}</div>
                <div className="text-sm text-slate-400 leading-relaxed">{desc}</div>
              </div>
              <div className="flex items-center gap-1.5 mt-5 text-sm text-[#06b6d4] font-semibold">
                Explore <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="border-t border-[#1e293b] mt-14 pt-6 pb-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0e7490] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-wide">SHIPCHECK</span>
          </div>
          <p className="text-sm text-slate-500">
            AI Agent for <span className="text-slate-300">Sanity Context MCP Hackathon</span> · Project <span className="text-[#06b6d4]">70rd1u6b</span>
          </p>
        </footer>
      </main>
    </>
  );
}
