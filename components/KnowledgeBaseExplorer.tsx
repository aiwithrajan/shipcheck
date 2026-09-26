'use client';

import React, { useState } from 'react';
import { Database, ChevronRight, Layers, ExternalLink, ShieldCheck } from 'lucide-react';
import { KnowledgeEntryDoc, ComponentDoc, VersionConstraintDoc } from '@/sanity/seedData';

interface KnowledgeBaseExplorerProps {
  entries: KnowledgeEntryDoc[];
  components: ComponentDoc[];
  constraints: VersionConstraintDoc[];
}

export default function KnowledgeBaseExplorer({
  entries,
  components,
  constraints,
}: KnowledgeBaseExplorerProps) {
  const [selectedId, setSelectedId] = useState<string>(entries[0]?._id || '');

  const activeEntry = entries.find((e) => e._id === selectedId) || entries[0];

  return (
    <div className="card-premium shadow-2xl mb-8">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[#06b6d4]/10 rounded-xl text-[#06b6d4] border border-[#06b6d4]/25">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Sanity Content Lake Documents
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              18 documents the agent reads to verify your deployments — click any to see full details.
            </p>
          </div>
        </div>
        <span className="text-sm bg-[#111827] text-slate-300 px-3.5 py-1.5 rounded-lg border border-[#1e293b] font-semibold">
          {entries.length} records
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#1e293b]">
        {/* Document list */}
        <div className="p-4 space-y-2 max-h-[560px] overflow-y-auto">
          {entries.map((item) => {
            const isSelected = item._id === activeEntry?._id;
            return (
              <button
                key={item._id}
                onClick={() => setSelectedId(item._id)}
                className={`w-full text-left p-4 rounded-xl transition border flex items-start justify-between ${
                  isSelected
                    ? 'bg-[#06b6d4]/5 border-[#06b6d4]/40 text-white shadow-lg shadow-[#06b6d4]/5'
                    : 'bg-[#111827] border-[#1e293b] text-slate-300 hover:text-white hover:bg-[#161d2e]'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-sm font-semibold leading-snug mb-1.5 truncate">{item.title}</div>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-[#06b6d4] font-semibold">
                      {item.sourceType}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">Trust: {item.authorityLevel}/10</span>
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 mt-1 shrink-0 transition ${
                    isSelected ? 'text-[#06b6d4] translate-x-0.5' : 'text-slate-600'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Selected Document Details */}
        {activeEntry && (
          <div className="lg:col-span-2 p-6 sm:p-8 space-y-5 max-h-[560px] overflow-y-auto">
            <div className="pb-4 border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-sm bg-[#06b6d4]/10 text-[#22d3ee] border border-[#06b6d4]/30 px-3 py-1 rounded-md font-semibold">
                  {activeEntry.sourceType}
                </span>
                <h4 className="text-xl font-bold text-white mt-2 leading-snug">
                  {activeEntry.title}
                </h4>
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span>
                  Trust: <strong className="text-white">{activeEntry.authorityLevel}/10</strong>
                </span>
                <span>•</span>
                <span>
                  Verified: <strong className="text-[#22d3ee]">{activeEntry.lastVerified}</strong>
                </span>
              </div>
            </div>

            <div className="bg-[#0a0e1a] p-5 rounded-xl border border-[#1e293b] text-base text-slate-200 leading-relaxed">
              {activeEntry.body}
            </div>

            {/* Relationship links */}
            <div className="space-y-2.5">
              <div className="text-sm font-bold text-slate-400">
                Connections to other documents:
              </div>

              {activeEntry.contradictsIds && activeEntry.contradictsIds.length > 0 && (
                <div className="p-4 rounded-lg bg-[#ef4444]/[0.04] border border-[#ef4444]/25 text-sm text-slate-200">
                  <span className="font-bold text-[#ef4444]">⚠️ Contradicts:</span>{' '}
                  {activeEntry.contradictsIds.join(', ')} — this document overrides stale information by authority level.
                </div>
              )}

              {activeEntry.dependsOnIds && activeEntry.dependsOnIds.length > 0 && (
                <div className="p-4 rounded-lg bg-[#111827] border border-[#1e293b] text-sm text-slate-200">
                  <span className="font-bold text-white">🔗 Depends on:</span>{' '}
                  {activeEntry.dependsOnIds.join(', ')}
                </div>
              )}

              {activeEntry.isExceptionOfId && (
                <div className="p-4 rounded-lg bg-[#a78bfa]/[0.04] border border-[#a78bfa]/25 text-sm text-slate-200">
                  <span className="font-bold text-[#a78bfa]">⚡ Exception of:</span>{' '}
                  {activeEntry.isExceptionOfId} — this grants a bypass for the normal policy.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
