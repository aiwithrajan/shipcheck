'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Database } from 'lucide-react';
import NavBar from '@/components/NavBar';
import KnowledgeBaseExplorer from '@/components/KnowledgeBaseExplorer';

export default function KnowledgePage() {
  const [kbData, setKbData] = useState<{
    entries: any[];
    components: any[];
    constraints: any[];
    projectId?: string;
  }>({ entries: [], components: [], constraints: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/groq')
      .then(r => r.json())
      .then(data => {
        setKbData({
          entries: data.knowledgeEntries || [],
          components: data.components || [],
          constraints: data.versionConstraints || [],
          projectId: data.projectId,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="scan-line-wrap" aria-hidden><div className="scan-line" /></div>
      <NavBar projectId={kbData.projectId} />

      <main className="w-full max-w-screen-2xl mx-auto px-6 lg:px-16 xl:px-20 py-12">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-[#06b6d4]/10 rounded-xl text-[#06b6d4] border border-[#06b6d4]/25">
                <Database className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Knowledge Base
              </h1>
            </div>
            <p className="text-base text-slate-400 max-w-2xl">
              All 18 documents the agent uses to make decisions — services, policies, release notes, and version constraints stored in Sanity Cloud.
            </p>
          </div>
          <Link href="/" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-medium border border-[#1e293b] px-4 py-2.5 rounded-xl hover:border-[#06b6d4]/40 whitespace-nowrap">
            <ArrowLeft className="w-4 h-4" />
            Back to Agent
          </Link>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Knowledge Entries', value: kbData.entries.length || 18, color: '#06b6d4' },
            { label: 'Service Components', value: kbData.components.length || 5, color: '#a78bfa' },
            { label: 'Version Constraints', value: kbData.constraints.length || 6, color: '#f59e0b' },
            { label: 'Authority Levels', value: '1 – 10', color: '#10b981' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card-premium p-6 text-center">
              <div className="text-3xl font-extrabold mb-1" style={{ color }}>{value}</div>
              <div className="text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="shimmer-bg h-48 rounded-2xl border border-[#1e293b]" />
            <div className="shimmer-bg h-64 rounded-2xl border border-[#1e293b]" />
          </div>
        ) : kbData.entries.length > 0 ? (
          <KnowledgeBaseExplorer
            entries={kbData.entries}
            components={kbData.components}
            constraints={kbData.constraints}
          />
        ) : (
          <div className="card-premium p-16 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-white mb-2">Loading knowledge base…</h2>
            <p className="text-slate-400 text-base">Fetching documents from Sanity Content Lake.</p>
          </div>
        )}
      </main>
    </>
  );
}
