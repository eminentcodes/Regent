# Product definition - Option B, the group helpdesk

## One line

A helpdesk agent for a group that keeps answering the same questions. It remembers who asked what, and it gets smarter for everyone as more people ask.

## The problem

In any group - a class, a cohort, a society - the same handful of questions come back every week. The most patient person answers them again, slightly differently. New members cannot find the old answer. Nothing is ever written down.

## What this is not

Not a general assistant, and not ChatGPT. It does not answer from the open internet. It answers from the group own knowledge base, remembers the individual, and accumulates what the group learns. The framing for the article: it is not a chatbot that happens to remember, it is a knowledge base that writes itself out of conversations.

## Who uses it

Members of one group. At least three real people, each storing at least ten memories, which is the brief requirement.

## Core experience

1. A member asks a question.
2. The bot recalls what that member asked before, and what the group already learned.
3. It answers, and shows what it remembered.
4. It stores anything worth keeping - about the person, and about the group.
## Two tiers of memory

- **Per user:** what this person asked, their level, what confused them, what they were told last time.
- **Shared:** the group accumulated answers and the questions that keep coming back.

**Privacy guardrail:** personal facts never cross into the shared tier. The shared writer is explicitly forbidden from storing names, contact details, or anything identifying. Every shared write is reviewed against that rule.

## The three moments that prove it works

1. **The recall moment** - "you asked me this on Tuesday, here is the answer I gave you."
2. **The compounding moment** - "four other people have asked this, here is the consolidated answer."
3. **The correction moment** - the user fixes a memory, and the bot behaves differently afterwards.

Those three moments are what the article is built around, and what the demo video shows.

## v1 scope

**In:** chat with streaming, memory recall, fact extraction, the memory page, the shared learnings page, the admin counter, email and password auth.

**Out:** file uploads, voice, human handoff, Slack or Discord integrations, multi-tenant.

## Who builds what

- **Backend and core** - Codex. Memory module, MemWal integration, extraction and tagging, API routes, database, auth, tenant config, audit.
- **Frontend and UI** - GPT. Chat interface, memory page, shared learnings page, styling, animation, icons.

The boundary between the two is the HTTP contract, documented in docs/API-CONTRACT.md. Backend owns the shape of every request and response. Frontend owns everything rendered.

## Still open

- the group, which is not named yet - this is the last blocker for real users
- the product name, which only affects branding, the README and the article title
