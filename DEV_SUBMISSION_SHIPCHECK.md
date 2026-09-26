---
title: "SHIPCHECK: Before You Ship a Change, Let the Agent Try to Break Your Plan"
published: true
tags: sanitychallenge, devchallenge, sanity, devops, ai
canonical_url: false
cover_image: https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80
---

*This article is a submission for the [DEV Sanity Challenge](https://dev.to/challenges/sanity-2026-09-16) — **Path One: Ship an Agent That Queries Real Content**.*

---

## 1. What I Built

Engineers frequently propose production changes:
> *"Can I upgrade our payment service from v2 to v4 tonight?"*

They make these proposals based on partial mental models. The facts that would invalidate the plan are real, written down, and already in the organization's documentation — but scattered across release notes, migration guides, internal architecture docs, and incident postmortems updated at different times by different teams.

Standard AI tools fail catastrophically here. A typical RAG chatbot performs semantic similarity search over text chunks. But similarity search has no concept of:
- **Relational dependency chains** (*"v4 requires SDK v3, but production runs SDK v2"*)
- **Authority hierarchy** (*"Release Notes (auth 10) supersede Stale Architecture Docs (auth 4)"*)
- **Policy exceptions** (*"Emergency hotfixes bypass the 24-hour staging soak rule"*).

To solve this, I built **SHIPCHECK**: a pre-flight production verification agent powered by **Sanity Context and deterministic GROQ graph traversal**.

> **Tagline:** *"Before you ship a change, let the agent try to break your plan."*

---

## 2. The Core Thesis: Structure Beats Plain Retrieval

Plain RAG treats documentation as an unorganized soup of text embeddings. If you ask a Pinecone-backed chatbot:
> *"Can I upgrade our payment service from v2 to v4 tonight?"*

It matches keywords: *"payment"*, *"v4"*, *"upgrade"*, *"database"*. It sees that v4 is released, notices that PostgreSQL is supported, and answers:
> ❌ **Generic Vector Search:** *"Looks good to upgrade! Payment Service v4 is released and certified with PostgreSQL 16."*

**This false positive would cause an immediate P0 production outage.**

Why? Because the user didn't mention the word "SDK" in their prompt, vector search never retrieved the upstream SDK specification.

### How SHIPCHECK Solves It:
Instead of guessing, SHIPCHECK performs **deterministic GROQ graph traversal** over the Sanity Content Lake *before* any LLM narration:

```groq
// Hop 1: Find what target version v4 strictly requires
*[_type == "versionConstraint" && component._ref == $paymentComp && version == "v4"] {
  requiresComponent-> { name, currentVersion },
  requiresVersionRange
}

// Hop 2: Cross-reference active cluster state
// Payment SDK requires >= v3.0.0, but production currently runs v2.4.1 -> CONFLICT
```

### SHIPCHECK Verdict:
> 🚨 **DO NOT SHIP YET**
> 1. **Hard Blocker:** Upstream Payment SDK in production is `v2.4.1`, but v4 requires `>= v3.0.0` (will cause handshake rejections).
> 2. **Stale Doc Drift:** Internal architecture doc still assumes legacy XML webhooks, while v4 release notes specifies JSON v2 with HMAC signatures.
> 3. **Non-Blocker (OK):** PostgreSQL 15 is certified in the compatibility matrix.

---

## 3. Demo Walkthrough: 4 Load-Bearing Scenarios

SHIPCHECK is built with zero filler documents. All 18 knowledge entries participate in a dependency, contradiction, or exception relationship.

### 1. The Canonical Demo (Failure Case)
`"Can I upgrade our payment service from v2 to v4 tonight?"`
➔ **DO NOT SHIP YET** with 3 structured reasons, evidence trail, and 2-hop visualizer.

### 2. Positive Control (Safe Upgrade - G5 & FR9)
`"Can I upgrade our payment service from v2 to v3 tonight?"`
➔ **SAFE TO SHIP** (verifies that constraints for v3 are met by production SDK v2, proving the agent isn't biased toward "always say no").

### 3. Exception-Hunter (Policy Exception)
`"Can I deploy emergency security hotfix v2.1 directly to production?"`
➔ **SAFE TO SHIP (EXCEPTION APPLIED)** (GROQ walks `isExceptionOf` linking emergency policy POL-02 to the standard 24h soak rule POL-01).

### 4. Live Judge Challenge (FR8)
Judges can type unscripted proposals in the free-text input to test the graph traversal in real time.

---

## 4. Sanity Content Lake Schema Design

```typescript
// sanity/schemaTypes/knowledgeEntry.ts
export default {
  name: 'knowledgeEntry',
  title: 'Knowledge Entry',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'body', type: 'text' },
    { name: 'sourceType', type: 'string' },
    { name: 'effectiveDate', type: 'date' },
    { name: 'lastVerified', type: 'date' },
    { name: 'authorityLevel', type: 'number' }, // 1 to 10
    { name: 'appliesToComponent', type: 'array', of: [{ type: 'reference', to: [{ type: 'component' }] }] },
    { name: 'dependsOn', type: 'array', of: [{ type: 'reference', to: [{ type: 'knowledgeEntry' }, { type: 'component' }] }] },
    { name: 'supersedes', type: 'reference', to: [{ type: 'knowledgeEntry' }] },
    { name: 'contradicts', type: 'array', of: [{ type: 'reference', to: [{ type: 'knowledgeEntry' }] }] },
    { name: 'isExceptionOf', type: 'reference', to: [{ type: 'knowledgeEntry' }] },
  ],
};
```

---

## 5. Live App Features

1. **Pre-Flight Automated Verdict Card (FR5)**: Immediate SHIP / DO NOT SHIP banner with severity badges.
2. **Evidence Trail UI (FR6)**: 4-column breakdown: `Conclusion` ➔ `Evidence` ➔ `Source Doc` ➔ `Condition`.
3. **Multi-Hop Visualizer (G2)**: Interactive diagram showing Hop 0 ➔ Hop 1 ➔ Hop 2 ➔ Collision.
4. **Side-by-Side Proof (G3 & FR7)**: Real-time demonstration showing why naive vector search gives a dangerous false positive while SHIPCHECK catches the outage.
5. **Literal GROQ Inspector (FR10)**: Real-time collapsible panel displaying the exact GROQ queries and raw JSON graph payloads.
6. **Knowledge Base Explorer (Section 4)**: Inspection tool for all 18 grounded documents.

---

## 6. Links & Code

- **Live Instance:** Running on `http://localhost:3000`
- **Codebase:** Next.js 15, TypeScript, Tailwind CSS, Sanity Client

*Built for the DEV Community x Sanity Challenge 2026.*
