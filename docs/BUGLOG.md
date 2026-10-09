# BUGLOG - Walrus Memory friction and bug candidates

Policy: nothing gets filed as a bug until it is reproducible with exact steps, expected vs actual, and environment. This file is raw evidence first and verdicts later. Observations get logged the moment they happen, even when the cause is unknown.

## Entry template

- **ID:** BUG-000
- **Date:**
- **Surface:** SDK / MCP / relayer / docs
- **Status:** observing / needs-repro / confirmed / not-a-bug / filed
- **Environment:** OS, runtime, SDK version, model
- **Steps to reproduce:**
- **Expected:**
- **Actual:**
- **Raw evidence:** exact command and exact output
- **Alternative explanations not yet excluded:**
- **Verdict:** who is at fault, with reasoning
---

## BUG-001 - MCP cannot reach the relayer from this machine

- **Date:** 2026-09-29
- **Surface:** MCP / relayer
- **Status:** observing - cause not established
- **Environment:** Windows, Node 22.22.2, memwal MCP server invoked through npx
- **Steps to reproduce:** call the memwal health MCP tool, or request the relayer health endpoint directly
- **Expected:** a healthy response from the relayer
- **Actual:** the MCP tool reports the relayer unreachable after repeated handshake timeouts, sustained for over 2000 seconds. One direct request returned a TLS-level failure.
- **Raw evidence:**
  - MCP health call: "Walrus Memory could not reach the relayer ... Last handshake error: The operation was aborted due to timeout", and at another point "fetch failed"
  - direct request to the relayer health endpoint: "curl: (56) schannel: server closed abruptly (missing close_notify)"
  - git clone over HTTPS to github.com fails with "unable to get local issuer certificate", while a request to api.github.com returns 200
- **Alternative explanations not yet excluded:**
  - a TLS-inspecting proxy or antivirus on this machine interfering with this specific host
  - local network or ISP filtering
  - a genuine relayer outage or TLS misconfiguration on the Walrus side
- **DNS note:** relayer.memory.walrus.xyz is a CNAME to ankc518e.up.railway.app (69.46.46.68), so the relayer runs on Railway
- **Verdict:** unknown. Do not file until the discriminating test below is run.

**The discriminating test:** repeat the same request from a machine on a different network, ideally a phone hotspot, and from an environment with no intercepting proxy. If the relayer answers there but not here, the fault is local. If it fails everywhere, it is theirs. This single test decides whether we have a bug report or an article anecdote.

---

## Friction worth documenting - not bugs

These are documented gaps rather than defects. They belong in the article and in the submission form improvement-idea field, and some may be worth filing as enhancement issues.

- no list-all or enumerate call for a namespace
- no update or delete primitive - storage is append-only
- no way to scope a recall by tag or category
- recall latency is paid on every message
---

## Addendum to BUG-001 - why this evidence is weaker than it looks

The MCP timeouts are the **least** trustworthy evidence. The MCP server is a separate Node process that may run inside a network-restricted sandbox. A blocked outbound connection from that process looks identical to a relayer outage, and we cannot tell the two apart from the error text.

The escalated curl is stronger evidence, because it runs outside the sandbox on the real network. It is still not conclusive: a TLS-inspecting proxy or antivirus on this machine could break one specific host while leaving api.github.com working perfectly.

Note also that the failures were **inconsistent across hosts** - api.github.com returned 200, raw.githubusercontent.com timed out, github.com failed certificate validation, and the relayer failed at the TLS layer. Inconsistent per-host behaviour is the signature of something in the middle of the connection, not of a single broken server.

**Conclusion: BUG-001 does not currently meet the bar for a bug report. It stays at observing. It should not be filed, and it should not appear in the article as a Walrus defect.**
---

# The bounty bar - calibrated from confirmed submissions

Two confirmed reports set the standard.

## Example 1 - open-redirect bypass in guest sign-in (issue #1024, fix #1026, WALM-708)

`isSafeRedirectUrl()` blocked `//` protocol-relative URLs but did not block a leading slash followed by a backslash. The check rejected strings starting with `//`, but WHATWG-compliant parsers - browsers and Node - still resolve `/\` to a different origin. So the guest sign-in flow could bounce a victim off-site immediately after creating a real session, giving a convincing post-auth phishing redirect. It also defeated an earlier HIGH fix (#106, HIGH-12) that only covered `//`.

## Example 2 - silently swallowed vote (issue #937, fix #945, WALM-657)

`PATCH /api/vote` checked for an existing vote using only `messageId`, but the actual write was scoped by `messageId` plus `chatId`. Any authenticated user could permanently and silently block another user from voting on a message in a public chat. The API kept returning 200 success while the vote never saved.
## What makes these bounty-grade

1. **Exact localisation** - a named function or a named endpoint, not a vague area
2. **A precise mechanism** - why the guard passes, and why the downstream consumer then disagrees with it
3. **A deterministic trigger** - one concrete input string or one request, no timing luck
4. **Concrete impact** - a post-auth phishing redirect, permanent silent data loss
5. **Expected vs actual** - stated explicitly
6. **Depth** - example 1 shows the bug defeats a previously fixed advisory, which proves real understanding
7. **They were real** - both were confirmed by maintainers and fixed within days

## The pattern to hunt

Both bugs are the same failure mode: **two pieces of code disagree about the same concept.**

- Example 1: the validator and the URL parser disagree about what `/\` means
- Example 2: the read and the write disagree about the vote identity key

So the heuristic is: find every place where a check, a read, and a write define the same thing differently. Normalisation mismatches - backslash, unicode, case, trailing slash, encoding - and scope mismatches about which fields make a record unique are the richest seams.

## Process note

Genuine security issues go to security@mystenlabs.com, not GitHub or Discord. The reporter of #1024 asked whether an unpatched security issue can still qualify for the bounty track, disclosed privately with an email thread, and asked about a coordinated public writeup after a fix lands. So if we find something exploitable, we email first. Logic bugs that are not exploitable go straight to a GitHub issue with repro steps.

## Where to look

Both confirmed bugs live in the **example apps** - apps/chatbot, apps/noter, apps/researcher - not in the core SDK.

That is good news twice over. We are reading that code anyway to learn the integration pattern, and auditing it needs no relayer access at all, which means it is completely unblocked by the network problem from BUG-001.

## Correction - 2026-10-05

An earlier note in this file claimed that the SDK cannot enumerate namespaces. That is wrong, and it is exactly the kind of unverified claim this file exists to prevent.

**listNamespaces(options?)** exists on the MemWal client and is exported. It returns a paginated **NamespacesResult**: a list of **NamespaceSummary** records (id, name, memory_count, storage_used, updated_at) plus **has_more** and **next_cursor**. Verified against node_modules/@mysten-incubation/memwal/dist/memwal.d.ts and types.d.ts.

Rule reinforced: nothing is written here as fact until it is re-checked against the type definitions or a live call. BUG-001 (MCP cannot reach the relayer from this machine) is still an environment issue on this machine, not a Walrus bug, and must not be filed.

