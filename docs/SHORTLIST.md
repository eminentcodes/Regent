# The shortlist, in detail

Status as of 2026-09-30. Scrapped: C (tutoring bot), D (community moderator), G (game NPC). Still live: A, B, E, F.

## First - the thing that makes this decision smaller than it feels

All four remaining options are **the same code**. Chat UI, memory module, MemWal integration, fact extraction, the memory page, the admin counter, deployment - all identical.

The only things that change between them are:

- the persona (who the bot pretends to be)
- the knowledge base (what it knows about the domain)
- who the users are
- what counts as a memory worth storing

Those are all **config and prompts**, not architecture. Which means the choice is not an engineering decision - it is a distribution decision: **which audience can you actually get?**

And because it is config, **the decision is reversible for the first few days**. We can build the entire memory core now, which every option shares, and commit to a persona only when we start recruiting users.

## A. Support bot for one real small business

- **What it is:** a chat widget for a shop. Customers ask about orders, delivery, stock, complaints.
- **Who uses it:** the shop customers.
- **Remembers per user:** name, address, usual order, allergies, payment habit, past complaints.
- **Shared tier:** shop knowledge. "Customers keep asking about Lekki delivery." "The promo code confuses people."
- **Before/after:** without memory it asks "what is your address?" every single time. With memory: "Same Yaba address as Thursday?"
- **Demo quality:** the best of the four. Instantly understood, visceral.
- **Getting real users:** hard. Needs a shop you personally know. You said you do not have one.
- **Risk:** with no real shop, the customers are you and your friends roleplaying. Judges will smell that.
- **Verdict:** best story, worst distribution for you right now.
## B. Helpdesk for a group you already belong to

- **What it is:** a helpdesk bot for a group of people who keep asking the same questions. A class group, a hackathon cohort, a student org, a volunteer team, a friends group chat.
- **Who uses it:** members of that group.
- **Remembers per user:** what each person already asked, their level, what confused them, what they were told last time.
- **Shared tier:** the group accumulated answers. "Five people asked about the submission deadline." "The fix for the install error is X."
- **Before/after:** without memory, person six gets the same long answer as person one. With memory: "Ade asked this last week, here is the answer, and here is the part that confused him."
- **Demo quality:** strong, and the shared tier makes it distinctive rather than generic.
- **Getting real users:** medium to easy, but only if you have a group. You are in a hackathon cohort, a class, several group chats.
- **Risk:** the group has to actually use it, not just you.
- **Verdict:** best balance of story and distribution.

## E. Sales and lead qualification bot

- **What it is:** a bot that qualifies leads and remembers them across touchpoints and across reps.
- **Who uses it:** prospects, and the sales team.
- **Remembers per user:** budget, timeline, objections, what was promised, when they were last contacted.
- **Shared tier:** team-wide lead intelligence, so a handover does not lose the thread.
- **Before/after:** a lead talks to one rep, then another, and never repeats themselves.
- **Demo quality:** good, but it needs a CRM-shaped story to land.
- **Getting real users:** hard. It needs actual leads.
- **Risk:** without leads it is a toy with a business costume.
- **Verdict:** skip unless you genuinely have a pipeline.
## F. Personal assistant, companion or coach

- **What it is:** a personal bot that remembers your life - goals, habits, mood, people, plans.
- **Who uses it:** individuals. Literally anyone.
- **Remembers per user:** goals, streaks, preferences, what you said last week, how you felt, what you committed to.
- **Shared tier:** none, really. Maybe opt-in tips.
- **Before/after:** "Last week you said you would finish the proposal by Friday. How did it go?"
- **Demo quality:** emotionally strong. It lands with people.
- **Getting real users:** the easiest of all four. Any three friends.
- **Risk:** no across-users story, so judges may file it as a generic AI companion.
- **Verdict:** easiest distribution, weakest differentiation.

## Side by side

| Option | Users needed | Shared tier | Real users | Story strength | Not-a-generic-chatbot ?
| A. Business support | shop customers | shop knowledge | hard | best | yes |
| B. Group helpdesk | group members | group answers | medium | strong | yes |
| E. Sales and leads | prospects | team intel | hard | medium | yes |
| F. Personal coach | any individual | none | easy | emotional | risky |

## The decision rule

Answer exactly one question: **name three people who will message this thing at least twice, on different days.**

- if those three are a shop customers, pick **A**
- if those three are members of a group you are already in, pick **B**
- if those three are just friends, pick **F**

Whichever line you can actually fill in, that is the answer. The idea does not decide this. The audience does.
## Recommendation

**B.** It is the only option where a real audience is plausible *and* the memory story is strong.

A has the best story but you have no shop, and invented customers is the one thing that loses points with judges. E needs a pipeline you do not have. F is easy to fill with users but has no reason for memory to matter beyond one person, which is the weakest possible answer to "does memory do real work".

B wins because it is the only one that answers the actual question the brief asks: **does one person conversation make the bot better for the next person?** In B that is the natural product behaviour, not a bolted-on feature.

## What unblocks us tonight

The only real question left is: **which group?**

Name the actual chat. Examples that would work:

- your class or department group
- the hackathon cohort Discord or WhatsApp
- a student society or org you belong to
- a church or volunteer group
- any group chat where the same questions keep coming back

Say the name and I will write the product definition against it, choose the persona, and we start building the core tonight. If no group exists at all, we go F and accept the weaker story - but that is a last resort.

