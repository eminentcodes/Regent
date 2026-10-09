# Open questions - what we have not settled

Living document. Everything here is undecided unless marked DECIDED, and blockers are marked as such.

## Decided already

- Web app first, Telegram moves to Phase 3 on the same memory core
- Next.js with TypeScript
- Memory is the product, not a bolt-on: two-tier design, per-user plus shared collective memory
- We do not re-skin the official example - we build the layers it deliberately omits
- The bug audit runs in parallel with the build, not as a later phase
- Bug hunting follows the calibrated bar in BUGLOG.md

## Blockers - we cannot go far without these

1. **The real business.** Do we have one? This decides Option A (support bot) versus Option C (tutor). Everything downstream depends on it.
2. **LLM provider and key.** Which model, which provider, and who holds the key. Without this we cannot test a single real conversation end to end.
3. **Bot name and one-line positioning.** Needed for the repo, the article, and the X post.
## Product scope - not discussed

4. What the bot actually does in v1: ordering, order status, complaints, general FAQ, or human handoff. Which of these are in, and which are explicitly out?
5. What the shop knowledge base contains: menu or catalogue, delivery zones and fees, opening hours, refund policy.
6. Success criteria beyond memory. Do we care whether answers are correct, or only that memory visibly works?
7. Human handoff: is there a "talk to a person" escape hatch, and what happens behind it?

## Memory design - partly discussed

8. The exact fact taxonomy and the extraction prompt. What qualifies as a memory, and what gets rejected.
9. Deduplication - how we avoid storing the same fact five times.
10. Conflict and supersede rules, and the UX when a fact changes.
11. Shared tier rules: what may be promoted to collective memory, the hard privacy guardrail, and who reviews it.
12. Whether end users can view, edit and delete their own memories, and the UX for that.
13. Retention and erasure policy. Walrus Memory is append-only, so true deletion may not be possible. We need a documented stance and a product answer to "forget everything about me".

## Decision log

- 2026-09-30: options C (tutoring bot), D (community moderator) and G (game NPC) scrapped by user preference. Still live: A (business support bot), B (internal helpdesk for a team), E (sales and lead qualification), F (personal assistant, companion, coach).
- 2026-09-30: stack additions confirmed - Tailwind CSS, Framer Motion, and a Lucide icon library. Frontend is owned by the GPT agent, core and backend by Codex. See AGENTS.md.

## Decision log

- 2026-10-05: **Direction locked. Single-tenant support bot for a grocery store.** All group and platform concepts removed.
- The existing code keeps its structure - one hardcoded workspace id, no multi-tenancy - so there is no rework. `group_id` columns stay as-is and hold a single value.
- Two memory tiers replace the three-tier group design:
  - customer memory, private to one shopper
  - shop knowledge, what the store learns across all shoppers
  - the knowledge base, seeded from knowledge/catalogue.md and knowledge/policies.md, is a third read-only tier
- 2026-10-05: **Name locked.** The product is **Regent**. The in-chat nickname is **Reggie**. The shop is **Regency Stores**. The workspace id is regency.
- 2026-10-05: The frontend brief is written at docs/FRONTEND-BRIEF.md and is the single source of truth for the UI agent.
- 2026-10-05: Backend built and verified. npm run build and npm run typecheck pass. Auth, me, memory and shared routes smoke tested against the running dev server in mock mode.
- Why grocery beats restaurant: baskets repeat, the basket itself is personal, and memory has obvious value ("you usually buy this, we are out, here is a substitute").
