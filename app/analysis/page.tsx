'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, GitBranch, Bot } from 'lucide-react';
import NavBar from '@/components/NavBar';
import MultiHopVisualizer from '@/components/MultiHopVisualizer';
import EvidenceTrail from '@/components/EvidenceTrail';
import RemediationPanel from '@/components/RemediationPanel';
import AgentTerminal from '@/components/AgentTerminal';
import { loadResult, StoredResult } from '@/lib/store';

export default function AnalysisPage() {
  const [data, setData] = useState<StoredResult | null>(null);

  useEffect(() => {
    setData(loadResult());
  }, []);

  return (
    <>
      <div className="scan-line-wrap" aria-hidden><div className="scan-line" /></div>
      <NavBar />

      <main className="w-full max-w-screen-2xl mx-auto px-6 lg:px-16 xl:px-20 py-12">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-[#06b6d4]/10 rounded-xl text-[#06b6d4] border border-[#06b6d4]/25">
                <GitBranch className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Dependency Analysis & Agent Trace
              </h1>
            </div>
            <p className="text-base text-slate-400 max-w-2xl">
              See how the agent reasoned through your deployment check — every dependency hop, every data source, every decision.
            </p>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-medium border border-[#1e293b] px-4 py-2.5 rounded-xl hover:border-[#06b6d4]/40 whitespace-nowrap">
            <ArrowLeft className="w-4 h-4" />
            Back to Agent
          </Link>
        </div>

        {!data ? (
          <div className="card-premium p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-white mb-2">No analysis yet</h2>
            <p className="text-slate-400 mb-6 text-base">Run a deployment check first to see the full analysis here.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-[#06b6d4] text-black font-bold px-6 py-3 rounded-xl hover:bg-[#22d3ee] transition text-sm">
              Run a Check <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        ) : (
          <>
            {/* Proposal banner */}
            <div className="mb-8 p-5 rounded-xl bg-[#111827] border border-[#1e293b] flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-500 shrink-0">Checked:</span>
              <span className="text-base text-white font-medium">{data.proposal}</span>
              <span className={`ml-auto shrink-0 text-sm font-bold px-4 py-1.5 rounded-lg ${
                data.structured.verdict === 'DO NOT SHIP YET'
                  ? 'bg-[#ef4444] text-white'
                  : 'bg-[#10b981] text-white'
              }`}>
                {data.structured.isSimulated ? '✅ Simulated: Safe' : data.structured.verdict === 'DO NOT SHIP YET' ? '🔴 Blocked' : '🟢 Safe'}
              </span>
            </div>

            {/* Agent Reasoning Trace */}
            {data.agent && data.agent.agentSteps && (
              <AgentTerminal
                steps={data.agent.agentSteps}
                telemetry={data.agent.telemetry}
              />
            )}

            <MultiHopVisualizer
              nodes={data.structured.graph.nodes}
              edges={data.structured.graph.edges}
              multiHopExplanation={data.structured.multiHopExplanation}
            />

            <EvidenceTrail reasons={data.structured.reasons} />

            {/* Remediation Plan */}
            {data.structured.remediationPlan && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#06b6d4]/30 to-transparent" />
                  <span className="text-sm font-semibold text-slate-400">How to Fix It</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#06b6d4]/30 to-transparent" />
                </div>
                <RemediationPanel
                  plan={data.structured.remediationPlan}
                  isSimulated={data.structured.isSimulated}
                />
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}
