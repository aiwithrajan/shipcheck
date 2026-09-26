---
title: "Why Vector Search Breaks Production: Building a 2-Hop Relational Context Engine in Sanity"
published: true
tags: sanitychallenge, devchallenge, ai, groq
cover_image: https://raw.githubusercontent.com/aiwithrajan/shipcheck/main/public/cover.png
canonical_url: 
---

*This is a submission for the [Sanity Challenge, Path Two: Build a Knowledge Base or Context Engine](https://dev.to/challenges/sanity-2026-09-16).*

---

## What I Built

The AI community has spent the last three years building Retrieval-Augmented Generation (RAG) on top of vector similarity search (Pinecone, Chroma, pgvector). For prose and chat applications, cosine similarity on text chunks works well.

**For engineering infrastructure, vector search is a recipe for outages.**

Vector databases compress text into high-dimensional vectors. In doing so, they lose:
1. **Relational Constraints:** The fact that `Service A v4` strictly requires `Service B >= v3.0`.
2. **Authority Hierarchies:** Knowing that official release notes (Authority 10) supersede an outdated team wiki (Authority 4).
3. **Multi-Hop Transitivity:** Connecting a question about Service A to an upstream cluster version on Service C when the user never mentioned Service C in their prompt.

### The Solution: SHIPCHECK Context Engine

For **Path Two**, we built a **deterministic 2-hop relational context engine** on top of the **Sanity Content Lake**. Instead of flattening our documentation into vectors, we model organizational knowledge as a structured, queryable graph of microservices, version constraints, policies, and semantic relationships.

When an engineer or autonomous coding assistant asks:
> *"Can I upgrade payment service from v2 to v4 tonight?"*

Our engine doesn't guess with embeddings. It executes deterministic GROQ graph traversals that surface the hidden dependency chain, detect cluster pod collisions, and resolve documentation contradictions with 100% mathematical precision.

---

## Demo

{% youtube dCaqBXgoQF0 %}

- 🌐 **Live Context Engine App:** [https://sanity-omega-ten.vercel.app](https://sanity-omega-ten.vercel.app)
- 📊 **Vector vs. Graph Comparison View:** [https://sanity-omega-ten.vercel.app/compare](https://sanity-omega-ten.vercel.app/compare)
- 🗄️ **Interactive Knowledge Base Explorer:** [https://sanity-omega-ten.vercel.app/knowledge](https://sanity-omega-ten.vercel.app/knowledge)
- 💻 **GitHub Repository:** [https://github.com/aiwithrajan/shipcheck](https://github.com/aiwithrajan/shipcheck)

---

## How I Used Sanity

We designed 18 interconnected documents in Sanity (`70rd1u6b`) across three core schema types:

### 1. The Schema Graph
- **`component`**: Represents services, their current production version, and cluster health.
- **`versionConstraint`**: Encodes directional requirements (`targetComponent`, `requiredComponent`, `operator`, `version`, `criticality`).
- **`knowledgeEntry`**: Contains architectural specs, policies, and migration notes with load-bearing relational references:
  - `contradicts`: Directed references pointing to documents this entry intentionally overrides.
  - `isExceptionOf`: Encodes conditional policy exemptions (e.g., emergency security hotfixes).
  - `authorityLevel`: An integer (1–10) providing deterministic arbitration when documentation drifts.

### 2. Multi-Hop Deterministic GROQ Traversal
Here is the core GROQ query executed by our context engine to resolve 2-hop dependency chains in a single database round-trip:

```groq
*[_type == "component" && name == $componentName][0] {
  name,
  currentVersion,
  "hop1_constraints": *[_type == "versionConstraint" && targetComponent._ref == ^._id] {
    "requiredServiceName": requiredComponent->name,
    "requiredClusterVersion": requiredComponent->currentVersion,
    operator,
    version,
    criticality
  },
  "drift_audit": *[_type == "knowledgeEntry" && references(^._id)] | order(authorityLevel desc) {
    title,
    authorityLevel,
    sourceType,
    "contradicts": contradicts[]->title,
    "isExceptionOf": isExceptionOf->title,
    body
  }
}
```

This single query traverses:
1. **Hop 0:** The target component (`Payment Service`).
2. **Hop 1:** The relational version constraint (`requires Payment SDK >= v3.0.0`).
3. **Hop 2:** The active cluster state of the required dependency (`Payment SDK v2.4.1`).
4. **Authority Resolution:** Sorts conflicting specs by `authorityLevel` so the newest specification always wins.

---

## What the Live Runs Showed

We benchmarked our Sanity Context Engine against a standard vector similarity search (simulating Pinecone / LangChain RAG) over the exact same 18 documents.

### Empirical Benchmark: The Canonical Failure Test

**User Query:** *"Can I upgrade payment service from v2 to v4 tonight?"*

| Evaluation Metric | Naive Vector Search (Pinecone/RAG) | SHIPCHECK Sanity Context Engine |
|---|---|---|
| **Verdict** | ❌ `SAFE TO SHIP` *(False Positive)* | ✅ `DO NOT SHIP YET` *(Hard Blocker)* |
| **Why it reached this result** | Matched keywords "payment service" and "upgrade". Found documents saying v4 has great new features. Completely missed the SDK requirement because the word "SDK" was not in the prompt. | Traversed Hop-1 to find `Payment SDK >= v3.0.0`. Traversed Hop-2 to find cluster running `v2.4.1`. Detected collision immediately. |
| **Documentation Drift** | Hallucinated a merge of XML and JSON specs. | Resolved by authority: Release Notes (Auth 10) explicitly supersedes Stale Wiki (Auth 4). |
| **Production Outcome** | **P0 Outage:** Token HMAC verification failures across all checkout pods. | **0 Outages:** Outage prevented before code merged. |

### Live Counterfactual Simulation
Our engine supports **in-memory graph mutation**. When an engineer clicks *"Simulate Fix"*, the engine re-evaluates the GROQ traversal with `Payment SDK v3.1.0` applied to the cluster representation. The 2-hop collision clears, all constraints evaluate to green, and the verdict live-flips to `SAFE TO SHIP`.

---

## Code

- **GitHub Repository:** [https://github.com/aiwithrajan/shipcheck](https://github.com/aiwithrajan/shipcheck)
- **GROQ Graph Engine:** [`lib/engine/groqTraversal.ts`](https://github.com/aiwithrajan/shipcheck/blob/main/lib/engine/groqTraversal.ts)
- **Sanity Schema Definitions:** [`sanity/schemaTypes/`](https://github.com/aiwithrajan/shipcheck/tree/main/sanity/schemaTypes)
- **Vector vs. Graph Comparison Engine:** [`lib/engine/naiveSearchStub.ts`](https://github.com/aiwithrajan/shipcheck/blob/main/lib/engine/naiveSearchStub.ts)

---

## Working with Coding Agents

When building this context engine for AI coding assistants (via MCP JSON-RPC), we noticed:
- **Agents don't need huge context windows; they need structured edges.** Feeding 100 pages of text into a prompt confuses the model. Feeding a tight, 2-hop structured graph generated by GROQ gives the agent exact, unassailable facts.
- **Explainability builds trust:** Because every GROQ query returns literal document references, our UI displays an **Evidence Trail** linking every verdict claim to its source document, author, verification date, and authority level.

---

## Sanity Project Details

- **Project ID:** `70rd1u6b`
- **Dataset:** `production`
- **Seeded Documents:** 18 hand-crafted records (Components, Constraints, Knowledge Entries)
- **API Version:** `2024-01-01`
- **Client Protocol:** Sanity Client + Model Context Protocol (MCP)

---

*Built with ❤️ for the Sanity Context MCP Hackathon (Path Two).*
