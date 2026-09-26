'use client';

import React, { useState } from 'react';
import {
  ClipboardCopy, Check, ChevronDown, ChevronUp,
  Terminal, RotateCcw, Clock, Users, ShieldAlert,
  CheckCircle2, Wrench, Layers, Cpu, FlaskConical
} from 'lucide-react';
import { RemediationPlan, RemediationStep } from '@/lib/engine/remediationEngine';

interface RemediationPanelProps {
  plan: RemediationPlan;
  isSimulated?: boolean;
}

const PHASE_CONFIG: Record<RemediationStep['phase'], { label: string; color: string; bg: string; Icon: any }> = {
  PREREQUISITE:      { label: 'Step 1: Prepare',     color: '#f59e0b', bg: 'rgba(245,158,11,0.04)', Icon: Layers },
  SCHEMA_MIGRATION:  { label: 'Step 2: Migrate',     color: '#a78bfa', bg: 'rgba(167,139,250,0.04)', Icon: Cpu },
  DEPLOYMENT:        { label: 'Step 3: Deploy',      color: '#06b6d4', bg: 'rgba(6,182,212,0.04)', Icon: Wrench },
  VERIFICATION:      { label: 'Step 4: Verify',      color: '#10b981', bg: 'rgba(16,185,129,0.04)', Icon: FlaskConical },
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1e293b] border border-[#1e293b] text-slate-300 hover:text-white transition"
    >
      {copied ? <><Check className="w-3.5 h-3.5 text-[#10b981]" />Copied!</> : <><ClipboardCopy className="w-3.5 h-3.5 text-slate-500" />{label}</>}
    </button>
  );
}

export default function RemediationPanel({ plan, isSimulated }: RemediationPanelProps) {
  const [open, setOpen] = useState(true);
  const [showCli, setShowCli] = useState(false);
  const [showRollback, setShowRollback] = useState(false);

  const riskColors: Record<RemediationPlan['riskLevel'], string> = {
    LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#f97316', CRITICAL: '#ef4444',
  };
  const riskColor = riskColors[plan.riskLevel];

  return (
    <div className={`card-premium shadow-2xl mb-8 ${isSimulated ? 'border border-[#10b981]/40' : ''}`}>

      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-[#111827] transition"
      >
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-xl border ${
            plan.status === 'CLEAR_FOR_DEPLOYMENT'
              ? 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/25'
              : 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/25'
          }`}>
            {plan.status === 'CLEAR_FOR_DEPLOYMENT'
              ? <CheckCircle2 className="w-5 h-5" />
              : <ShieldAlert className="w-5 h-5" />
            }
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              {plan.status === 'CLEAR_FOR_DEPLOYMENT' ? '✅ Ready to Deploy' : 'How to Fix This'}
              {isSimulated && (
                <span className="ml-2.5 text-xs text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/30">
                  Simulated
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-400 mt-0.5 max-w-2xl">{plan.summary}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Risk:</span>
            <span className="font-bold px-2.5 py-1 rounded-lg border" style={{ color: riskColor, borderColor: riskColor + '40', background: riskColor + '0f' }}>
              {plan.riskLevel}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-slate-400 bg-[#111827] px-3 py-1.5 rounded-lg border border-[#1e293b]">
            <Clock className="w-3.5 h-3.5 text-[#06b6d4]" />
            ~{plan.estimatedTotalMinutes}min
          </div>
          {open ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="px-6 pb-7 space-y-6 border-t border-[#1e293b] pt-6">

          {/* Steps */}
          <div className="space-y-4">
            {plan.steps.map((step) => {
              const phase = PHASE_CONFIG[step.phase];
              const PhaseIcon = phase.Icon;
              return (
                <div
                  key={step.stepNumber}
                  className="rounded-xl border p-5 space-y-3 relative overflow-hidden"
                  style={{ background: phase.bg, borderColor: phase.color + '30' }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl" style={{ background: phase.color }} />

                  <div className="flex flex-wrap items-center justify-between gap-3 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg flex items-center justify-center font-extrabold text-base" style={{ background: phase.color + '20', color: phase.color }}>
                        {step.stepNumber}
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: phase.color }}>
                          {phase.label}
                        </span>
                        <div className="text-base font-bold text-white leading-snug">{step.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      ~{step.estimatedMinutes} min
                    </div>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed pl-2">{step.description}</p>

                  {step.command && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-slate-500">Command:</span>
                        <CopyButton text={step.command} label="Copy" />
                      </div>
                      <pre className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl px-4 py-3 text-sm font-mono text-slate-200 overflow-x-auto leading-relaxed">
                        {step.command}
                      </pre>
                    </div>
                  )}

                  <div className="flex items-start gap-2 bg-[#0a0e1a]/60 px-3.5 py-2.5 rounded-lg border border-[#1e293b]">
                    <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-300">{step.automatedCheck}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Approvals */}
          {plan.requiredApprovals.length > 0 && (
            <div className="rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/[0.03] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-[#f59e0b]" />
                <span className="text-sm font-bold text-[#f59e0b]">Required Approvals</span>
              </div>
              <div className="space-y-2">
                {plan.requiredApprovals.map((a, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-base text-slate-300">
                    <span className="w-6 h-6 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scripts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#1e293b] bg-[#111827] overflow-hidden">
              <button
                onClick={() => setShowCli(!showCli)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-sm font-bold text-slate-300 hover:text-white hover:bg-[#1e293b] transition"
              >
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#10b981]" />
                  Rollout Script
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton text={plan.cliScript} label="Copy" />
                  {showCli ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              {showCli && (
                <pre className="px-4 pb-4 text-sm font-mono text-[#6ee7b7] overflow-x-auto leading-relaxed border-t border-[#1e293b] pt-3">
                  {plan.cliScript}
                </pre>
              )}
            </div>

            <div className="rounded-xl border border-[#1e293b] bg-[#111827] overflow-hidden">
              <button
                onClick={() => setShowRollback(!showRollback)}
                className="w-full px-4 py-3.5 flex items-center justify-between text-sm font-bold text-slate-300 hover:text-white hover:bg-[#1e293b] transition"
              >
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#f97316]" />
                  Rollback Script
                </div>
                <div className="flex items-center gap-2">
                  <CopyButton text={plan.rollbackScript} label="Copy" />
                  {showRollback ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>
              {showRollback && (
                <pre className="px-4 pb-4 text-sm font-mono text-[#fca5a5] overflow-x-auto leading-relaxed border-t border-[#1e293b] pt-3">
                  {plan.rollbackScript}
                </pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
