# Mood Moment Analysis API

Backend for a bilingual (EN/DE) AI companion that talks with people in the emotional register they are actually in. Conversations are not a single generic chat: each session is either open dialogue or a mood-scale session whose tone, pacing, and first reply are locked to a scored affective state. Facts the user reveals are extracted asynchronously into a structured long-term memory and injected back into later prompts.

Built as a production Express service: JWT auth, OTP email flows, admin-gated mood taxonomy, Cloudinary media, and a GitHub Actions deploy to Railway.

## What the model actually sees

Every turn is assembled, not forwarded raw.

1. **Identity block** — name, age derived from date of birth, gender, and a companion persona (name + gender) the user chose.
2. **Memory block** — a per-user document split into `basicInfo`, `lifeEvents`, `preferences`, and `emotionalPatterns`. Free chat additionally carries an extracted job line.
3. **Mood block** (mood-scale sessions only) — the scale entry’s label, the user’s own opening line, the target feeling, the interaction style, and a character-exact first-reply constraint. After that first turn the model continues in the same register without repeating the lock.
4. **Windowed history** — the last N messages of the current chat (`CHAT_HISTORY_LIMIT`, default 20).

The companion is instructed to use memory naturally and to refuse to narrate its own system prompt if asked.

## Memory pipeline

Extraction is decoupled from the reply path so a slow structured-output call never sits on the user’s latency.

- Each chat tracks `unprocessedMessageCount`.
- When the user opens the next session, any leftover batch from the previous chat is flushed in the background.
- Companion chats run a merge extractor: the model receives the existing memory JSON plus the new transcript and must return only the four buckets, using snake_case keys and one-sentence values. Contradictions overwrite; small talk is dropped.
- Free chats run a narrower extractor that writes a job only when the user clearly disclosed their own work.
- Failures are logged and swallowed. A bad extraction cannot take down the conversation.
- Free chats are retained to a rolling window (`FREE_CHAT_RETENTION_LIMIT`, default 3); older threads and their messages are pruned.

Mood context is snapshotted onto the chat at start (`ChatMood`). Later edits to the scale catalog do not rewrite sessions already in flight.

## Mood scale

A 1–10 catalog (`data/mood-scale.json`) stores, per locale, a label, the line the user is treated as having said, the emotional tone, the interaction style, and the required opening reply. Examples run from withdrawal (*Sad* — short sentences, no pressure) through activation (*Excited*). Admins seed and edit the catalog; clients read a localized projection with no `En`/`De` suffixes. Request language comes from middleware (`Accept-Language`, default `en`).

## API

All routes below except auth and the health probe require `Authorization: Bearer <jwt>`.

| Area | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/request-otp`, `/verify-otp`, `/register`, `/login`, `/forgot-password`, `/verify-reset-otp`, `/reset-password`, `PATCH /change-password` |
| Profile | `GET/PATCH /api/users/profile`, image upload, language, `DELETE /api/users/account` |
| Companion | `GET/POST/PUT/DELETE /api/companion` |
| Moods | `GET /api/moods`, `GET /api/moods/mood-scale`, `POST /api/user-mood`. Admin: CRUD, full scale, seed |
| Free chat | `GET /api/freeChat`, `POST /api/freeChat/messages`, messages, get, delete |
| Mood chat | `POST /api/moodscalechat/start`, `POST /api/moodscalechat/messages` |

OTP verification issues a short-lived temp token; registration and password reset consume it. Access tokens carry `userId`, `email`, and `role`. Admin routes sit behind a second gate.

## Stack

Node.js, Express, MongoDB (Mongoose), OpenRouter (default model `x-ai/grok-4.20`), JWT, bcrypt, SendGrid and Gmail OAuth2 for mail, Cloudinary + Multer for images, Railway via `.github/workflows/deploy.yml` on `dev`.

## Run

```bash
cp env.example .env   # fill Mongo, JWT, OpenRouter, mail, Cloudinary
npm install
npm run dev           # http://localhost:3000
```

Seed the scale once as an admin: `POST /api/moods/seed/mood-scale`.

| Variable | Role |
| --- | --- |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` | Generation and extraction |
| `MEMORY_EXTRACTION_THRESHOLD` | Batch size before a memory write (default 10) |
| `CHAT_HISTORY_LIMIT` | Turns replayed into the prompt |
| `JWT_EXPIRES_IN`, `OTP_EXPIRES_MINUTES` | Session and OTP lifetime |
| `DEFAULT_LANGUAGE` | Fallback locale |

## Design notes

- **Two extractors, one memory document.** Open conversation needs a broad fact store; free chat only needs occupation. Splitting the prompts keeps the small-talk path from polluting life-event memory.
- **First-reply lock.** Mood sessions open on a known, localized line so the client can render a stable beat before free generation takes over.
- **Prompt leakage guard.** If the user asks about instructions, the mood block tells the model to answer as a companion and stay off system details.
- **Locale at the edge.** Controllers never branch on language ad hoc; middleware resolves it, and scale rows are projected once per request.
