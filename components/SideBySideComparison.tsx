'use client';

import React from 'react';
import { Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { NaiveSearchResult } from '@/lib/engine/naiveSearchStub';

interface SideBySideProps {
  naive: NaiveSearchResult;
  structuredVerdict: string;
}

export default function SideBySideComparison({ naive, structuredVerdict }: SideBySideProps) {
  return (
    <div className="card-premium shadow-2xl mb-8 p-6 sm:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#1e293b] mb-6 gap-3">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[#06b6d4]/10 rounded-xl text-[#06b6d4] border border-[#06b6d4]/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Keyword Search vs. Graph Traversal
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Same question asked to both — see which one catches the bug:
              <span className="text-slate-200 font-medium ml-1">"{naive.query}"</span>
            </p>
          </div>
        </div>
        <span className="self-start sm:self-auto text-xs bg-[#111827] text-[#22d3ee] border border-[#06b6d4]/30 px-3.5 py-1.5 rounded-lg font-semibold">
          Same Data, Different Results
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Naive Vector Search — THE BAD ONE */}
        <div className="rounded-2xl bg-[#ef4444]/[0.03] border border-[#ef4444]/25 p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <span className="flex items-center text-base font-bold text-[#ef4444] gap-2">
                <ShieldAlert className="w-5 h-5" />
                Keyword / Vector Search
              </span>
              <span className="text-xs bg-[#ef4444] text-white px-3 py-1 rounded font-bold">
                ❌ WRONG ANSWER
              </span>
            </div>

            <div className="bg-[#0a0e1a] p-4 rounded-xl border border-[#ef4444]/15 text-base text-[#fca5a5] italic mb-4">
              "{naive.naiveVerdict}"
            </div>

            <div className="text-base text-slate-300 bg-[#ef4444]/[0.04] p-4 rounded-xl border border-[#ef4444]/15 mb-5 leading-relaxed">
              <strong className="text-[#ef4444] block mb-1.5 text-sm font-bold">
                Why it fails:
              </strong>
              {naive.failureAnalysis}
            </div>

            <div className="space-y-2 mb-4">
              <span className="text-sm font-semibold text-slate-400 block">
                What it found (by keyword similarity):
              </span>
              {naive.matchedDocs.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#111827] border border-[#1e293b] text-sm text-slate-300 flex items-center justify-between"
                >
                  <span className="truncate pr-2">{doc.title}</span>
                  <span className="font-mono text-slate-500 text-xs shrink-0">
                    score: {doc.similarityScore}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-[#ef4444] pt-4 border-t border-[#ef4444]/15 flex items-center gap-2 font-medium">
            ❌ Missed the 2-hop SDK dependency — "SDK" wasn't in the search query.
          </div>
        </div>

        {/* Right: SHIPCHECK — THE GOOD ONE */}
        <div className="rounded-2xl bg-[#10b981]/[0.03] border border-[#10b981]/30 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <span className="flex items-center text-base font-bold text-white gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#10b981]" />
                SHIPCHECK (Graph Traversal)
              </span>
              <span className="text-xs bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 px-3 py-1 rounded font-bold">
                ✅ CORRECT
              </span>
            </div>

            <div className="bg-[#0a0e1a] p-4 rounded-xl border border-[#1e293b] text-base text-slate-200 mb-4">
              "{structuredVerdict}: Hard blocker identified. Payment Service v4 requires Payment SDK &gt;= v3.0.0, but production is running v2.4.1."
            </div>

            <div className="text-base text-slate-300 bg-[#10b981]/[0.04] p-4 rounded-xl border border-[#10b981]/15 mb-5 leading-relaxed">
              <strong className="text-[#10b981] block mb-1.5 text-sm font-bold">
                Why it works:
              </strong>
              {naive.whyStructuredWins}
            </div>

            <div className="p-4 rounded-xl bg-[#111827] border border-[#1e293b] text-sm text-white space-y-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-[#10b981] font-bold">✓</span> Hop 1: Found version constraint for v4 target
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[#10b981] font-bold">✓</span> Hop 2: Cross-referenced with live cluster state
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[#10b981] font-bold">✓</span> Resolved doc contradiction by authority level (10 &gt; 4)
              </div>
            </div>
          </div>

          <div className="text-sm text-white pt-4 border-t border-[#10b981]/20 flex items-center justify-between font-medium">
            <span className="text-[#10b981] font-bold">✓ Outage prevented</span>
            <span className="text-slate-400">0 false positives</span>
          </div>
        </div>
      </div>
    </div>
  );
}
