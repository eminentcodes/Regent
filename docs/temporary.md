# Walrus Session 8 - "Chatbots That Remember"
## Working notes (ideation) - 2026-09-29

Temporary scratch doc. Will be converted into the real project brief once we lock direction.

---

## 1. The brief in one paragraph

Build a chatbot that uses **Walrus Memory** to remember across sessions, users, and devices. Deploy it somewhere real, use it for a few days with real people, then write about what changed.

- **Deadline:** Oct 9, 2:00 PM UTC
- **Prize pool:** $2,500 in WAL, across five tracks
- **Memory must be on mainnet**

### Hard requirements

- Chatbot stores and recalls context via Walrus Memory, on **mainnet**
- Deployed somewhere people actually talk to (widget, Telegram, Discord, WhatsApp, Slack, CLI...)
- Used by real people for at least a few days
- **At least 3 different users, each storing at least 10 memories**
- Public GitHub repo, open source, with setup instructions
- Article on Medium or Inkray, roughly 500-800 words, written as your own story
- X post tagging @WalrusProtocol with #WalrusMemory
- Submission form wants: LLM/runtime used, repo link, one bug or friction point plus one improvement idea, article link, X post link
### Prize tracks we can stack

- **Best Chatbot** - $500 / $250 / $150 - judged on memory doing real work plus real use
- **Beyond the Big Two** - 2 x $150 - primary LLM is NOT Anthropic or OpenAI (Gemini, Groq/Llama, Ollama...)
- **Best Article** - 3 x $100 - best written story about the build
- **Bug Bounty** - 5 x $100 - reproducible bug filed as a GitHub issue on MystenLabs/MemWal
- **Promo Prize** - 5 x $100 - post about the session in a third-party community (NOT X, NOT Sui/Walrus channels)

**Strategy: one build can feed four of these.** Pick a non-OpenAI/Anthropic model to unlock "Beyond the Big Two" for free, file whatever friction we hit, and write the article properly.
---

## 2. What the tooling actually looks like

Package: `@mysten-incubation/memwal` on npm. Peer deps: `@mysten/sui`, `@mysten/seal`, `@mysten/walrus`, `ai`, `zod`.

```ts
import { MemWal } from "@mysten-incubation/memwal"

const memwal = MemWal.create({
  key: "your-delegate-key-hex",
  accountId: "your-walrus-memory-account-id",
  serverUrl: "https://your-relayer-url.com",
  namespace: "demo",
})

const job = await memwal.remember("User prefers dark mode and uses TypeScript.")
await memwal.waitForRememberJob(job.job_id)

const memories = await memwal.recall({ query: "What are the user preferences?" })
await memwal.restore("demo")
```

### Key facts

- remember / recall / restore is the whole surface we need.
- The **relayer** does embedding, encryption, Walrus upload, download and retrieval. We do not touch Walrus directly.
- Every operation is scoped to **owner + namespace**. This is the main design lever:
  - one namespace per user means memory follows that person across sessions and devices
  - one namespace per shared group means memory is shared across users
- Other exports: `@mysten-incubation/memwal/manual` (you handle embedding and local SEAL yourself) and `@mysten-incubation/memwal/ai` (Vercel AI SDK middleware for `streamText` / `generateText`).
- Mainnet relayer: https://relayer.memory.walrus.xyz
- This machine already has mainnet delegate credentials and a live `accountId`, so the SDK can talk to mainnet with no fresh setup.
- Useful links: github.com/MystenLabs/MemWal, docs at docs.wal.app/walrus-memory, docs site memory.walrus.xyz, chatbot example at docs.wal.app/walrus-memory/examples/chatbot, and `SKILL.md` in the repo root.

---

## 3. Environment findings (fix these first)

- C:\Users\Great\Desktop\chatbot was **completely empty** - no repo, no files.
- The **memory relayer is unreachable from this machine** right now. The MCP tools time out and direct HTTPS to the relayer is refused.
- `git clone` over HTTPS fails with *"unable to get local issuer certificate"*.

**Diagnosis:** these two symptoms together point at a **broken local CA store on this Windows machine** (likely a TLS-inspecting proxy or antivirus whose root cert is not trusted), not a Walrus outage.

**Likely fixes** (test before we need them):

- `NODE_EXTRA_CA_CERTS` pointing at the proxy/interception root cert
- the `NODE_TLS_REJECT_UNAUTHORIZED=0` workaround already used elsewhere on this machine
- repair the Windows certificate store, export and trust the interception root

This matters a lot: nothing in this project works until the relayer is reachable. Also worth knowing - if we can isolate a real Walrus-side failure underneath this, it is bug-bounty material.
---

## 4. What actually decides this round

The judging is *"does memory do real work?"* and *"did real people use it?"*

So the design question is really:

1. Can you hand a link to 3+ people this week and will they actually chat with it for several days?
2. Is the before/after gap painfully obvious?

Everything else is secondary.

---

## 5. Four candidate builds

### Option 1 - "The Regular": Telegram bot for one real small business

Remembers each customer: name, usual order, delivery address, allergies, payment habits, past complaints.

- **Before/after:** without memory it asks for the address every single time. With memory: *"Same delivery to Yaba as Thursday?"*
- **Real users:** free - the shop own customers.
- **Cross-device:** Telegram on phone plus desktop literally satisfies "across sessions, users, and devices".
- **Strength:** hits the support use case judges expect, with the sharpest possible demo.
- **Risk:** needs a real business behind it.

### Option 2 - "Study Buddy": a tutor that remembers you

Remembers your syllabus, the topics you keep fumbling, your past mistakes, and revisits them days later.

- **Before/after:** "you got integration by parts wrong twice last week, let us try again" - emotionally strong.
- **Real users:** coursemates.
- **Strength:** 10 meaningful memories per user is completely natural for a student. Spaced review is a genuine *reason* memory must persist.
- **Risk:** slightly softer "real world" story than a business.
### Option 3 - Team helpdesk in Slack or Discord

Remembers per-employee IT/HR issues so nobody re-explains the same problem.

- **Strength:** fresh B2B angle, real internal pain.
- **Risk:** Slack app setup and review burns days we do not have.

### Option 4 - Game NPC that remembers you

- **Strength:** fun, very demo-friendly, distinctive.
- **Risk:** hard to get people to come back over "a few days", which is an actual judging criterion.

---

## 6. Recommendation

**Build Option 1, and add a memory-transparency layer.**

A small web page where a user can see exactly what the bot remembers about them, and correct or delete it. That does three things at once:

- makes "memory doing real work" **visible to judges in a screenshot**
- gives us a **differentiating feature** nobody else will have
- turns the article into a story about *what it remembered and how people fixed it*, instead of a feature list

Then stack the free prizes:

- use a **non-OpenAI / non-Anthropic LLM** (Gemini or Groq/Llama, both have free tiers) to qualify for **Beyond the Big Two**
- file whatever friction we hit as a **Bug Bounty** issue
- write the article deliberately as a build story for **Best Article**

Four prize pools, one build, almost no extra work.
---

## 7. Questions to settle before locking the design

1. **Do you have a real business we can attach this to**, a shop or a friend business with actual customers? If yes, Option 1 is a slam dunk. If no, we pivot to Option 2 and coursemates are the users.
2. **Telegram as the channel?** Fastest to ship, works on any device, no app review. Or WhatsApp / Discord / web widget instead?
3. **Which non-OpenAI/Anthropic LLM can you get a key for today?** Gemini, Groq, OpenRouter, or local Ollama?
4. **One business, or configurable multi-tenant?** My vote: make the support persona configurable from day one, but deploy it for exactly one real business. Multi-tenant-by-design costs almost nothing now and makes the repo far more impressive.

---

## 8. Open action items

- [ ] Fix the local CA / TLS issue so the relayer is reachable
- [ ] Answer the four questions above
- [ ] Lock direction, then convert this doc into the project brief
- [ ] Day-by-day schedule against the Oct 9, 2:00 PM UTC deadline

