# API contract

Owner: backend (Codex). The frontend (GPT) builds against this document. Any change to a route shape must be announced before it lands.

## Ground rules

- Base path is the same origin, under ~~/api~~.
- Auth is a session cookie, HttpOnly, set by ~~POST /api/auth/login~~.
- Every route except register and login requires a valid session.
- Unauthenticated requests get ~~401~~ with the standard error body.
- All bodies are JSON. All timestamps are ISO 8601 UTC strings. All ids are strings.

## Error shape

~~~json
{ "error": { "code": "unauthorized", "message": "human readable" } }
~~~

Codes: ~~unauthorized~~, ~~invalid_input~~, ~~not_found~~, ~~email_taken~~, ~~rate_limited~~, ~~memory_unavailable~~, ~~internal~~.

**Important:** ~~memory_unavailable~~ is a first-class state, not a 500. If the relayer is unreachable, chat must still work without memory, and the UI must be able to show the user that memory is degraded. The bot degrades, it does not break.

## Endpoints

### POST /api/auth/register

- body: ~~{ email, password }~~
- 200: ~~{ user: { id, email, createdAt } }~~
- errors: ~~invalid_input~~, ~~email_taken~~

### POST /api/auth/login

- body: ~~{ email, password }~~
- 200: ~~{ user: { id, email, createdAt } }~~ and sets the session cookie
- errors: ~~unauthorized~~

### POST /api/auth/logout

- 200: ~~{ ok: true }~~ and clears the cookie

### GET /api/me

- 200: ~~{ user: { id, email, createdAt }, memoryCount }~~

### POST /api/chat

- body: ~~{ message, conversationId? }~~
- response: a streaming text response using the AI SDK data stream protocol
- response headers the UI can read:
  - ~~X-Conversation-Id~~ - pass back to continue the thread
  - ~~X-Recall-Count~~ - how many memories were recalled
  - ~~X-Memory-Status~~ - ~~ok~~ or ~~degraded~~
- errors: ~~unauthorized~~, ~~invalid_input~~
### GET /api/memory

Returns the current user memories, for the memory page.

- 200: ~~{ memories: [ { id, text, tag, source, active, createdAt } ], counts: { personal, shared, total } }~~
- ~~tag~~ is one of ~~profile~~, ~~pref~~, ~~event~~, ~~issue~~
- ~~source~~ is ~~chat~~ or ~~manual~~

### DELETE /api/memory/:id

- 200: ~~{ ok: true }~~
- Soft delete. Walrus Memory is append-only, so we write a local tombstone and filter it out of recall. The UI should describe this as "forget", and say the record is no longer used.

### GET /api/shared

Returns the group shared learnings.

- 200: ~~{ learnings: [ { id, text, createdAt, hitCount } ] }~~

### GET /api/admin/stats

Backs the evidence screenshot for the brief requirement of three users with ten memories each.

- 200: ~~{ users: [ { id, email, memoryCount, lastActiveAt } ], totalUsers, totalMemories }~~
- requires an admin session

## Notes for the frontend

- Never assume ~~POST /api/chat~~ succeeded with memory. Always render ~~X-Memory-Status~~. Degraded is a normal state, not an error to hide.
- The recall indicator in the UI comes from ~~X-Recall-Count~~. Show it quietly, for example "remembered 3 things".
- Streaming uses the AI SDK data stream protocol, so the client should use ~~useChat~~ from ~~@ai-sdk/react~~ rather than hand-parsing.
