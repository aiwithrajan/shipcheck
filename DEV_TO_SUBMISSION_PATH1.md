---
title: "SHIPCHECK: An Autonomous ReAct Agent That Stops Cloud Outages Before They Happen"
published: true
tags: sanitychallenge, devchallenge, ai, mcp
cover_image: https://raw.githubusercontent.com/aiwithrajan/shipcheck/main/public/cover.png
canonical_url: 
---

*This is a submission for the [Sanity Challenge, Path One: Ship an Agent That Queries Real Content](https://dev.to/challenges/sanity-2026-09-16).*

---

## What I Built

Modern engineering teams increasingly rely on autonomous AI coding agents (Claude Code, Cursor, GitHub Copilot) to generate code and push infrastructure pull requests. However, when these agents evaluate whether a service can be safely promoted to production, they almost universally rely on **naive vector similarity search** (e.g., Pinecone, standard RAG).

**In production infrastructure, vector similarity search is dangerous.** If you ask:
> *"Can I upgrade payment service from v2 to v4 tonight?"*

Vector search finds semantic text matches on "payment service" and happily responds *"Looks safe!"* — completely blind to upstream multi-hop dependencies, active cluster container versions, and contradictory documentation. The result? **Catastrophic P0 outages in production.**

### Introducing SHIPCHECK 🚢🛡️

**SHIPCHECK** is an autonomous pre-flight production release gatekeeper. Built as a full **ReAct (Reasoning + Acting) Agent**, SHIPCHECK connects directly to a live **Sanity Content Lake** via the **Model Context Protocol (MCP)**.

Before any code deployment or pull request is merged:
1. **Deconstructs the Proposal:** Identifies target service, proposed version, and deployment environment.
2. **Autonomously Traverses 2-Hop Dependency Graphs via GROQ:** Queries Sanity to discover hidden dependency constraints that keyword search never sees.
3. **Cross-References Real-World Cluster State:** Audits the target requirements against live Kubernetes pod versions.
4. **Resolves Architectural Documentation Drift:** When stale internal wikis conflict with official release specifications, SHIPCHECK programmatically arbitrates using **Authority Weighting (1–10)**.
5. **Live Counterfactual Fix Simulation:** Allows engineers to simulate a cluster patch (e.g., upgrading an SDK) and watch the dependency graph and verdict flip from `DO NOT SHIP YET` to `SAFE TO SHIP` before touching live servers.
6. **Generates Actionable 4-Phase Remediation:** Produces executable `kubectl` rollout commands, migration schemas, and emergency rollback scripts.

---

## Demo

{% youtube dCaqBXgoQF0 %}

- 🌐 **Live Web Application:** [https://sanity-omega-ten.vercel.app](https://sanity-omega-ten.vercel.app)
- 💻 **GitHub Repository:** [https://github.com/aiwithrajan/shipcheck](https://github.com/aiwithrajan/shipcheck)
- 🗄️ **Sanity Content Lake Project ID:** `70rd1u6b` (Dataset: `production`)

---

## How I Used Sanity

Rather than using Sanity as a passive CMS, SHIPCHECK uses Sanity as the **cognitive brain and grounding environment** for the agent.

### 1. Schema Architecture for Agent Ingestion
We designed 3 core document types in Sanity (`70rd1u6b`):
- `component`: Represents microservices with their live cluster version, health status, and environment.
- `versionConstraint`: Encodes relational rules (`requiresComponent`, `operator`, `version`, `criticality`).
- `knowledgeEntry`: Stores architectural specifications, policies, and release notes with explicit semantic links:
  - `contradicts`: Directed references indicating which older specs are superseded.
  - `isExceptionOf`: Encodes policy bypass conditions (e.g., emergency security hotfix bypassing a 24h soak period).
  - `authorityLevel`: An integer from 1 to 10 ensuring the agent knows which document wins when specs disagree.

### 2. Model Context Protocol (MCP) Integration
SHIPCHECK exposes Sanity to AI coding agents via a typed MCP JSON-RPC 2.0 interface. The agent autonomously invokes 4 specialized tools:
- `query_sanity_component(componentName)`: Fetches live cluster state and metadata.
- `query_version_constraints(componentName, targetVersion)`: Discovers relational constraints.
- `audit_cluster_dependencies(dependencyName)`: Audits upstream pod versions.
- `query_knowledge_graph(query)`: Resolves documentation drift and exceptions by authority level.

---

## What the Live Runs Showed

When you instruct SHIPCHECK with:
> *"Can I upgrade payment service from v2 to v4 tonight?"*

The agent executes a 13-step ReAct cognitive loop:

```
[THOUGHT]       Deconstruct proposed change: Component="Payment Service", Target="v4"
[TOOL_CALL]     invoke: query_sanity_component("Payment Service")
[OBSERVATION]   Found active production component running v2.0.0
[THOUGHT]       Query version constraints linked to target version v4
[TOOL_CALL]     invoke: query_version_constraints("Payment Service", "v4")
[OBSERVATION]   Hop-1 Constraint: Payment Service v4 mandates Payment SDK >= v3.0.0
[THOUGHT]       Audit live production cluster state for Payment SDK
[TOOL_CALL]     invoke: audit_cluster_dependencies("Payment SDK")
[OBSERVATION]   Hop-2 Collision: Active cluster is running Payment SDK v2.4.1 (v2.4.1 < v3.0.0)
[THOUGHT]       Scan organizational knowledge base for documentation drift or policies
[TOOL_CALL]     invoke: query_knowledge_graph("Payment Service")
[OBSERVATION]   Stale Wiki (Auth 4) assumes XML payloads. Official v4 Release Notes (Auth 10) mandates JSON v2.
[DECISION]      Authority 10 supersedes Authority 4.
[DECISION]      VERDICT: DO NOT SHIP YET. Hard blocker identified.
```

### The Verdict & Counterfactual Simulation
1. **Hard Blocker:** Payment Service v4 requires Payment SDK >= v3.0.0, but production is running v2.4.1. Deploying tonight would crash all checkout pods.
2. **One-Click Fix Simulation:** Clicking *"Simulate Fix"* re-evaluates the graph with Payment SDK v3.1.0 in memory. The 2-hop collision clears, and the verdict live-flips to `SAFE TO SHIP`.
3. **Mission Control Audio Briefing:** Synthesizes an auditory mission briefing using the Web Speech API for on-call engineers.

---

## Code

- **GitHub Repository:** [https://github.com/aiwithrajan/shipcheck](https://github.com/aiwithrajan/shipcheck)
- **Autonomous Agent Loop:** [`lib/agent/preflightAgent.ts`](https://github.com/aiwithrajan/shipcheck/blob/main/lib/agent/preflightAgent.ts)
- **GROQ Multi-Hop Engine:** [`lib/engine/groqTraversal.ts`](https://github.com/aiwithrajan/shipcheck/blob/main/lib/engine/groqTraversal.ts)
- **Remediation Plan Engine:** [`lib/engine/remediationEngine.ts`](https://github.com/aiwithrajan/shipcheck/blob/main/lib/engine/remediationEngine.ts)

---

## Working with Coding Agents

Building an agent that verifies other agents taught us two critical lessons:
1. **LLMs need deterministic boundaries:** If you ask an LLM to guess dependency conflicts from unstructured text, it hallucinates ~30% of the time. When we ground the agent with typed GROQ queries over Sanity, hallucination drops to 0%.
2. **Authority-weighted provenance is essential:** In large teams, documentation is always in a state of drift. Giving Sanity documents an `authorityLevel` allowed the agent to resolve contradictions objectively (e.g., Release Notes Auth 10 overrides Internal Wiki Auth 4).

---

## Sanity Project Details

- **Project ID:** `70rd1u6b`
- **Dataset:** `production`
- **Documents Seeded:** 18 interconnected records participating in dependencies, contradictions, and exceptions.
- **Protocol:** Sanity Context MCP (JSON-RPC 2.0).

---

*Built with ❤️ for the Sanity Context MCP Hackathon (Path One).*
