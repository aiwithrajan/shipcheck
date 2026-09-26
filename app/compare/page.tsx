'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart2 } from 'lucide-react';
import NavBar from '@/components/NavBar';
import SideBySideComparison from '@/components/SideBySideComparison';
import GroqDebugPanel from '@/components/GroqDebugPanel';
import { loadResult, StoredResult } from '@/lib/store';

export default function ComparePage() {
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
                <BarChart2 className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Why Not Just Search?
              </h1>
            </div>
            <p className="text-base text-slate-400 max-w-2xl">
              See why keyword/vector search (like Pinecone) misses critical bugs that SHIPCHECK's structured graph traversal catches.
            </p>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-medium border border-[#1e293b] px-4 py-2.5 rounded-xl hover:border-[#06b6d4]/40 whitespace-nowrap">
            <ArrowLeft className="w-4 h-4" />
            Back to Agent
          </Link>
        </div>

        {!data ? (
          <div className="card-premium p-16 text-center">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="text-xl font-bold text-white mb-2">No results to compare yet</h2>
            <p className="text-slate-400 mb-6 text-base">Run a deployment check first, then come back to see the comparison.</p>
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
            </div>

            <SideBySideComparison naive={data.naive} structuredVerdict={data.structured.verdict} />
            <GroqDebugPanel queries={data.structured.literalGroqQueries} />
          </>
        )}
      </main>
    </>
  );
}
