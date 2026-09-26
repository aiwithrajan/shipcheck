'use client';

import React, { useState } from 'react';
import {
  Bot, Terminal, Wrench, Eye, CheckCircle2, ChevronDown,
  ChevronUp, Cpu, Sparkles, Activity, ShieldAlert, Zap,
  Layers, ArrowRight, Check, Copy, Lightbulb, Search
} from 'lucide-react';
import { AgentStep } from '@/lib/agent/preflightAgent';

interface AgentTerminalProps {
  steps: AgentStep[];
  telemetry?: {
    totalSteps: number;
    toolsInvoked: number;
    latencyMs: number;
    tokensEstimated: number;
  };
  isAgentRunning?: boolean;
}

const STEP_META: Record<string, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  'THOUGHT':     { label: 'Thinking',      emoji: '🧠', color: '#a78bfa', bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.25)' },
  'TOOL_CALL':   { label: 'Checking Data', emoji: '🔧', color: '#06b6d4', bg: 'rgba(6,182,212,0.06)',   border: 'rgba(6,182,212,0.25)' },
  'OBSERVATION': { label: 'Found Result',  emoji: '📊', color: '#f59e0b', bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.25)' },
  'DECISION':    { label: 'Decision',      emoji: '⚖️', color: '#ef4444', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.25)' },
};

export default function AgentTerminal({
  steps,
  telemetry,
  isAgentRunning = false,
}: AgentTerminalProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'thoughts' | 'tools'>('all');

  const filteredSteps = steps.filter((s) => {
    if (activeTab === 'thoughts') return s.type === 'THOUGHT' || s.type === 'DECISION';
    if (activeTab === 'tools') return s.type === 'TOOL_CALL' || s.type === 'OBSERVATION';
    return true;
  });

  return (
    <div className="card-premium shadow-2xl mb-8 overflow-hidden border border-[#1e293b]">
      {/* Top Bar */}
      <div className="bg-[#0f1520] px-6 py-4 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Agent info */}
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#06b6d4] to-[#0e7490] flex items-center justify-center shadow-lg shadow-[#06b6d4]/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10b981] border-2 border-[#0f1520]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">
                Agent Reasoning Trace
              </span>
              <span className="text-xs bg-[#06b6d4]/10 text-[#22d3ee] border border-[#06b6d4]/35 px-2 py-0.5 rounded font-mono font-bold">
                ReAct
              </span>
            </div>
            <div className="text-sm text-slate-400 mt-0.5">
              Step-by-step breakdown of how SHIPCHECK reached its verdict
            </div>
          </div>
        </div>

        {/* Right: Telemetry & Controls */}
        <div className="flex items-center gap-3">
          {telemetry && (
            <div className="flex items-center gap-2 text-sm">
              <span className="bg-[#111827] border border-[#1e293b] text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-[#06b6d4]" />
                {telemetry.toolsInvoked} tools
              </span>
              <span className="bg-[#111827] border border-[#1e293b] text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#10b981]" />
                {telemetry.latencyMs}ms
              </span>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="bg-[#111827] p-0.5 rounded-lg border border-[#1e293b] flex items-center text-sm">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'all' ? 'bg-[#1e293b] text-white font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              All ({steps.length})
            </button>
            <button
              onClick={() => setActiveTab('thoughts')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'thoughts' ? 'bg-[#1e293b] text-[#a78bfa] font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Thinking
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-3 py-1.5 rounded transition ${
                activeTab === 'tools' ? 'bg-[#1e293b] text-[#22d3ee] font-bold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Data
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg bg-[#111827] border border-[#1e293b] text-slate-400 hover:text-white transition"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Steps Body */}
      {isOpen && (
        <div className="p-6 space-y-3 bg-[#0b0f1a]">
          {isAgentRunning && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#06b6d4]/5 border border-[#06b6d4]/25 text-base text-[#22d3ee] animate-pulse">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Agent is checking dependencies and scanning your cluster...</span>
            </div>
          )}

          {filteredSteps.map((step) => {
            const meta = STEP_META[step.type] || STEP_META['THOUGHT'];

            return (
              <div
                key={step.id}
                className="rounded-xl border p-5 space-y-2 transition relative overflow-hidden"
                style={{
                  background: meta.bg,
                  borderColor: meta.border,
                }}
              >
                {/* Left accent strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px]"
                  style={{ background: meta.color }}
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pl-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{meta.emoji}</span>
                    <span
                      className="text-sm font-bold uppercase tracking-wide"
                      style={{ color: meta.color }}
                    >
                      Step {step.stepNumber}: {meta.label}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {step.title}
                    </span>
                  </div>

                  {step.toolName && (
                    <span className="text-sm text-[#22d3ee] bg-[#06b6d4]/10 border border-[#06b6d4]/25 px-2.5 py-1 rounded font-mono">
                      {step.toolName}()
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 leading-relaxed pl-3">
                  {step.detail}
                </p>

                {/* Tool Arguments */}
                {step.toolArgs && (
                  <div className="pl-3 pt-1">
                    <span className="text-xs uppercase font-bold text-slate-500 block mb-1.5">
                      Input Parameters:
                    </span>
                    <pre className="bg-[#0a0e1a] border border-[#1e293b] rounded-lg p-3 text-sm text-[#93c5fd] overflow-x-auto font-mono">
                      {JSON.stringify(step.toolArgs, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Tool Output */}
                {step.toolOutput && (
                  <div className="pl-3 pt-1">
                    <span className="text-xs uppercase font-bold text-slate-500 block mb-1.5">
                      Data Retrieved:
                    </span>
                    <pre className="bg-[#0a0e1a] border border-[#1e293b] rounded-lg p-3 text-sm text-[#fde047] overflow-x-auto font-mono max-h-40">
                      {JSON.stringify(step.toolOutput, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
