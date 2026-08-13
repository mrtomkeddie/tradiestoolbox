# Tradies Toolbox — Agency Site

**The live site at [tradiestoolbox.co.uk](https://www.tradiestoolbox.co.uk) (Vercel project `traders-toolkit`).**

An AI receptionist for UK trades at **£149/mo with a professional website included free** — sold through a self-serve live demo where a visitor talks to their own receptionist in the browser before ever contacting us.

> Strategy note (13 Aug 2026): this site was websites-first with the receptionist "coming soon".
> That flipped — the receptionist is now the product (recurring revenue, strongest differentiator),
> and the website build is the free sweetener (near-zero marginal cost via the site pipeline).
> The old copy is preserved in `src/App.website-version.tsx.bak`.

## Stack

Vite + React 19 + custom design system (`design.css`) · React Router · Vercel (static build + serverless functions in `api/`). The `netlify/` folder is vestigial — **Vercel is the live host**.

```bash
npm install
npm run dev        # local dev on :3000 (API functions need `vercel dev` instead)
npm run lint       # tsc --noEmit
npm run build      # production build to dist/
npx vercel         # preview deploy
npx vercel --prod  # PRODUCTION deploy to tradiestoolbox.co.uk
```

## The live demo (the whole point of the site)

```
visitor form (name, trade, area, website?)          src/DemoWidget.tsx UI states:
        │                                           idle -> building -> live -> ended
        ▼
POST /api/demo-session                              api/demo-session.js
        │  1. honeypot + per-IP rate limit
        │  2. Firecrawl scrape of their site (14s cap, optional)
        │  3. build dispatch-grade prompt (trade triage packs:
        │     plumber/gas, electrician, roofer, generic — with UK
        │     safety scripts: 999, 0800 111 999 gas line, 105 power cuts)
        │  4. mint signed URL for the SHARED PRIVATE ElevenLabs agent
        ▼
@elevenlabs/client Conversation.startSession({ signedUrl, overrides })
        │  mic conversation in the page, personalised via per-session
        │  prompt/first-message overrides — no agent created per visitor
        ▼
"ended" state -> CTA into the #contact enquiry form -> Airtable
```

**The shared demo agent** (`TT_DEMO_AGENT_ID` = `agent_1001kzxfdd1re92se7vqrrw4p5q6`) was created by the AI Receptionist factory project (`C:\Users\tkedd\Documents\Projects\AI Receptionist`, see its README). Properties that matter:

- **Private** (auth enabled) — sessions exist only via signed URLs minted by our function; that's the abuse chokepoint.
- **Overrides enabled** for prompt + first message — one agent serves every visitor, personalised at session start.
- **Hard limits:** 4-minute call cap, 50 calls/day, gemini-2.5-flash + eleven_flash_v2 (proven Bethell-pilot settings).
- Soft limits in the function: 4 sessions/IP/hour (best-effort per instance), honeypot field.

## Environment variables (Vercel → Project settings → Environment Variables)

| Var | Used by | Status |
|---|---|---|
| `AIRTABLE_API_KEY` | `api/submit-enquiry.js` (enquiries → Airtable) | ✅ set |
| `TT_DEMO_AGENT_ID` | `api/demo-session.js` | ✅ set |
| `ELEVENLABS_API_KEY` | `api/demo-session.js` (mints signed URLs) | ⬜ **Tom to add** |
| `FIRECRAWL_API_KEY` | `api/demo-session.js` (scrapes visitor sites; demo degrades gracefully without it) | ⬜ **Tom to add** |

## File map

| Path | What it is |
|---|---|
| `src/App.tsx` | The receptionist-first page (live-design chassis: `Wordmark`, accent-cycling logo, editorial hero default, tweaks panel) |
| `src/DemoWidget.tsx` | The "Try it live" section — form → building → mic call → CTA |
| `src/App.website-version.tsx.bak` | The pre-flip websites-first page (what production ran before the pivot) |
| `src/App.receptionist-version.tsx.bak` | The original receptionist draft (superseded — predates the live design polish) |
| `src/design.css` | The whole design system (light/dark, 3 font pairings, 3 hero variants) + `.demo` styles at the bottom |
| `api/demo-session.js` | Demo backend (see diagram above) |
| `api/submit-enquiry.js` | Enquiry form → Airtable Enquiries table (`typecast: true`, so new select options are safe) |
| `_toolkit/` (sibling dir) | Client-site build tooling — not part of this site |

## Offer (agreed 13 Aug 2026)

- **One plan:** £149/mo — 24/7 answering, qualifying, booking, SMS summaries, review requests, monthly report, **website included free**.
- **Yearly:** £1,490 (2 months free).
- **Add-ons:** extra line £40/mo · custom voice £25/mo · outbound follow-ups £40/mo.
- No setup fee, no contract — deliberately async/self-serve (no sales calls, PECR-clean inbound).

## Status / next

- ✅ Receptionist-first rebuild on the live design chassis; pricing = £149 tier + "Your Website — Free" companion card
- ✅ Demo agent live, signed-URL flow verified, function + widget built, preview deployed
- ⬜ Tom: add the two env vars above, then redeploy (`npx vercel`) and test the demo on the preview URL
- ⬜ Promote to production (`npx vercel --prod`) once the demo call sounds right
- ⬜ Later: post-call webhook (transcript → email the lead their own call summary), demo→enquiry prefill, WhatsApp CTA
