# SHIPCHECK — Production Change Pre-Flight Verification Agent

> **Tagline:** *"Before you ship a change, let the agent try to break your plan."*  
> **Event:** Sanity Context Hackathon / DEV Community Challenge  
> **Status:** Draft v1 — Verified & Live on `http://localhost:3000`

[![Next.js 15](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![Sanity Context](https://img.shields.io/badge/Sanity-Context%20Lake-f03e2f?logo=sanity)](https://sanity.io)
[![Multi-Hop GROQ](https://img.shields.io/badge/GROQ-Graph%20Traversal-blue)]()
[![Flagship Demo](https://img.shields.io/badge/Pre--Flight-Verified-emerald)]()

---

## 1. Problem Statement & Core Thesis

Engineers propose production changes (*"upgrade payments from v2 to v4 tonight"*) based on partial mental models. The facts that would invalidate the plan are real, written down, and already in the organization's documentation — but scattered across release notes, migration guides, internal architecture docs, and runbooks updated at different times by different teams.

### Why Standard AI / Vector Search Fails:
A standard RAG chatbot retrieves the most semantically similar text to a question, not the set of relationships that prove the plan unsafe. Vector similarity has no concept of:
- *"This doc supersedes that one"*
- *"This is an active policy exception to the general rule"*
- *"This dependency chain has two or three hops"*

### Core Thesis:
AI should not only help people execute decisions — it should **challenge decisions before they become failures**, using knowledge structure (dependencies, versions, contradictions, exceptions, authority) that plain retrieval cannot represent.

---

## 2. Key Demo Scenarios (PRD Section 3, 6, 8)

### 🚨 Scenario 1: The Canonical Failure (2-Hop Conflict & Drift)
- **Input:** `"Can I upgrade our payment service from v2 to v4 tonight?"`
- **Reasoning Chain:**
  1. Payment Service v4 ➔ requires Payment SDK >= v3.0.0 (Hop 1)
  2. Production currently runs Payment SDK v2.4.1 ➔ **[BLOCKER CONFLICT]** (Hop 2)
  3. Webhook format changed in v4 (JSON v2) ➔ internal architecture doc still assumes old XML format (auth 10 > auth 4) ➔ **[STALE DRIFT]**
  4. v4 supports PostgreSQL 16 ➔ **[OK - NOT A BLOCKER]**
- **Verdict:** **DO NOT SHIP YET** (with 3 cited reasons and full source trail).

### 🟢 Scenario 2: Positive Control (Safe Upgrade - G5 & FR9)
- **Input:** `"Can I upgrade our payment service from v2 to v3 tonight?"`
- **Result:** **SAFE TO SHIP** (proves the agent is not biased to always say "no").

### ⚡ Scenario 3: Exception-Hunter (Policy Exception - PRD 4.1)
- **Input:** `"Can I deploy emergency security hotfix v2.1 directly to production?"`
- **Result:** **SAFE TO SHIP (EXCEPTION APPLIED)** (GROQ traverses the `isExceptionOf` relationship from POL-02 to POL-01, granting staging soak bypass).

### 🎲 Scenario 4: Live Judge Challenge (FR8)
- **Input:** Free-text input to test unscripted proposals against the Sanity Content Lake.

---

## 3. Architecture: Deterministic Traversal Before LLM

```
User Input: "Can I upgrade our payment service from v2 to v4 tonight?"
                            │
                            ▼
              ┌───────────────────────────┐
              │      Proposal Parser      │
              │ Component: PaymentService │
              │ Current: v2, Target: v4   │
              └─────────────┬─────────────┘
                            │
                            ▼
     ┌─────────────────────────────────────────────────────────────┐
     │   Deterministic Graph Traversal (GROQ / Sanity Context)     │
     │ 1. Fetch current component & dependency versions            │
     │ 2. Fetch versionConstraints for target version (v4)         │
     │ 3. 2-Hop Traversal: v4 -> requires SDK v3 (prod has v2)    │
     │ 4. Fetch appliesToComponent knowledgeEntries & runbooks     │
     │ 5. Trace contradicts[] / supersedes chains (webhook drift)  │
     │ 6. Evaluate isExceptionOf rules (hotfix staging bypass)     │
     └──────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
     ┌─────────────────────────────────────────────────────────────┐
     │       Deterministic Conflict & Authority Resolver           │
     │  - Authority Level: release-notes (10) > internal-doc (4)   │
     │  - Recency Tiebreaker: lastVerified / effectiveDate         │
     │  - Yields: Hard Blockers, Stale Drift, Non-Blockers         │
     └──────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
     ┌─────────────────────────────────────────────────────────────┐
     │                Evidence Graph Assembler                     │
     │  Structured JSON: { verdict, reasons[], graphTrace, groq }  │
     └──────────────┬───────────────────────────────┬──────────────┘
                    │                               │
                    ▼                               ▼
     ┌──────────────────────────────┐ ┌────────────────────────────┐
     │  Verdict & Evidence Trail UI │ │ Side-by-Side Vector Search │
     │  - Conclusion ➔ Evidence ➔   │ │ - Shows generic RAG        │
     │    Source ➔ Condition        │ │   saying "looks good"      │
     │  - Literal GROQ Terminal     │ │   missing the 2-hop blocker│
     └──────────────────────────────┘ └────────────────────────────┘
```

> **Critical Design Rule:** The LLM is never the component that discovers the dependency or contradiction chain. The GROQ traversal runs and produces a resolved evidence graph first.

---

## 4. Sanity Content Lake & Schema

- **`component`**: `name`, `currentVersion`, `serviceOwner`, `dependencies`, `requiredBy`.
- **`versionConstraint`**: `component`, `version`, `requiresComponent`, `requiresVersionRange`, `notes`.
- **`knowledgeEntry`**: `title`, `body`, `sourceType`, `effectiveDate`, `lastVerified`, `authorityLevel` (1-10), `appliesToComponent`, `dependsOn`, `supersedes`, `contradicts`, `isExceptionOf`.

---

## 5. Quickstart

### Prerequisites
- Node.js >= 18.0.0
- npm or pnpm

### Run Locally
```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Start server
npx next start -p 3000 -H 0.0.0.0
```

Open **`http://localhost:3000`** in your browser.

---

## 6. License
MIT • Built for the Sanity Context Hackathon / DEV Community Challenge.
