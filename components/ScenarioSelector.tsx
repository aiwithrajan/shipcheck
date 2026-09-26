'use client';

import React, { useState } from 'react';
import { Send, Terminal, ArrowRight, Loader2, Bot, Sparkles, Command, ShieldCheck } from 'lucide-react';

interface ScenarioSelectorProps {
  onRunScenario: (proposal: string) => void;
  isLoading: boolean;
}

const PRESET_SCENARIOS = [
  {
    id: 'canonical',
    badge: 'CANONICAL FAILURE AUDIT',
    badgeColor: '#ff2a2a',
    badgeBg: '#200507',
    badgeBorder: 'rgba(255,42,42,0.4)',
    title: 'Can I upgrade our payment service from v2 to v4 tonight?',
    sub: 'Expected: DO NOT SHIP YET — Agent discovers 2-hop SDK collision & schema drift',
    statusTag: '2-HOP BLOCKER',
    statusColor: '#ff4d4d',
    statusBg: '#1a0607',
    dot: '🚨',
  },
  {
    id: 'positive',
    badge: 'POSITIVE CONTROL CHECK',
    badgeColor: '#4ade80',
    badgeBg: '#071508',
    badgeBorder: 'rgba(74,222,128,0.3)',
    title: 'Can I upgrade our payment service from v2 to v3 tonight?',
    sub: 'Expected: SAFE TO SHIP — Agent verifies backward compatibility across all hops',
    statusTag: 'CONSTRAINTS CLEAR',
    statusColor: '#4ade80',
    statusBg: '#060e08',
    dot: '🟢',
  },
  {
    id: 'exception',
    badge: 'POLICY EXCEPTION EVALUATION',
    badgeColor: '#a78bfa',
    badgeBg: '#120a1e',
    badgeBorder: 'rgba(167,139,250,0.3)',
    title: 'Can I deploy emergency security hotfix v2.1 directly to production?',
    sub: 'Expected: SAFE TO SHIP — Agent detects isExceptionOf link to bypass 24h soak',
    statusTag: 'EXCEPTION GRANTED',
    statusColor: '#a78bfa',
    statusBg: '#0f0a1a',
    dot: '⚡',
  },
  {
    id: 'unscripted',
    badge: 'UNCONSTRAINED SERVICE AUDIT',
    badgeColor: '#facc15',
    badgeBg: '#16130a',
    badgeBorder: 'rgba(250,204,21,0.25)',
    title: 'Can I upgrade notification service from v1 to v2?',
    sub: 'Expected: SAFE TO SHIP — Agent confirms zero upstream blocking dependencies',
    statusTag: 'NO CONFLICTS',
    statusColor: '#facc15',
    statusBg: '#141004',
    dot: '🎲',
  },
];

export default function ScenarioSelector({ onRunScenario, isLoading }: ScenarioSelectorProps) {
  const [customInput, setCustomInput] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim() || isLoading) return;
    setActiveId(null);
    onRunScenario(customInput);
  };

  const handleScenario = (s: typeof PRESET_SCENARIOS[0]) => {
    setCustomInput(s.title);
    setActiveId(s.id);
    onRunScenario(s.title);
  };

  return (
    <div className="card-premium shadow-2xl mb-8 border border-[#232634]">
      {/* Console Header */}
      <div className="px-6 pt-5 pb-4 border-b border-[#1b1c24] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ff2a2a]/10 rounded-xl text-[#ff2a2a] border border-[#ff2a2a]/30">
            <Command className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
              Agent Command Interface
              <span className="text-neutral-500 font-mono font-normal text-xs">// PROMPT INPUT</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-0.5 font-mono">
              Prompt the autonomous agent or trigger a pre-flight test case below
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold tracking-wide bg-[#060e08] text-[#4ade80] px-3 py-1.5 rounded-lg border border-[#16422c]/60 flex items-center gap-2">
            <span className="neon-dot" />
            Agent Ready · Sanity Lake Connected
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Agent Command Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-neutral-500 font-mono text-xs font-bold">
              <Bot className="w-4 h-4 text-[#ff2a2a]" />
              <span className="text-[#ff5555]">agent&gt;</span>
            </div>
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder='Instruct agent: e.g. "Can I upgrade payment service from v2 to v4 tonight?"'
              className="w-full bg-[#030406] border border-[#1e2029] rounded-xl pl-24 pr-4 py-3.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-[#ff2a2a]/80 focus:ring-1 focus:ring-[#ff2a2a]/40 transition font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !customInput.trim()}
            className="group relative bg-[#ff2a2a] hover:bg-[#e01a1a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black px-7 py-3.5 rounded-xl text-sm tracking-wider uppercase flex items-center justify-center gap-2 transition shadow-lg shadow-[#ff2a2a]/25 overflow-hidden min-w-[170px]"
          >
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Agent Reasoning…</>
            ) : (
              <><Sparkles className="w-4 h-4" />Instruct Agent</>
            )}
          </button>
        </form>

        {/* Scenarios Header */}
        <div className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#1b1c24]" />
          <span className="flex items-center gap-1.5 font-mono">
            <Terminal className="w-3.5 h-3.5 text-[#ff2a2a]" />
            Preset Agent Evaluation Scenarios
          </span>
          <span className="h-px flex-1 bg-[#1b1c24]" />
        </div>

        {/* Scenario Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => handleScenario(s)}
              disabled={isLoading}
              className={`group p-5 rounded-xl border text-left transition relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed ${
                activeId === s.id
                  ? 'bg-[#0d0e14] shadow-lg border-[#ff2a2a]/60'
                  : 'bg-[#08090d] border-[#181922] hover:bg-[#0c0d12] hover:border-[#2b2e3e]'
              }`}
            >
              {/* Left accent bar */}
              <span
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl opacity-0 group-hover:opacity-100 transition"
                style={{ background: s.badgeColor }}
              />

              <div className="flex items-center justify-between mb-2.5">
                <span
                  className="text-xs font-black tracking-wide font-mono px-2.5 py-1 rounded"
                  style={{ color: s.badgeColor, background: s.badgeBg, border: `1px solid ${s.badgeBorder}` }}
                >
                  {s.dot} {s.badge}
                </span>
                <span
                  className="text-xs font-mono font-bold px-2.5 py-1 rounded"
                  style={{ color: s.statusColor, background: s.statusBg }}
                >
                  {s.statusTag}
                </span>
              </div>

              <div className="text-sm font-bold text-white leading-snug mb-1.5">
                {s.title}
              </div>
              <div className="text-xs text-neutral-400 font-mono flex items-center justify-between gap-2">
                <span className="truncate">{s.sub}</span>
                <ArrowRight className="w-4 h-4 shrink-0 text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
