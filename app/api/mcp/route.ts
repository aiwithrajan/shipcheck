import { NextResponse } from 'next/server';
import { sanityLiveClient } from '@/lib/sanity/client';
import { executeDeterministicGroqTraversal } from '@/lib/engine/groqTraversal';

/**
 * Sanity Context MCP JSON-RPC 2.0 Endpoint
 * Compatible with Claude Code, Cursor, VS Code, and Sanity MCP specifications.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { method, params, id } = body;

    // 1. tools/list
    if (method === 'tools/list') {
      return NextResponse.json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'query_documents',
              description: 'Execute live GROQ queries against the Sanity Content Lake (Project: 70rd1u6b)',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'GROQ query string (e.g. *[_type == "component"])' },
                  params: { type: 'object', description: 'Optional query parameters' },
                },
                required: ['query'],
              },
            },
            {
              name: 'get_schema',
              description: 'Get schema structure for SHIPCHECK components, versionConstraints, and knowledgeEntries',
              inputSchema: { type: 'object', properties: {} },
            },
            {
              name: 'preflight_check',
              description: 'Run pre-flight verification to challenge a proposed production service change using multi-hop graph traversal',
              inputSchema: {
                type: 'object',
                properties: {
                  proposal: { type: 'string', description: 'e.g. "Can I upgrade payment service from v2 to v4 tonight?"' },
                  simulateFix: { type: 'boolean', description: 'Simulate resolving the upstream cluster dependency (e.g. SDK v3.1.0 applied)' },
                },
                required: ['proposal'],
              },
            },
          ],
        },
      });
    }

    // 2. tools/call
    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      if (toolName === 'query_documents') {
        const groqQuery = toolArgs.query;
        const groqParams = toolArgs.params || {};
        const data = await sanityLiveClient.fetch(groqQuery, groqParams);
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] },
        });
      }

      if (toolName === 'get_schema') {
        const schemas = {
          projectId: '70rd1u6b',
          dataset: 'production',
          types: ['component', 'versionConstraint', 'knowledgeEntry'],
          loadBearingRelations: ['dependsOn', 'contradicts', 'supersedes', 'isExceptionOf'],
        };
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(schemas, null, 2) }] },
        });
      }

      if (toolName === 'preflight_check') {
        const checkResult = executeDeterministicGroqTraversal(toolArgs.proposal, {
          simulateFix: Boolean(toolArgs.simulateFix),
        });
        return NextResponse.json({
          jsonrpc: '2.0',
          id,
          result: { content: [{ type: 'text', text: JSON.stringify(checkResult, null, 2) }] },
        });
      }

      return NextResponse.json(
        { jsonrpc: '2.0', id, error: { code: -32601, message: `Tool ${toolName} not found` } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      id,
      result: {
        status: 'online',
        server: 'Sanity Context MCP - SHIPCHECK Gateway',
        projectId: '70rd1u6b',
        dataset: 'production',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { jsonrpc: '2.0', error: { code: -32603, message: err.message } },
      { status: 500 }
    );
  }
}
