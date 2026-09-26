'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot, Send, Sparkles, Terminal, ArrowRight, ShieldCheck,
  ShieldAlert, AlertOctagon, Wrench, Eye, Cpu, Activity,
  Volume2, VolumeX, RotateCcw, Copy, Check, ChevronDown,
  ChevronUp, GitBranch, Layers, FileCode, CheckCircle2, Zap
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

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: 'msg-welcome',
  sender: 'agent',
  text: `Hello, engineer. I am **SHIPCHECK**, your autonomous pre-flight production release gatekeeper.

I am connected to your **Sanity Content Lake** (\`70rd1u6b\`) via **Model Context Protocol (MCP)**. Before any change is deployed to production, I autonomously traverse multi-hop dependency graphs, audit cluster versions, and resolve architectural contradictions.

**Prompt me with any proposed change or select a test case below.**`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

const SUGGESTED_PROMPTS = [
  'Can I upgrade payment service from v2 to v4 tonight?',
  'Can I upgrade payment service from v2 to v3 tonight?',
  'Can I deploy emergency security hotfix v2.1 directly to production?',
  'Can I upgrade notification service from v1 to v2?',
  'What is the remediation plan for the SDK blocker?',
  'Simulate upgrading Payment SDK to v3.1.0 in the cluster',
];

export default function AgentWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isAgentThinking, setIsAgentThinking] = useState(false);
  const [activeArtifactTab, setActiveArtifactTab] = useState<'verdict' | 'graph' | 'remediation' | 'evidence'>('verdict');
  const [currentResult, setCurrentResult] = useState<AgentRunResult | null>(null);
  const [expandedThoughtIds, setExpandedThoughtIds] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAgentThinking]);

  const toggleThoughts = (msgId: string) => {
    setExpandedThoughtIds((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSendMessage = async (textToSend?: string, simulateFix = false) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isAgentThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsAgentThinking(true);

    try {
      // Check if it's a follow-up asking for simulation
      const wantsSimulation = simulateFix || text.toLowerCase().includes('simulate');
      const proposalText = wantsSimulation && !text.includes('upgrade') && !text.includes('deploy')
        ? 'Can I upgrade payment service from v2 to v4 tonight?'
        : text;

      const res = await fetch('/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal: proposalText, simulateFix: wantsSimulation }),
      });

      const data = await res.json();
      const agentRes: AgentRunResult = data.agent;

      setCurrentResult(agentRes);

      let agentReplyText = '';
      if (agentRes.verdict === 'DO NOT SHIP YET') {
        agentReplyText = `🚨 **VERDICT: DO NOT SHIP YET**\n\nI have completed the multi-hop pre-flight audit for **${agentRes.proposal}**.\n\n` +
          `• **Critical Blocker:** Upstream \`Payment SDK\` version collision (requires \`>= v3.0.0\`, but active production cluster runs \`v2.4.1\`).\n` +
          `• **Documentation Drift:** Legacy webhook XML specification contradicted by official v4 JSON v2 standard.\n\n` +
          `I have generated an automated **4-phase remediation plan** and rollback commands. Deployment is locked.`;
      } else if (agentRes.isSimulated) {
        agentReplyText = `🟢 **VERDICT: SAFE TO SHIP (SIMULATED FIX ACTIVE)**\n\n` +
          `With \`Payment SDK v3.1.0\` simulated in the cluster, the 2-hop collision is **cleared**. All upstream constraints are satisfied. You may safely proceed with the release once the prerequisite patch is applied.`;
      } else {
        agentReplyText = `🟢 **VERDICT: SAFE TO SHIP**\n\n` +
          `I have verified all multi-hop constraints and database compatibility specifications across the Sanity Content Lake. Zero blocking collisions detected. Green light for production rollout.`;
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: agentReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        result: agentRes,
      };

      setMessages((prev) => [...prev, agentMsg]);
      // Auto-expand the latest thoughts
      setExpandedThoughtIds((prev) => ({ ...prev, [agentMsg.id]: true }));
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: `⚠️ An error occurred while communicating with the Sanity Context Agent. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAgentThinking(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[720px] mb-12">
      {/* ─── LEFT: AGENT CONVERSATION & COGNITIVE STREAM (7 Cols) ─── */}
      <div className="lg:col-span-7 flex flex-col rounded-2xl bg-[#07080c] border border-[#1e2029] overflow-hidden shadow-2xl">
        {/* Agent Header HUD */}
        <div className="px-5 py-3.5 bg-[#090a10] border-b border-[#1b1c24] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#ff2a2a] to-[#770000] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#07080c] rounded-[9px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#ff4d4d]" />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border border-[#07080c] animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white font-mono tracking-tight">SHIPCHECK Agent</span>
                <span className="text-[10px] bg-[#220708] text-[#ff5555] border border-[#ff2a2a]/40 px-2 py-0.5 rounded font-mono font-bold uppercase">
                  ReAct Loop Active
                </span>
              </div>
              <div className="text-[11px] text-neutral-400 font-mono">
                Sanity Content Lake (<span className="text-neutral-200">70rd1u6b</span>) · MCP Protocol
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-[#041208] text-[#4ade80] border border-[#22c55e]/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-ping" />
              ONLINE
            </span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 max-h-[560px] bg-[#040407]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-neutral-500 px-1">
                {msg.sender === 'agent' ? (
                  <>
                    <Bot className="w-3.5 h-3.5 text-[#ff4d4d]" />
                    <span className="text-neutral-300 font-bold">SHIPCHECK Agent</span>
                  </>
                ) : (
                  <span className="text-neutral-400">DevOps Engineer</span>
                )}
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-2xl p-4.5 max-w-[92%] sm:max-w-[85%] text-sm leading-relaxed font-sans shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-[#181a24] border border-[#2c2f40] text-white rounded-tr-sm'
                    : 'bg-[#0a0b10] border border-[#1d1f2a] text-neutral-200 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Collapsible Agent Thought Process */}
                {msg.result && msg.result.agentSteps && (
                  <div className="mt-4 pt-3 border-t border-[#1a1b24]">
                    <button
                      onClick={() => toggleThoughts(msg.id)}
                      className="w-full flex items-center justify-between text-xs font-mono text-neutral-400 hover:text-white bg-[#06070a] p-2.5 rounded-xl border border-[#1b1c24] transition"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#c084fc]" />
                        <span className="font-bold text-neutral-200">
                          Autonomous ReAct Reasoning Trace
                        </span>
                        <span className="text-[#38bdf8] text-[11px]">
                          ({msg.result.agentSteps.length} steps · {msg.result.telemetry.toolsInvoked} tools)
                        </span>
                      </div>
                      {expandedThoughtIds[msg.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedThoughtIds[msg.id] && (
                      <div className="mt-3 space-y-2.5 pl-1 max-h-72 overflow-y-auto">
                        {msg.result.agentSteps.map((step) => (
                          <div
                            key={step.id}
                            className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                              step.type === 'THOUGHT'
                                ? 'bg-[#10081a] border-[#c084fc]/30 text-[#e9d5ff]'
                                : step.type === 'TOOL_CALL'
                                ? 'bg-[#04121d] border-[#38bdf8]/30 text-[#bae6fd]'
                                : step.type === 'OBSERVATION'
                                ? 'bg-[#131005] border-[#facc15]/30 text-[#fef08a]'
                                : 'bg-[#180507] border-[#ff2a2a]/40 text-[#fecaca]'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wider">
                              <span>Step {step.stepNumber}: {step.type}</span>
                              {step.toolName && (
                                <span className="text-[#38bdf8]">{step.toolName}()</span>
                              )}
                            </div>
                            <p className="text-neutral-300 font-sans">{step.detail}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking Indicator */}
          {isAgentThinking && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-[#090b12] border border-[#38bdf8]/30 text-xs font-mono text-[#38bdf8] animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-[#c084fc]" />
              <span>Agent is reasoning, calling Sanity MCP tools, and auditing 2-hop constraints...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-5 py-2.5 bg-[#07080c] border-t border-[#161720] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider shrink-0">
            Quick Prompts:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isAgentThinking}
              className="text-xs font-mono text-neutral-300 hover:text-white bg-[#0e1017] hover:bg-[#181a24] border border-[#1e2029] hover:border-[#ff2a2a]/40 px-3 py-1.5 rounded-lg whitespace-nowrap transition disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#090a10] border-t border-[#1b1c24]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ff4d4d] font-mono font-bold text-xs pointer-events-none">
                agent&gt;
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder='Ask agent: e.g. "Can I upgrade payment service from v2 to v4 tonight?"'
                disabled={isAgentThinking}
                className="w-full bg-[#040407] border border-[#1e2029] rounded-xl pl-20 pr-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#ff2a2a]/70 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isAgentThinking || !inputValue.trim()}
              className="bg-[#ff2a2a] hover:bg-[#e01a1a] disabled:opacity-40 text-black font-black px-6 py-3 rounded-xl text-sm font-mono uppercase tracking-wider flex items-center gap-2 transition shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Instruct</span>
            </button>
          </form>
        </div>
      </div>

      {/* ─── RIGHT: LIVE ARTIFACT & ENVIRONMENT CANVAS (5 Cols) ─── */}
      <div className="lg:col-span-5 flex flex-col rounded-2xl bg-[#07080c] border border-[#1e2029] overflow-hidden shadow-2xl">
        {/* Canvas Tabs */}
        <div className="px-4 py-3 bg-[#090a10] border-b border-[#1b1c24] flex items-center justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveArtifactTab('verdict')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                activeArtifactTab === 'verdict'
                  ? 'bg-[#181924] text-white border border-[#2b2e3e]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff4d4d]" />
              Verdict
            </button>
            <button
              onClick={() => setActiveArtifactTab('graph')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                activeArtifactTab === 'graph'
                  ? 'bg-[#181924] text-white border border-[#2b2e3e]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-[#38bdf8]" />
              2-Hop Graph
            </button>
            <button
              onClick={() => setActiveArtifactTab('remediation')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                activeArtifactTab === 'remediation'
                  ? 'bg-[#181924] text-white border border-[#2b2e3e]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5 text-[#facc15]" />
              Remediation
            </button>
            <button
              onClick={() => setActiveArtifactTab('evidence')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                activeArtifactTab === 'evidence'
                  ? 'bg-[#181924] text-white border border-[#2b2e3e]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#c084fc]" />
              Evidence
            </button>
          </div>

          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest hidden sm:inline">
            Artifact Canvas
          </span>
        </div>

        {/* Canvas Body */}
        <div className="flex-1 p-5 overflow-y-auto max-h-[660px] bg-[#040407]">
          {!currentResult ? (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-6 text-neutral-500 font-mono">
              <Bot className="w-12 h-12 text-neutral-700 mb-3 animate-float" />
              <div className="text-sm font-bold text-neutral-400">Agent Canvas Idle</div>
              <p className="text-xs text-neutral-600 mt-1 max-w-xs">
                Instruct the agent on the left. The live verdict, 2-hop graph, and remediation script will appear here.
              </p>
            </div>
          ) : (
            <div>
              {/* Tab 1: Verdict */}
              {activeArtifactTab === 'verdict' && (
                <div className="space-y-4">
                  <VerdictCard
                    result={currentResult as any}
                    onSimulate={() => handleSendMessage(undefined, true)}
                    isSimulating={isAgentThinking}
                  />

                  {/* Telemetry Card */}
                  <div className="p-4 rounded-xl bg-[#090a10] border border-[#1e2029] space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Reasoning Duration:</span>
                      <strong className="text-white">{currentResult.telemetry.latencyMs} ms</strong>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Tools Invoked:</span>
                      <strong className="text-[#38bdf8]">{currentResult.telemetry.toolsInvoked} external calls</strong>
                    </div>
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>Tokens Processed:</span>
                      <strong className="text-[#4ade80]">~{currentResult.telemetry.tokensEstimated}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: 2-Hop Graph */}
              {activeArtifactTab === 'graph' && (
                <MultiHopVisualizer
                  nodes={currentResult.graph.nodes}
                  edges={currentResult.graph.edges}
                  multiHopExplanation={currentResult.summary}
                />
              )}

              {/* Tab 3: Remediation */}
              {activeArtifactTab === 'remediation' && currentResult.remediationPlan && (
                <RemediationPanel
                  plan={currentResult.remediationPlan}
                  isSimulated={currentResult.isSimulated}
                />
              )}

              {/* Tab 4: Evidence Trail */}
              {activeArtifactTab === 'evidence' && (
                <EvidenceTrail reasons={currentResult.reasons} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
