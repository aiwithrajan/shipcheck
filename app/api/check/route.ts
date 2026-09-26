import { NextResponse } from 'next/server';
import { executeDeterministicGroqTraversal } from '@/lib/engine/groqTraversal';
import { runNaiveVectorSearch } from '@/lib/engine/naiveSearchStub';
import { runPreflightAgent } from '@/lib/agent/preflightAgent';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const proposal = body.proposal;
    const simulateFix = Boolean(body.simulateFix);
    const clusterOverrides = body.clusterOverrides;

    if (!proposal || typeof proposal !== 'string') {
      return NextResponse.json({ error: 'Proposal text is required' }, { status: 400 });
    }

    // 1. Run Autonomous Pre-flight Verification Agent (ReAct reasoning loop)
    const agentResult = await runPreflightAgent(proposal, {
      simulateFix,
      clusterOverrides,
    });

    // 2. Run deterministic traversal & naive comparison
    const structuredResult = executeDeterministicGroqTraversal(proposal, {
      simulateFix,
      clusterOverrides,
    });
    const naiveResult = runNaiveVectorSearch(proposal);

    return NextResponse.json({
      agent: agentResult,
      structured: structuredResult,
      naive: naiveResult,
      isSimulated: simulateFix,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Check error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
