# Ideas, and the revised architecture

## 1. The hackathon use-case menu

The brief explicitly says what counts. Customer support is the obvious starting point, but anything where a bot talks to people and should remember them qualifies:

- Website support bot
- Onboarding assistant
- Internal IT / HR helpdesk
- Sales and lead-qualification bot
- Tutoring bot
- Community moderator
- Personal assistant
- Companion or coaching bot
- Game NPC

## 2. What the official example already gives us

From the MemWal repo, `docs/examples/chatbot.md`: a Next.js plus Vercel AI SDK chat app where memory is added by wrapping the model once.

```ts
const model = withMemWal(baseModel, {
  key,
  accountId,
  serverUrl,
  maxMemories: 5,
  autoSave: true,
})
```

It is deliberately the lightest-touch integration. Recall runs before each generation and new context is auto-saved after each turn. Their env expects auth, Postgres, Redis, object storage, and an LLM over OpenRouter.

**Read this carefully: if we clone the example and re-skin it, we are submitting the example.** Everything the judges will reward is what that example leaves out:

- no per-user identity or namespace isolation
- no memory the user can see, correct, or delete
- no curation of what gets written - `autoSave` stores whatever it decides is relevant
- no memory shared between users, which is the "across users" clause in the brief
- no domain logic: no tagging, no conflict handling, no supersede

So the strategy is: **stand on the middleware, then build the layers it deliberately omits.**

## 3. The wedge - "across users" is the part nobody will build

The brief asks for memory across sessions, across users, and across devices. A generic chat-with-memory app only really demonstrates the first and third. The second is the hardest and the most interesting, so that is where we should aim.

**Two-tier memory:**

- **Per-user memory, private:** this customer address, allergies, order history, past complaints
- **Shared memory, collective:** what the whole business should learn - "customers keep asking about Lekki delivery", "the 20% promo code causes confusion", "the VPN fix is to clear the token cache"

Shared memory is the killer feature. Seven customers asking the same question should make the bot smarter for the eighth. That is memory doing visible work, and it is exactly what the example cannot do.

One rule to design in from the start: the shared writer must be explicitly forbidden from storing personal data. Nothing private ever leaves a user namespace.
## 4. The shortlist, ranked for our constraints

Ranked on: can we get 3 real users fast, is the before/after obvious, does it show memory across users, does it fit a 9-day web build.

**A. Support bot for one real small business** - per-customer memory plus a shared business-knowledge tier.

- Users: the shop own customers. Free and real.
- Before/after: brutal. "Same Yaba address as Thursday?" against "what is your address?"
- Across users: yes, through the shared tier.
- Gap: needs a real business behind it.

**B. Internal helpdesk for a team** - remembers each person issues and accumulates fixes team-wide.

- Users: any team you can get access to.
- Across users: the strongest of all options. "This is the fifth VPN ticket, here is what worked."
- Gap: needs an organisation willing to use it. Best story, hardest access.

**C. Tutoring bot with cohort memory** - remembers each student misconceptions, plus the class common mistakes.

- Users: coursemates. Easy to recruit.
- Across users: natural. The bot learns that half the class gets integration by parts wrong.
- Gap: softer real-world framing than a business.

**D. Community moderator** - remembers members, history, prior warnings, and the community norms.

- Across users: strong.
- Gap: hard to deploy into a real community inside 9 days.

**E. Sales / lead qualification bot** - remembers leads across touchpoints and across reps.

- Gap: needs real leads. Weak demo without a CRM behind it.

**F. Personal assistant / companion / coach** - the most emotional option.

- Across users: essentially none. Weakest against the brief.

**G. Game NPC** - fun and demo-friendly, but hard to keep people returning over days.
## 5. Recommendation

**Build A.** A web chat app for one real small business, with per-customer memory, a shared shop-knowledge tier, and a memory page the customer can inspect and correct.

If no real business is available, fall back to **C** - same architecture, cohort shared memory instead of shop shared memory, coursemates as the users.

## 6. Revised architecture - web-first

**Stack**

- Next.js App Router plus TypeScript and Tailwind
- Vercel AI SDK for streaming, using `withMemWal` as the recall path
- `@mysten-incubation/memwal` on mainnet, server-side only, key never in the browser
- Supabase for auth and Postgres - identity, plus the local mirror for the dashboard and evidence
- LLM over OpenRouter so we can pick a non-OpenAI/Anthropic model: Gemini, Qwen, DeepSeek or Llama
- Deploy on Vercel

**Memory cycle, per message**

1. identify the user from the session
2. recall from the personal namespace
3. recall from the shared namespace
4. compose: persona, shop knowledge, both recall sets, recent turns
5. generate and stream the reply
6. after the stream finishes, extract atomic facts and write them

Two namespaces matter: `user/:userId` for private memory and `shop/:shopId/shared` for collective memory.

**Known friction to document**

- Walrus Memory is append-only, so "forget this" writes a local tombstone and filters it out of recall
- there is no list-all call, so the dashboard reads the Postgres mirror while recall still goes to the relayer
- every message costs a relayer round trip, so recall needs a timeout and a graceful fallback

**Roadmap**

- **Phase 1 - web app.** Chat, streaming, the memory cycle, the memory page, the shared tier, the admin counter.
- **Phase 2 - embeddable widget.** Ship the chat as a script tag or iframe a business can drop on its own site. This is what makes it deployed-somewhere-real.
- **Phase 3 - Telegram bot.** Same memory core, different transport. grammY, identical namespaces and extractor.
- **Phase 4 - multi-tenant personas.** Config-driven shops and verticals.

