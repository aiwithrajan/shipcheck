'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Sparkles, Terminal, ArrowRight, ShieldCheck,
  ShieldAlert, AlertOctagon, Wrench, Eye, Cpu, Activity,
  ChevronDown, ChevronUp, GitBranch, Layers, Zap,
  Plus, Database, X, PanelRightOpen, PanelRightClose,
  CircleCheck, CircleX, CircleAlert, Clock, Search, Lightbulb,
  Play, MessageCircle, ArrowDown
} from 'lucide-react';
import { AgentRunResult, AgentStep } from '@/lib/agent/preflightAgent';
import MultiHopVisualizer from './MultiHopVisualizer';
import EvidenceTrail from './EvidenceTrail';
import RemediationPanel from './RemediationPanel';
import VerdictCard from './VerdictCard';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  result?: AgentRunResult;
  isStreaming?: boolean;
}

const INITIAL_AGENT_MESSAGE: ChatMessage = {
  id: 'msg-init',
  sender: 'agent',
  text: `Hey there! 👋 I'm **SHIPCHECK** — your AI-powered deployment safety checker.

Before you push any update to production, I'll automatically scan your **dependency graph**, check for **version conflicts**, and make sure nothing breaks.

**Just ask me in plain English**, like:
_"Can I upgrade our payment service to version 4?"_

Or pick one of the ready-made checks below to see me in action! ⬇️`,
  timestamp: 'Just now',
};

const TEST_RUNS = [
  {
    id: 'canonical',
    emoji: '🔴',
    title: 'Will upgrading Payment break anything?',
    subtitle: 'v2 → v4 (known blocker)',
    prompt: 'Can I upgrade our payment service from v2 to v4 tonight?',
    tag: 'Expect: Blocked',
    tagColor: '#ef4444',
    tagBg: 'rgba(239,68,68,0.1)',
  },
  {
    id: 'positive',
    emoji: '🟢',
    title: 'Is the safe upgrade path clear?',
    subtitle: 'v2 → v3 (should pass)',
    prompt: 'Can I upgrade our payment service from v2 to v3 tonight?',
    tag: 'Expect: Safe',
    tagColor: '#10b981',
    tagBg: 'rgba(16,185,129,0.1)',
  },
  {
    id: 'exception',
    emoji: '⚡',
    title: 'Can I skip staging for a hotfix?',
    subtitle: 'Emergency security patch',
    prompt: 'Can I deploy emergency security hotfix v2.1 directly to production?',
    tag: 'Expect: Exception',
    tagColor: '#a78bfa',
    tagBg: 'rgba(167,139,250,0.1)',
  },
  {
    id: 'unscripted',
    emoji: '🟡',
    title: 'What about a service with no rules?',
    subtitle: 'Notification service upgrade',
    prompt: 'Can I upgrade notification service from v1 to v2?',
    tag: 'Expect: Warning',
    tagColor: '#f59e0b',
    tagBg: 'rgba(245,158,11,0.1)',
  },
];

const STEP_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  'THOUGHT':     { label: '🧠 Thinking',       icon: Lightbulb,  color: '#a78bfa' },
  'TOOL_CALL':   { label: '🔧 Checking data',  icon: Search,     color: '#06b6d4' },
  'OBSERVATION': { label: '📊 Found result',    icon: Eye,        color: '#f59e0b' },
  'DECISION':    { label: '⚖️ Decision made',   icon: ShieldCheck, color: '#ef4444' },
};

export default function AgentStudio() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_AGENT_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentResult, setCurrentResult] = useState<AgentRunResult | null>(null);
  const [activeCanvasTab, setActiveCanvasTab] = useState<'verdict' | 'graph' | 'remediation' | 'evidence'>('verdict');
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [canvasOpen, setCanvasOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentThinking, currentStepIndex]);

  useEffect(() => {
    if (currentResult) setCanvasOpen(true);
  }, [currentResult]);

  const toggleThought = (id: string) => {
    setExpandedThoughts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartNewAudit = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'agent',
        text: `🔄 **Fresh session started!**\n\nAsk me anything about your deployment — or pick a test scenario below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setCurrentResult(null);
    setCanvasOpen(false);
    setInputValue('');
  };

  const handleExecutePrompt = async (promptText: string, simulateFix = false) => {
    const text = promptText.trim();
    if (!text || isAgentThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsAgentThinking(true);
    setCurrentStepIndex(0);

    try {
      const isSim = simulateFix || text.toLowerCase().includes('simulate');
      const targetQuery = isSim && !text.includes('upgrade') && !text.includes('deploy')
        ? 'Can I upgrade payment service from v2 to v4 tonight?'
        : text;

      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal: targetQuery, simulateFix: isSim }),
      });

      const data = await res.json();
      const agentRes: AgentRunResult = data.agent;

      const steps = agentRes.agentSteps;
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i + 1);
        await new Promise((r) => setTimeout(r, 180));
      }

      setCurrentResult(agentRes);

      let replyMarkdown = '';
      if (agentRes.verdict === 'DO NOT SHIP YET') {
        replyMarkdown = `## 🔴 Not Safe to Deploy

I checked all the dependencies for **"${agentRes.proposal}"** and found a problem:

**What's wrong:**
• The version you want (v4) needs **Payment SDK v3.0+** to work
• But your servers are currently running **Payment SDK v2.4.1**
• If you deploy now, **payments will break** for all users

**What to do:**
1. First upgrade Payment SDK to v3.1.0
2. Then you can safely deploy v4

> 💡 Click **"Simulate Fix"** below to see what happens after upgrading the SDK — or check the **detailed report** in the side panel.`;
      } else if (agentRes.isSimulated) {
        replyMarkdown = `## 🟢 All Clear! (After Fix Applied)

I simulated upgrading **Payment SDK to v3.1.0** first, and everything checks out:

✅ Version requirements: **satisfied**
✅ Dependency conflicts: **none**
✅ Schema compatibility: **ready**

**You're good to go** once the SDK upgrade is deployed to your cluster first.`;
      } else if (agentRes.reasons.some((r) => r.severity === 'EXCEPTION_APPLIED')) {
        replyMarkdown = `## ⚡ Safe to Deploy (Special Exception)

Normally this would need a 24-hour staging period, but I found an **emergency hotfix policy** that applies here:

✅ Emergency Policy **POL-02** grants an immediate deploy bypass
✅ This overrides the standard staging requirement

**You can deploy directly** — just get sign-off from your on-call lead.`;
      } else {
        replyMarkdown = `## 🟢 Safe to Deploy!

I checked all dependencies and version requirements for **${agentRes.proposal}** — everything looks great:

✅ No version conflicts found
✅ All dependency constraints satisfied
✅ No documentation contradictions

**You're clear to ship.** 🚀`;
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: replyMarkdown,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        result: agentRes,
      };

      setMessages((prev) => [...prev, agentMsg]);
      setExpandedThoughts((prev) => ({ ...prev, [agentMsg.id]: false }));
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: '⚠️ Something went wrong while running the check. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAgentThinking(false);
    }
  };

  const canvasTabs = [
    { key: 'verdict' as const, label: 'Summary', icon: ShieldCheck, color: '#06b6d4' },
    { key: 'graph' as const, label: 'Dependency Map', icon: GitBranch, color: '#a78bfa' },
    { key: 'remediation' as const, label: 'Fix Steps', icon: Wrench, color: '#f59e0b' },
    { key: 'evidence' as const, label: 'Evidence', icon: Layers, color: '#10b981' },
  ];

  // Verdict color helper
  const getVerdictStyle = (result: AgentRunResult | null) => {
    if (!result) return { bg: '#111827', border: '#1e293b', text: '#94a3b8' };
    if (result.verdict === 'DO NOT SHIP YET' && !result.isSimulated)
      return { bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.25)', text: '#ef4444' };
    if (result.reasons?.some((r) => r.severity === 'EXCEPTION_APPLIED'))
      return { bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.25)', text: '#a78bfa' };
    return { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.25)', text: '#10b981' };
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-5 min-h-[75vh]">

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── MAIN CONVERSATION PANEL ─────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className={`flex-1 flex flex-col rounded-2xl bg-[#0d1117] border border-[#1e293b] overflow-hidden shadow-2xl transition-all duration-300 ${canvasOpen ? 'lg:max-w-[calc(100%-460px)]' : ''}`}>

        {/* ── Top Bar ── */}
        <div className="px-6 py-4 bg-[#0f1520] border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#06b6d4] to-[#0e7490] flex items-center justify-center shadow-lg shadow-[#06b6d4]/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10b981] border-2 border-[#0f1520]" />
            </div>
            <div>
              <div className="text-lg font-bold text-white flex items-center gap-2.5">
                SHIPCHECK
                <span className="text-[11px] bg-[#06b6d4]/10 text-[#22d3ee] border border-[#06b6d4]/35 px-2 py-0.5 rounded-full font-mono font-bold">
                  AI Agent
                </span>
              </div>
              <div className="text-sm text-slate-400">
                {isAgentThinking ? (
                  <span className="text-[#22d3ee] flex items-center gap-2 animate-pulse">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22d3ee]"></span>
                    </span>
                    Checking step {currentStepIndex} of ~13...
                  </span>
                ) : (
                  'Deployment safety checker • Powered by Sanity MCP'
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Canvas toggle */}
            {currentResult && (
              <button
                onClick={() => setCanvasOpen(!canvasOpen)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1e293b] border border-[#1e293b] text-slate-400 hover:text-white transition text-sm"
                title={canvasOpen ? 'Hide Details' : 'Show Details'}
              >
                {canvasOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                <span className="hidden sm:inline text-xs font-medium">{canvasOpen ? 'Hide' : 'Details'}</span>
              </button>
            )}

            {/* New session */}
            <button
              onClick={handleStartNewAudit}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#111827] hover:bg-[#1e293b] border border-[#1e293b] text-slate-400 hover:text-white transition text-sm"
              title="Start Over"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">New Check</span>
            </button>
          </div>
        </div>

        {/* ── Test Scenario Cards (shown only at start) ── */}
        {messages.length <= 1 && !isAgentThinking && (
          <div className="px-6 pt-6 pb-3">
            <div className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
              <Play className="w-4 h-4 text-[#06b6d4]" />
              Try a demo check to see how it works:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEST_RUNS.map((run) => (
                <button
                  key={run.id}
                  onClick={() => handleExecutePrompt(run.prompt)}
                  disabled={isAgentThinking}
                  className="text-left p-5 rounded-xl bg-[#111827] hover:bg-[#161d2e] border border-[#1e293b] hover:border-[#334155] transition group disabled:opacity-50"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl leading-none mt-0.5">{run.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-white group-hover:text-[#22d3ee] transition mb-1">
                        {run.title}
                      </div>
                      <div className="text-sm text-slate-500 mb-2">
                        {run.subtitle}
                      </div>
                      <span
                        className="text-xs font-mono font-bold px-2 py-1 rounded-md inline-block"
                        style={{ color: run.tagColor, background: run.tagBg }}
                      >
                        {run.tag}
                      </span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-[#06b6d4] group-hover:translate-x-1 transition shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Message Stream ── */}
        <div className="flex-1 px-6 py-6 overflow-y-auto space-y-6 bg-[#0b0f1a]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[88%] lg:max-w-[78%]">
                {/* Sender label */}
                <div className="flex items-center gap-2 mb-2 text-sm px-1">
                  {msg.sender === 'agent' ? (
                    <>
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0e7490] flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-slate-300 font-semibold">SHIPCHECK</span>
                    </>
                  ) : (
                    <span className="text-slate-400 font-medium">You</span>
                  )}
                  <span className="text-slate-600 text-xs">{msg.timestamp}</span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-6 py-5 text-[15px] leading-[1.7] shadow-lg ${
                    msg.sender === 'user'
                      ? 'bg-[#1e293b] border border-[#334155] text-white rounded-tr-md'
                      : 'bg-[#111827] border border-[#1e293b] text-slate-200 rounded-tl-md'
                  }`}
                  style={msg.result ? {
                    borderColor: getVerdictStyle(msg.result).border,
                    background: `linear-gradient(135deg, #111827 0%, ${getVerdictStyle(msg.result).bg} 100%)`,
                  } : {}}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Action Buttons — friendly labels */}
                  {msg.result && (
                    <div className="mt-5 pt-4 border-t border-[#1e293b]/60 flex flex-wrap items-center gap-3">
                      {msg.result.verdict === 'DO NOT SHIP YET' && !msg.result.isSimulated && (
                        <button
                          onClick={() => handleExecutePrompt('Simulate upgrading Payment SDK to v3.1.0 in the cluster', true)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b] text-sm font-semibold transition"
                        >
                          <Zap className="w-4 h-4" />
                          Simulate Fix
                        </button>
                      )}

                      <button
                        onClick={() => { setActiveCanvasTab('remediation'); setCanvasOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#06b6d4]/10 hover:bg-[#06b6d4]/15 border border-[#06b6d4]/30 text-[#22d3ee] text-sm font-semibold transition"
                      >
                        <Wrench className="w-4 h-4" />
                        View Fix Steps
                      </button>

                      <button
                        onClick={() => { setActiveCanvasTab('graph'); setCanvasOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#a78bfa]/10 hover:bg-[#a78bfa]/15 border border-[#a78bfa]/30 text-[#a78bfa] text-sm font-semibold transition"
                      >
                        <GitBranch className="w-4 h-4" />
                        See Dependency Map
                      </button>
                    </div>
                  )}

                  {/* Collapsible Agent Reasoning — simplified labels */}
                  {msg.result && msg.result.agentSteps && (
                    <div className="mt-4 pt-3 border-t border-[#1e293b]/60">
                      <button
                        onClick={() => toggleThought(msg.id)}
                        className="w-full flex items-center justify-between text-sm text-slate-400 hover:text-white bg-[#0d1117] p-3.5 rounded-xl border border-[#1e293b] transition"
                      >
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-[#a78bfa]" />
                          <span className="font-semibold text-slate-300">
                            How did I figure this out?
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {msg.result.agentSteps.length} steps
                          </span>
                        </div>
                        {expandedThoughts[msg.id] ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>

                      {expandedThoughts[msg.id] && (
                        <div className="mt-3 space-y-2 max-h-[420px] overflow-y-auto">
                          {msg.result.agentSteps.map((step) => {
                            const meta = STEP_TYPE_LABELS[step.type] || STEP_TYPE_LABELS['THOUGHT'];
                            return (
                              <div
                                key={step.id}
                                className="flex items-start gap-3 p-4 rounded-xl bg-[#0f1520] border border-[#1e293b] text-sm"
                              >
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                                  style={{ background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}
                                >
                                  <span className="text-sm">{meta.label.split(' ')[0]}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-200 text-xs uppercase tracking-wide">
                                      Step {step.stepNumber}: {meta.label.split(' ').slice(1).join(' ')}
                                    </span>
                                    {step.toolName && (
                                      <span className="text-[11px] font-mono text-[#22d3ee] bg-[#06b6d4]/10 px-1.5 py-0.5 rounded">
                                        {step.toolName}()
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-slate-400 leading-relaxed">{step.detail}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Thinking Indicator — friendly */}
          {isAgentThinking && (
            <div className="flex justify-start">
              <div className="max-w-[78%]">
                <div className="flex items-center gap-2 mb-2 text-sm px-1">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#06b6d4] to-[#0e7490] flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-slate-300 font-semibold">SHIPCHECK</span>
                </div>
                <div className="rounded-2xl rounded-tl-md px-6 py-5 bg-[#111827] border border-[#06b6d4]/20 shadow-lg">
                  <div className="flex items-center gap-3 text-[15px] text-[#22d3ee] mb-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#06b6d4] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#22d3ee]"></span>
                    </span>
                    <span className="font-semibold">Checking your deployment...</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { done: currentStepIndex >= 2, label: 'Looking up service in knowledge base' },
                      { done: currentStepIndex >= 5, label: 'Scanning version dependencies' },
                      { done: currentStepIndex >= 8, label: 'Checking your live cluster' },
                      { done: currentStepIndex >= 11, label: 'Evaluating policies & exceptions' },
                      { done: currentStepIndex >= 13, label: 'Forming final verdict' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm">
                        {item.done ? (
                          <CircleCheck className="w-4 h-4 text-[#10b981] shrink-0" />
                        ) : currentStepIndex >= (i * 3) ? (
                          <div className="w-4 h-4 rounded-full border-2 border-[#06b6d4] border-t-transparent animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#334155] shrink-0" />
                        )}
                        <span className={item.done ? 'text-slate-300' : currentStepIndex >= (i * 3) ? 'text-[#22d3ee]' : 'text-slate-600'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input Bar — friendly ── */}
        <div className="px-6 py-5 bg-[#0f1520] border-t border-[#1e293b]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleExecutePrompt(inputValue);
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1">
              <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask anything about your deployment..."
                disabled={isAgentThinking}
                className="w-full bg-[#0b0f1a] border border-[#1e293b] rounded-xl pl-12 pr-5 py-4 text-base text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4]/60 transition"
              />
            </div>
            <button
              type="submit"
              disabled={isAgentThinking || !inputValue.trim()}
              className="bg-[#06b6d4] hover:bg-[#22d3ee] disabled:opacity-30 text-white font-bold px-7 py-4 rounded-xl text-sm flex items-center gap-2 transition shrink-0 shadow-lg shadow-[#06b6d4]/20"
            >
              <Send className="w-4 h-4" />
              Check
            </button>
          </form>

          {/* Powered by footer inside input area */}
          <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <Database className="w-3 h-3" />
              Connected to Sanity Lake <span className="text-slate-400 font-mono">70rd1u6b</span>
            </span>
            <span>•</span>
            <span>Model Context Protocol (MCP)</span>
            <span>•</span>
            <span>Autonomous ReAct Agent</span>
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════ */}
      {/* ── DETAIL PANEL (slides in when results exist) ─────── */}
      {/* ══════════════════════════════════════════════════════════ */}
      {canvasOpen && currentResult && (
        <div className="w-full lg:w-[450px] flex flex-col rounded-2xl bg-[#0d1117] border border-[#1e293b] overflow-hidden shadow-2xl shrink-0 animate-fade-in">

          {/* Panel Header */}
          <div className="px-5 py-4 bg-[#0f1520] border-b border-[#1e293b] flex items-center justify-between">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {canvasTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveCanvasTab(tab.key)}
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 whitespace-nowrap ${
                      activeCanvasTab === tab.key
                        ? 'bg-[#1e293b] text-white border border-[#334155]'
                        : 'text-slate-500 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" style={{ color: tab.color }} />
                    <span className="hidden xl:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCanvasOpen(false)}
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-[#1e293b] transition ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1 p-5 overflow-y-auto bg-[#0b0f1a]">
            {activeCanvasTab === 'verdict' && (
              <div className="space-y-5">
                <VerdictCard
                  result={currentResult as any}
                  onSimulate={() => handleExecutePrompt(currentResult.proposal, true)}
                  isSimulating={isAgentThinking}
                />

                {/* Telemetry — simplified */}
                <div className="p-5 rounded-xl bg-[#111827] border border-[#1e293b] space-y-3">
                  <div className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#06b6d4]" />
                    How the Agent Worked
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Time taken</span>
                    <strong className="text-white">{currentResult.telemetry.latencyMs} ms</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Data sources checked</span>
                    <strong className="text-[#22d3ee]">{currentResult.telemetry.toolsInvoked}</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Reasoning steps</span>
                    <strong className="text-[#a78bfa]">{currentResult.telemetry.totalSteps}</strong>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>Data processed</span>
                    <strong className="text-[#10b981]">~{currentResult.telemetry.tokensEstimated} tokens</strong>
                  </div>
                </div>
              </div>
            )}

            {activeCanvasTab === 'graph' && (
              <MultiHopVisualizer
                nodes={currentResult.graph.nodes}
                edges={currentResult.graph.edges}
                multiHopExplanation={currentResult.summary}
              />
            )}

            {activeCanvasTab === 'remediation' && currentResult.remediationPlan && (
              <RemediationPanel
                plan={currentResult.remediationPlan}
                isSimulated={currentResult.isSimulated}
              />
            )}

            {activeCanvasTab === 'evidence' && (
              <EvidenceTrail reasons={currentResult.reasons} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
