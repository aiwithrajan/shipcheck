'use client';

import React from 'react';
import { GitBranch, ArrowRight, Database, CheckCircle2, ShieldAlert } from 'lucide-react';
import { GraphNode, GraphEdge } from '@/lib/engine/groqTraversal';

interface MultiHopVisualizerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  multiHopExplanation: string;
}

const HOP_CONFIGS = [
  {
    step: 'Hop 0',
    title: 'Your Request',
    badge: 'Starting Point',
    bg: '#111827',
    border: '#1e293b',
    labelColor: '#94a3b8',
    nodeKey: 'target-service',
    fallback: 'Payment Service (v2 → v4)',
    status: 'Received',
    statusColor: '#94a3b8',
    desc: 'The service upgrade you asked about — this is what we need to verify.',
  },
  {
    step: 'Hop 1',
    title: 'Version Requirements',
    badge: 'Dependency Check',
    bg: 'rgba(245,158,11,0.04)',
    border: 'rgba(245,158,11,0.30)',
    labelColor: '#f59e0b',
    nodeKey: 'req-sdk-v3',
    fallbackKey: 'req-sdk-v2',
    fallback: 'Requires Payment SDK >= v3.0.0',
    status: 'Constraint Found',
    statusColor: '#f59e0b',
    desc: 'The agent looked up what other components this version requires to work.',
  },
  {
    step: 'Hop 2',
    title: 'Live Cluster Check',
    badge: 'Reality Check',
    bg: 'rgba(239,68,68,0.04)',
    border: 'rgba(239,68,68,0.35)',
    labelColor: '#ef4444',
    nodeKey: 'prod-sdk-v2',
    fallbackKey: 'safe-comp',
    fallback: 'Production SDK active: v2.4.1',
    status: 'Conflict Found',
    statusColor: '#ef4444',
    desc: 'Checked what\'s actually running in production — found a version mismatch.',
  },
];

export default function MultiHopVisualizer({
  nodes,
  edges,
  multiHopExplanation,
}: MultiHopVisualizerProps) {
  return (
    <div className="card-premium shadow-2xl mb-8">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[#06b6d4]/10 rounded-xl text-[#06b6d4] border border-[#06b6d4]/25">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              How the Agent Found the Problem
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              Each "hop" is a step through the dependency graph — from your request to the actual issue.
            </p>
          </div>
        </div>
        <span className="self-start sm:self-auto text-sm bg-[#06b6d4]/10 text-[#22d3ee] border border-[#06b6d4]/30 px-3.5 py-1.5 rounded-lg font-semibold">
          2 Hops Deep
        </span>
      </div>

      <div className="p-6 sm:p-8">
        {/* Explanation text */}
        <div className="bg-[#111827] p-5 rounded-xl border border-[#1e293b] text-base text-slate-200 mb-8 flex items-start gap-3.5 leading-relaxed">
          <Database className="w-5 h-5 text-[#06b6d4] shrink-0 mt-1" />
          <span>{multiHopExplanation}</span>
        </div>

        {/* 3 Hop Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative mb-8">
          {HOP_CONFIGS.map((hop, idx) => {
            const nodeLabel =
              nodes.find((n) => n.id === hop.nodeKey)?.label ||
              (hop.fallbackKey ? nodes.find((n) => n.id === hop.fallbackKey)?.label : undefined) ||
              hop.fallback;

            return (
              <div
                key={hop.step}
                className="rounded-2xl p-6 flex flex-col justify-between transition border shadow-xl relative"
                style={{
                  background: hop.bg,
                  borderColor: hop.border,
                }}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-sm font-bold uppercase tracking-wide"
                      style={{ color: hop.labelColor }}
                    >
                      {hop.step}: {hop.title}
                    </span>
                    <span className="text-xs text-slate-500">
                      {hop.badge}
                    </span>
                  </div>

                  <div className="text-lg font-bold text-white mb-2 leading-snug">
                    {nodeLabel}
                  </div>

                  <p className="text-sm text-slate-400 leading-relaxed">
                    {hop.desc}
                  </p>
                </div>

                <div
                  className="mt-5 pt-3 border-t text-sm font-semibold flex items-center justify-between"
                  style={{ borderColor: hop.border, color: hop.statusColor }}
                >
                  <span>{hop.status}</span>
                  <span className="text-slate-600 text-xs">Step #{idx}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edges List */}
        <div className="border-t border-[#1e293b] pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-400">
              Connections Traversed
            </span>
            <span className="text-xs text-[#06b6d4] font-semibold">
              Direct database lookups — not AI guesses
            </span>
          </div>

          <div className="space-y-2.5">
            {edges.map((e, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl text-sm gap-2.5 transition"
                style={{
                  background: '#111827',
                  border: e.style === 'conflict' ? '1px solid rgba(239,68,68,0.35)' : '1px solid #1e293b',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-white font-bold truncate">{e.from}</span>
                  <ArrowRight className="w-4 h-4 text-[#06b6d4] shrink-0" />
                  <span className="text-slate-200 font-medium truncate">{e.to}</span>
                </div>
                <span
                  className={`text-xs px-3 py-1.5 rounded font-bold shrink-0 ${
                    e.style === 'conflict'
                      ? 'bg-[#ef4444] text-white'
                      : 'bg-[#1e293b] text-slate-300 border border-[#334155]'
                  }`}
                >
                  {e.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
