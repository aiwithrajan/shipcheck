'use client';

import React from 'react';
import { BookOpen, ShieldCheck, AlertTriangle } from 'lucide-react';
import { EvidenceReason } from '@/lib/engine/groqTraversal';

interface EvidenceTrailProps {
  reasons: EvidenceReason[];
}

export default function EvidenceTrail({ reasons }: EvidenceTrailProps) {
  return (
    <div className="card-premium shadow-2xl mb-8">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[#06b6d4]/10 rounded-xl text-[#06b6d4] border border-[#06b6d4]/25">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Evidence & Sources
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Every conclusion is backed by a specific document — here's the proof trail.
            </p>
          </div>
        </div>
        <span className="text-sm bg-[#111827] text-slate-300 px-3.5 py-1.5 rounded-lg border border-[#1e293b] font-semibold">
          {reasons.length} findings
        </span>
      </div>

      {/* Evidence Rows */}
      <div className="divide-y divide-[#1e293b]">
        {reasons.map((r, idx) => (
          <div key={r.id} className="p-6 sm:p-8 hover:bg-[#111827]/50 transition space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <span
                  className={`text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-md border ${
                    r.severity === 'BLOCKER'
                      ? 'bg-[#ef4444] text-white border-[#ef4444]'
                      : r.severity === 'DRIFT'
                      ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30'
                      : r.severity === 'EXCEPTION_APPLIED'
                      ? 'bg-[#a78bfa]/10 text-[#a78bfa] border-[#a78bfa]/30'
                      : 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/30'
                  }`}
                >
                  {r.severity === 'BLOCKER' ? '🛑 Blocker' :
                   r.severity === 'DRIFT' ? '⚠️ Drift' :
                   r.severity === 'EXCEPTION_APPLIED' ? '⚡ Exception' :
                   '✅ Clear'}
                </span>
                <span className="text-lg font-bold text-white leading-snug">
                  #{idx + 1} {r.conclusion}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-400">
                <span>Trust Level:</span>
                <span className="text-[#06b6d4] font-bold bg-[#06b6d4]/10 px-3 py-0.5 rounded border border-[#06b6d4]/20">
                  {r.authorityLevel}/10
                </span>
              </div>
            </div>

            {/* Evidence Block */}
            <div className="bg-[#111827] p-5 rounded-xl border border-[#1e293b]">
              <span className="text-xs uppercase font-bold text-slate-500 block mb-2">
                What was found:
              </span>
              <p className="text-base text-slate-200 leading-relaxed">
                {r.evidence}
              </p>
            </div>

            {/* Source and Resolution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="bg-[#111827] p-5 rounded-xl border border-[#1e293b]">
                <span className="text-xs uppercase font-bold text-slate-500 block mb-1.5">
                  Source ({r.sourceType}):
                </span>
                <div className="text-base text-white font-medium">{r.sourceDocTitle}</div>
                <div className="text-sm text-slate-400 mt-1">
                  Last verified: {r.effectiveDate}
                </div>
              </div>

              <div className="bg-[#111827] p-5 rounded-xl border border-[#1e293b]">
                <span className="text-xs uppercase font-bold text-slate-500 block mb-1.5">
                  What needs to happen:
                </span>
                <div className="text-base text-slate-200 font-medium leading-relaxed">
                  {r.condition}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
