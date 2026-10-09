# Frontend brief - Regent (Regency Stores)

Owner: **GPT**. You build every rendered file. Codex (backend) owns lib/, config/, knowledge/, scripts/ and app/api/. Do not edit those. If you need a change to an API shape, ask first: docs/API-CONTRACT.md is the frozen boundary.

## The product in one line

Regent is the chat assistant for Regency Stores, a grocery shop in Yaba, Lagos. There is no product grid and no checkout. The chat IS the ordering system, and the assistant remembers each customer between visits and across devices.

## What already exists (do not rebuild)

- **Auth API** - register, login, logout, me.
- **Chat API** - streaming reply, recall, and background fact extraction.
- **Memory API** - list personal memory, forget one memory, list shop-wide learnings.
- **Admin API** - usage stats for the evidence screenshot.
- **Knowledge base** - seeded from knowledge/catalogue.md and knowledge/policies.md.
- **Session cookie** - HttpOnly, named regent_session, set by the auth routes.

## Pages to build

1. **/ - chat** (the main screen). Chat panel plus a live basket panel side by side. On mobile the basket collapses into a sheet.
2. **/memory** - what the assistant remembers about you, grouped by tag, with a Forget action per item.
3. **/shared** - what the shop has learned from customers as a whole.
4. **/admin** - the users table with a per-user memory count.
5. **/login** and **/register** - email and password.

## The guest-first flow

Chat needs a session, so gate the first message rather than the page.

1. Anyone can load / and see the assistant and the composer. No redirect.
2. On first send, call GET /api/me. If it returns 401, keep the typed text and show an inline gate in the thread: 'So I remember this next time, create an account.' Two buttons: Register and Sign in.
3. After auth succeeds, resend the held message automatically so the customer does not lose their turn.
4. Never block browsing. Only sending needs an account.

## Chat streaming (the important part)

Install and use **useChat** from **@ai-sdk/react** (backend will add the dependency).

POST /api/chat takes a JSON body of **{ message, conversationId? }** and answers with the AI SDK UI message stream. Wire useChat like this:

- set **prepareSendMessagesRequest** to send only the latest message text plus the stored conversationId, so you control the body shape.
- read the response headers in **onResponse**: **X-Conversation-Id**, **X-Recall-Count**, **X-Memory-Status**.
- save X-Conversation-Id in state and pass it back on the next turn so the thread continues.
- show a quiet recall chip from X-Recall-Count, for example 'remembered 3 things'. Hide it when the count is 0.
- when X-Memory-Status is degraded, show a small amber line: 'memory is offline right now, replies still work.' Degraded is a normal state, never an error screen.

## The right-hand panel

Call it **Your usual**, not Basket. There is no server-side cart in v1, so do not fake one. The panel reads GET /api/memory and lists the customer memories that describe what they buy and where they live (tags profile and pref). That is the panel that makes memory visible, and it is honest.

A true structured cart needs a new API and is out of scope for v1.

## API you call

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | /api/auth/register | email, password, displayName? | user, sets cookie |
| POST | /api/auth/login | email, password | user, sets cookie |
| POST | /api/auth/logout | none | ok |
| GET | /api/me | none | user, memoryCount |
| POST | /api/chat | message, conversationId? | UI message stream |
| GET | /api/memory | none | memories, counts |
| DELETE | /api/memory/:id | none | ok |
| GET | /api/shared | none | learnings |
| GET | /api/admin/stats | none | users, totalUsers, totalMemories |

Error shape everywhere: **{ error: { code, message } }**. Codes: unauthorized, invalid_input, not_found, email_taken, forbidden, rate_limited, memory_unavailable, internal.

## Visual direction

- **Stack**: Next.js app router, Tailwind CSS v4, motion (already installed as motion), lucide-react for icons.
- **Palette**: warm grocery green as the primary, one warm accent for the assistant, clean neutrals. Light and dark both.
- **Type**: Geist Sans (already wired in the root layout). Keep headings short.
- **Motion**: use motion for message entry and the recall chip only. No decorative loops.
- **Mobile**: single column, panel becomes a bottom sheet.

## Copy and tone

- The assistant is called **Reggie** in conversation. The product is **Regent**.
- Warm, short, WhatsApp-like. No markdown headings inside chat bubbles.
- Prices in Naira, like N14,500.

## Definition of done

- A signed-out visitor can see the chat and is asked to register only on first send.
- A reply streams and the header chip shows how many memories were used.
- /memory lists personal memories and Forget removes one.
- /admin shows three users each with a memory count, which becomes the evidence screenshot.
- npm run build passes with no type errors.
