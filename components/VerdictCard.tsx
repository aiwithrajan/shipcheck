'use client';

import React, { useState } from 'react';
import {
  AlertOctagon, ArrowRight, ShieldCheck, Volume2, VolumeX,
  Zap, ZapOff, Loader2, Activity, CheckCircle2
} from 'lucide-react';
import { TraversalResult } from '@/lib/engine/groqTraversal';

interface VerdictCardProps {
  result: TraversalResult;
  onSimulate?: () => Promise<void>;
  isSimulating?: boolean;
}

export default function VerdictCard({ result, onSimulate, isSimulating = false }: VerdictCardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechDone, setSpeechDone] = useState(false);

  const isDoNotShip = result.verdict === 'DO NOT SHIP YET';
  const isSimulated = result.isSimulated;

  const blockersCount = result.reasons.filter((r) => r.severity === 'BLOCKER').length;
  const driftCount    = result.reasons.filter((r) => r.severity === 'DRIFT').length;
  const okCount       = result.reasons.filter((r) => r.severity === 'OK').length;
  const exceptionCount = result.reasons.filter((r) => r.severity === 'EXCEPTION_APPLIED').length;

  const metrics = [
    { label: 'Blockers', value: blockersCount, color: blockersCount > 0 ? '#ef4444' : '#475569' },
    { label: 'Drift',    value: driftCount,    color: driftCount    > 0 ? '#f59e0b' : '#475569' },
    { label: 'Exceptions', value: exceptionCount, color: exceptionCount > 0 ? '#a78bfa' : '#475569' },
    { label: 'Verified',  value: okCount,        color: '#10b981' },
  ];

  const handleAudio = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utter = new SpeechSynthesisUtterance(result.audioBriefing);
    utter.rate  = 0.9;
    utter.pitch = 0.85;
    utter.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v =>
      v.name.toLowerCase().includes('google uk english male') ||
      v.name.toLowerCase().includes('daniel') ||
      v.name.toLowerCase().includes('alex')
    );
    if (preferred) utter.voice = preferred;

    utter.onstart = () => { setIsSpeaking(true); setSpeechDone(false); };
    utter.onend   = () => { setIsSpeaking(false); setSpeechDone(true); };
    utter.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utter);
  };

  return (
    <div
      className={`rounded-2xl overflow-hidden shadow-2xl mb-6 animate-fade-in-up relative ${
        isSimulated
          ? 'border-2 border-[#10b981]/80 shadow-[0_0_40px_rgba(16,185,129,0.15)]'
          : isDoNotShip
          ? 'border-2 border-[#ef4444]/60 verdict-danger'
          : 'border border-[#10b981]/50 shadow-[0_0_30px_rgba(16,185,129,0.10)]'
      }`}
      style={
        isSimulated
          ? { background: 'linear-gradient(145deg, #071a10 0%, #040d08 100%)' }
          : isDoNotShip
          ? { background: 'linear-gradient(145deg, #170a0c 0%, #0d0507 100%)' }
          : { background: 'linear-gradient(145deg, #071a10 0%, #050d08 100%)' }
      }
    >
      {/* Simulation Banner */}
      {isSimulated && (
        <div className="bg-[#0a2112] border-b border-[#10b981]/30 px-6 py-2.5 flex items-center gap-3">
          <Activity className="w-4 h-4 text-[#10b981] animate-pulse shrink-0" />
          <span className="text-sm font-bold text-[#10b981]">SIMULATION ACTIVE</span>
          <span className="text-sm text-slate-400">— {result.simulationNote}</span>
        </div>
      )}

      {/* Top accent line */}
      <div
        className="h-[4px] w-full"
        style={{
          background: isSimulated || !isDoNotShip
            ? 'linear-gradient(90deg, transparent, #10b981 20%, #6ee7b7 50%, #10b981 80%, transparent)'
            : 'linear-gradient(90deg, transparent, #ef4444 20%, #f87171 50%, #ef4444 80%, transparent)',
        }}
      />

      {/* Main verdict */}
      <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left: Icon + Verdict */}
        <div className="flex items-start sm:items-center gap-5 flex-1">
          <div
            className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${
              isSimulated || !isDoNotShip
                ? 'bg-[#10b981] shadow-[#10b981]/30 text-black'
                : 'bg-[#ef4444] shadow-[#ef4444]/30 text-white'
            }`}
          >
            {isSimulated || !isDoNotShip ? (
              <ShieldCheck className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2.5]" />
            ) : (
              <AlertOctagon className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2.5]" />
            )}
          </div>

          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-400 mb-1 flex items-center gap-2">
              <span>Agent Verdict</span>
              {isSimulated && (
                <span className="bg-[#10b981] text-black text-xs font-bold px-2 py-0.5 rounded-full">
                  Simulated
                </span>
              )}
            </div>
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight ${
                isSimulated || !isDoNotShip ? 'text-white' : 'text-[#ef4444]'
              }`}
            >
              {isSimulated ? 'SAFE TO SHIP' : isDoNotShip ? 'NOT SAFE' : 'SAFE TO SHIP'}
            </h2>
            <p className="text-base text-slate-300 mt-2.5 leading-relaxed max-w-2xl">
              {result.summary}
            </p>
          </div>
        </div>

        {/* Right: Metrics */}
        <div className="grid grid-cols-2 gap-3 shrink-0 lg:w-60">
          {metrics.map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-[#0a0e1a]/80 border border-[#1e293b] rounded-xl p-3.5 text-center"
            >
              <div className="text-2xl sm:text-3xl font-extrabold leading-none" style={{ color }}>
                {value}
              </div>
              <div className="text-xs text-slate-400 uppercase mt-1.5 font-medium">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-6 sm:px-8 pb-5 flex flex-wrap gap-3">
        <button
          onClick={handleAudio}
          className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition border ${
            isSpeaking
              ? 'bg-[#a78bfa]/10 border-[#a78bfa]/40 text-[#a78bfa]'
              : speechDone
              ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#10b981]'
              : 'bg-[#111827] border-[#1e293b] text-slate-300 hover:text-white hover:border-[#a78bfa]/40'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4" />
              Stop Audio
              <span className="flex gap-0.5 items-end h-4">
                {[1,2,3,2,1].map((h, i) => (
                  <span key={i} className="w-0.5 bg-[#a78bfa] rounded-full animate-pulse" style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-[#a78bfa]" />
              {speechDone ? '✓ Played' : '🎙️ Audio Briefing'}
            </>
          )}
        </button>

        {isDoNotShip && !isSimulated && onSimulate && (
          <button
            onClick={onSimulate}
            disabled={isSimulating}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition border bg-[#111827] border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[#f59e0b]/10 hover:border-[#f59e0b]/50 disabled:opacity-50"
          >
            {isSimulating ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Simulating...</>
            ) : (
              <><Zap className="w-4 h-4" />Simulate Fix</>
            )}
          </button>
        )}

        {isSimulated && onSimulate && (
          <button
            onClick={onSimulate}
            disabled={isSimulating}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition border bg-[#111827] border-[#ef4444]/30 text-[#ef4444] hover:border-[#ef4444]/50"
          >
            <ZapOff className="w-4 h-4" />
            Reset to Live State
          </button>
        )}
      </div>

      {/* Bottom meta */}
      <div className="px-6 sm:px-8 py-3.5 border-t border-[#1e293b] bg-[#0a0e1a]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#06b6d4] animate-pulse" />
          <span>
            Service:{' '}
            <strong className="text-white">
              {result.proposedChange?.componentName || 'Payment Service'}
            </strong>
            {' '}({result.proposedChange?.currentVersion || 'v2'}
            <ArrowRight className="w-3.5 h-3.5 inline mx-1.5 text-[#06b6d4]" />
            {result.proposedChange?.targetVersion || 'v4'})
          </span>
        </div>
        <span className="text-slate-500">
          Graph Traversal: <strong className="text-[#06b6d4]">2 Hops</strong>
        </span>
      </div>
    </div>
  );
}
