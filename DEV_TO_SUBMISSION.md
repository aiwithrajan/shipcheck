---
title: SHIPCHECK: Autonomous Pre-Flight Release Gatekeeper Powered by Sanity Context MCP
published: true
tags: sanitychallenge, devchallenge, ai, mcp
cover_image: https://raw.githubusercontent.com/your-username/shipcheck/main/public/cover.png
canonical_url: 
---

*This is a submission for the [Sanity Context MCP Hackathon](https://dev.to/challenges/sanity).*

---

## 💡 What I Built

Modern engineering teams increasingly rely on autonomous AI coding agents (Claude Code, Cursor, Copilot) to generate code and push infrastructure pull requests. However, when these agents evaluate whether a service can be safely promoted to production, they almost universally rely on **naive vector similarity search** (e.g., Pinecone, standard RAG). 

**In production infrastructure, vector similarity search is dangerous.** If you ask:
> *"Can I upgrade payment service from v2 to v4 tonight?"*

Vector search finds semantic text matches on "payment service" and happily responds *"Looks safe!"* — completely blind to upstream multi-hop dependencies, active cluster container versions, and contradictory documentation. The result? **Catastrophic P0 outages in production.**

### Enter SHIPCHECK 🚢🛡️

**SHIPCHECK** is an autonomous pre-flight production release gatekeeper. Built as a full **ReAct (Reasoning + Acting) Agent**, SHIPCHECK connects directly to a live **Sanity Content Lake** via the **Model Context Protocol (MCP)**. 

Before any code deployment or pull request is merged:
1. **Traverses 2-Hop Dependency Graphs via GROQ:** Discovers hidden dependency chains that keyword search never sees.
2. **Cross-References Real-World Cluster State:** Audits the target requirements against live Kubernetes pod versions.
3. **Resolves Architectural Documentation Drift:** When stale internal wikis conflict with official release specifications, SHIPCHECK programmatically arbitrates using **Authority Weighting (1–10)**.
4. **Live Counterfactual Fix Simulation:** Allows engineers to simulate a cluster patch (e.g., upgrading an SDK) and watch the dependency graph and verdict flip from `DO NOT SHIP YET` to `SAFE TO SHIP` before touching live servers.
5. **Generates Actionable 4-Phase Remediation:** Produces executable `kubectl` rollout commands, migration schemas, and emergency rollback scripts.

---

## 🎥 Video Demo

{% youtube dCaqBXgoQF0 %}

*(Full in-depth walkthrough of the autonomous ReAct agent, live Sanity GROQ traversal, reasoning traces, and fix simulation).*

---

## 🌐 Live Demo & Repository

- 🔗 **Live Web Application:** [https://sanity-omega-ten.vercel.app](https://sanity-omega-ten.vercel.app)
- 💻 **GitHub Repository:** [https://github.com/aiwithrajan/shipcheck](https://github.com/aiwithrajan/shipcheck)
- 🗄️ **Sanity Content Lake Project ID:** `70rd1u6b` (Dataset: `production`)

---

## 🧠 Why Sanity + MCP is the Secret Weapon

Vector databases reduce knowledge to flattened floating-point embeddings. They cannot represent:
- *X requires Y at version >= 3.0* (Relational constraints)
- *Document A supersedes Document B* (Contradiction resolution)
- *Policy B is an emergency exception to Policy A* (Conditional exceptions)

By storing our organization's infrastructure knowledge inside **Sanity Content Lake**, we treat documentation as a **queryable, structured knowledge graph**:

```groq
// 2-Hop Traversal: Find all upstream service constraints and target versions
*[_type == "component" && name == $componentName][0] {
  name,
  currentVersion,
  "constraints": *[_type == "versionConstraint" && targetComponent._ref == ^._id] {
    requiredComponent-> { name, currentVersion },
    operator,
    version,
    criticality
  },
  "docs": *[_type == "knowledgeEntry" && references(^._id)] | order(authorityLevel desc) {
    title,
    authorityLevel,
    sourceType,
    "contradicts": contradicts[]->title,
    "isExceptionOf": isExceptionOf->title
  }
}
```

Through the **Sanity Context MCP**, this knowledge graph is exposed directly via JSON-RPC 2.0 to AI agents.

---

## 🛠️ How It Works (The 13-Step ReAct Cognitive Loop)

When a developer or CI/CD runner asks a question, SHIPCHECK executes an autonomous ReAct loop:

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

---

## 📊 Empirical Comparison: Naive Vector Search vs. Sanity Graph

| Test Query | Naive Vector Search (Pinecone/RAG) | SHIPCHECK (Sanity GROQ Graph) |
|---|---|---|
| *"Can I upgrade payment service from v2 to v4 tonight?"* | ❌ **DANGEROUS FALSE POSITIVE:** *"Upgrade looks safe! Found Payment Service docs."* (Missed 2-hop SDK constraint because "SDK" was not in user's query). | ✅ **100% ACCURATE BLOCKER:** Catches that cluster SDK v2.4.1 violates `>= v3.0.0` requirement. Outage prevented. |
| *"Deploy emergency hotfix v2.1 directly to production?"* | ❌ **FALSE NEGATIVE:** Flags violation of 24h soak policy, missing the legal exception policy. | ✅ **EXCEPTION RECOGNIZED:** Detects `isExceptionOf` relationship, authorizing emergency bypass with lead sign-off. |

---

## 🏗️ Architecture & Tech Stack

- **Knowledge Layer:** [Sanity Content Lake](https://www.sanity.io/) (18 interconnected schema documents across Components, Constraints, and Policies).
- **Interface Protocol:** Model Context Protocol (MCP) JSON-RPC 2.0.
- **Frontend & Agent Core:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS.
- **Design System:** Deep Navy (`#0a0e1a`) + Cyan/Teal (`#06b6d4`) + Inter typography.
- **Cognitive Loop:** Autonomous ReAct engine (`lib/agent/preflightAgent.ts`).
- **Remediation Engine:** Deterministic 4-phase rollout plan generator (`lib/engine/remediationEngine.ts`).

---

## 🚀 What's Next?

- **GitHub Actions & GitLab CI Native Bot:** Post automated SHIPCHECK verdict badges and remediation comments on incoming Pull Requests.
- **Multi-Cloud Topology Ingestion:** Auto-sync AWS/GCP live resource states into Sanity schemas on a scheduled webhook trigger.

---

*Built with ❤️ for the Sanity Context MCP Hackathon.*
