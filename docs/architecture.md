**STATUS: superseded by ideas.md.** This doc describes the Telegram-first plan. The current plan is web-first - see ideas.md for the revised stack, the two-tier memory design, and the roadmap.

# Walrus Session 8 - Proposed Architecture

Companion to temporary.md. This is the build proposal.

## The pitch

**"The Regular"** - a Telegram bot for one small business that remembers every customer, so nobody has to repeat themselves.

Concretely: a customer messages the shop bot to order or ask about a delivery. The bot remembers their name, usual order, address, allergies, payment habit, and every past problem. Next week, from a different device, it opens with "Same jollof, same Yaba address as Thursday?" instead of asking who they are.

## Why this shape wins

- Real users come free - the shop own customers - on phones and desktops
- The before/after gap is brutal and instantly filmable
- It matches the support use case the judges expect
- Ten memories per user happens naturally within a few conversations
---

## The memory cycle

Every inbound message runs the same seven steps.

1. **Identify** - map the Telegram user id to an internal user
2. **Recall** - semantic search in that user namespace for memories relevant to the message
3. **Compose** - system persona, shop knowledge, recalled memories, and the last few turns
4. **Generate** - call the LLM
5. **Reply** - send back to Telegram with a quiet "recalled 3 things" marker
6. **Extract** - a background job asks the LLM for atomic facts worth keeping
7. **Write** - remember each fact, and mirror it into a local index

Steps 6 and 7 must be async. Never block the reply on a Walrus write.

## Memory design - this is where the project is won or lost

Recalled text is only as good as what you wrote, so the writer matters as much as the reader.

- Store **atomic third-person facts**, not raw turns: "Ada prefers jollof without pepper", not "hi can i get jollof no pepper pls"
- Tag every fact with a family so recall can be filtered and explained:
  - **profile** - name, address, phone, allergies
  - **pref** - preferences and habits
  - **event** - "ordered 2 plates on Tuesday"
  - **issue** - "had a late delivery on Sep 21, refunded"
- Never store chit-chat, greetings, or anything the model had to guess
- On conflict, write the new fact and mark that it supersedes the old one, so the bot can say "updated your address"
---

## Namespace strategy

- **owner** = the shop Walrus Memory account, one delegate key that the app holds
- **namespace per user** = shop/:shopId/user/:userId
- one optional **shared namespace per shop** for shop-wide lore the bot should know

Per-user namespaces are what give you memory that follows a person across sessions and devices without leaking between customers. Users never need a wallet - the app writes on their behalf.

## Stack

- **Runtime:** Node 22 + TypeScript, one project, two entrypoints (bot and dashboard)
- **Chat:** grammY for Telegram. No app review, works on every device, instantly shareable
- **LLM:** Gemini 2.5 Flash as primary (Google, so it qualifies for Beyond the Big Two) with Groq Llama as a fallback for speed or outages
- **Memory:** `@mysten-incubation/memwal` talking to mainnet
- **Local mirror:** SQLite for the dashboard, audit trail, and evidence collection
- **Dashboard:** Fastify plus one small server-rendered page. Keep it boring
- **Deploy:** Railway or Fly.io. It has to stay up for days while real people use it
## Repo shape

```text
src/
  bot/          Telegram handlers and commands
  memory/       MemWal wrapper, extractor, tagging, conflict handling
  llm/          provider clients behind one interface
  persona/      shop config: name, tone, menu, rules
  dashboard/    memory viewer and admin page
  db/           SQLite schema and queries
scripts/
  smoke-memory.ts
  memory-report.ts
personas/shop.ts
ARCHITECTURE.md
README.md
```

## The four things that will make judges remember us

1. **A `/memory` command plus a web dashboard** - the customer can see exactly what the bot knows, and delete anything wrong. Almost nobody will build this, and it turns memory from a claim into a visible artifact.
2. **A recall marker in chat** - a quiet "remembers 3 things" line. Memory doing work, captured in the screenshot.
3. **A memory-off switch** - run the same bot with per-session namespaces to generate your own before/after. Rehearsed evidence instead of a claim.
4. **An admin page counting memories per user** - directly proves the "3 users, 10 memories each" requirement in a single screenshot.
## The honest friction we will document

- Recall runs on every message, so it costs latency, and the relayer has no cheap "list everything" call. Enumerating a user memories for the dashboard needs a local mirror or tag-prefixed queries. That is a real gap and good bug-bounty material.
- Embedding quality for Nigerian names, Pidgin, and local slang deserves a proper test. If recall is measurably worse for "Chinedu" than for "Christopher", that is a genuinely useful finding.
- Conflict handling is on us, not the relayer. There is no update or delete primitive for a memory, only append.

## Variants, if you want a different flavour

- **Campus tutor that remembers** - same architecture, personas swapped for a course, memories become misconceptions and syllabus progress, users are coursemates. Weaker real-world story, stronger emotional moments.
- **Onboarding buddy** - remembers where a new hire got stuck and never re-explains a step. Great B2B story, but you need a company to deploy into.
- **Personal concierge** - remembers your life across months. Biggest "wow", hardest to get three people using it daily.

The architecture is unchanged for all three. Only the persona and the extractor prompts change.
## Day-by-day against the Oct 9, 2:00 PM UTC deadline

- **Sep 29-30** - fix the TLS/CA issue, scaffold the repo, prove a mainnet remember plus recall round trip
- **Oct 1** - memory module: extractor, tagging, conflict handling
- **Oct 2** - bot loop, persona config, `/memory`
- **Oct 3** - dashboard plus the admin counter
- **Oct 4** - deploy to Railway or Fly, smoke test from a phone
- **Oct 5-8** - onboard 3+ real users, keep it running, collect logs and screenshots, iterate
- **Oct 8-9** - file the bug report, write and publish the article, post on X, submit the form
- **Oct 9, 14:00 UTC** - deadline

## Immediate next decisions

1. Which real business do we attach this to, or do we run the campus tutor instead?
2. Telegram confirmed as the channel?
3. Is a Gemini key available today, or do we start on Groq?
4. What is the bot called?


