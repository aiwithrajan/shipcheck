'use client';

import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Code2 } from 'lucide-react';

interface GroqDebugPanelProps {
  queries: {
    name: string;
    groq: string;
    params?: Record<string, any>;
    resultSample: any;
  }[];
}

export default function GroqDebugPanel({ queries }: GroqDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="card-premium shadow-2xl mb-8">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 border-b border-[#1e293b] flex items-center justify-between text-left hover:bg-[#111827] transition"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-[#06b6d4]/10 rounded-xl text-[#06b6d4] border border-[#06b6d4]/25">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              GROQ Queries Used
            </h3>
            <p className="text-sm text-slate-400 mt-0.5">
              The exact database queries SHIPCHECK ran against Sanity — no AI guessing, pure structured lookup.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm bg-[#111827] text-slate-300 px-3.5 py-1.5 rounded-lg border border-[#1e293b] font-semibold">
            {queries.length} queries
          </span>
          {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 sm:p-8 space-y-5">
          {queries.map((q, idx) => (
            <div key={idx} className="bg-[#0a0e1a] border border-[#1e293b] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
                <span className="font-bold text-[#22d3ee] text-base flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                  {q.name}
                </span>
                <button
                  onClick={() => handleCopy(q.groq, idx)}
                  className="text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1e293b] border border-[#1e293b] transition flex items-center gap-2 text-sm font-medium"
                  title="Copy GROQ Query"
                >
                  {copiedIdx === idx ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span className="text-[#10b981]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-500 block mb-2">
                  GROQ Query:
                </span>
                <pre className="bg-[#111827] p-4 rounded-lg text-sm text-slate-200 overflow-x-auto border border-[#1e293b] font-mono leading-relaxed">
                  {q.groq}
                </pre>
              </div>

              {q.params && (
                <div>
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-2">
                    Parameters:
                  </span>
                  <pre className="bg-[#111827] p-4 rounded-lg text-sm text-[#fca5a5] overflow-x-auto border border-[#1e293b] font-mono">
                    {JSON.stringify(q.params, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <span className="text-xs uppercase font-bold text-slate-500 block mb-2">
                  Response from Sanity:
                </span>
                <pre className="bg-[#111827] p-4 rounded-lg text-sm text-slate-300 overflow-x-auto border border-[#1e293b] font-mono max-h-48">
                  {JSON.stringify(q.resultSample, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
