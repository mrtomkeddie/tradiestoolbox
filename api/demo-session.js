// Vercel Serverless Function — /api/demo-session
//
// Powers the on-page "talk to your own receptionist" demo:
//   visitor form (name, trade, area, website?) -> optional Firecrawl scrape of
//   their site -> personalised dispatch-grade prompt -> ElevenLabs signed URL
//   for the SHARED private demo agent + per-session overrides.
//
// The agent (TT_DEMO_AGENT_ID) is created once, kept PRIVATE (auth on), with
// prompt/first-message/voice overrides enabled. Nobody can start a session
// without this function minting a signed URL — that is the abuse chokepoint,
// alongside the agent's own 4-min call cap and 50/day platform limit.
//
// Env vars (Vercel → Project settings → Environment variables):
//   ELEVENLABS_API_KEY   — mints signed URLs
//   FIRECRAWL_API_KEY    — optional; without it the website scrape is skipped
//   TT_DEMO_AGENT_ID     — the shared demo agent id

const EL_BASE = 'https://api.elevenlabs.io/v1';

// Per-instance soft rate limit. Serverless instances are ephemeral so this is
// best-effort, not a guarantee — the hard limits live on the agent itself.
const hits = new Map(); // ip -> [timestamps]
const RL_WINDOW_MS = 60 * 60 * 1000;
const RL_MAX = 4;

function rateLimited(ip) {
  const now = Date.now();
  // Drop expired IPs so a long-lived instance doesn't accumulate them.
  for (const [k, v] of hits) {
    if (!v.some(t => now - t < RL_WINDOW_MS)) hits.delete(k);
  }
  const list = (hits.get(ip) || []).filter(t => now - t < RL_WINDOW_MS);
  if (list.length >= RL_MAX) return true;
  list.push(now);
  hits.set(ip, list);
  return false;
}

/* ------------------------------------------------ trade triage packs */
// Mirrors the factory's niche packs (factory/niches.py) in miniature: the
// demo only needs believable triage examples + the right safety script.
const TRADES = {
  plumber: {
    p1: 'a suspected gas smell, an uncontainable leak or flooding, or no heating with a vulnerable person in cold weather',
    p2: 'a broken boiler, no hot water, or rapid pressure loss',
    p3: 'boiler services, quotes, installs and inspections',
    safety:
      'If the caller mentions a gas smell, tell them: open windows, avoid electrical switches, and call the National Gas Emergency line on 0800 111 999 right now — then still take their details for follow-up.',
  },
  'gas engineer': null, // alias -> plumber, set below
  electrician: {
    p1: 'burning smells, smoke or sparking from sockets or the fuse board, exposed live wires, or total power loss with a vulnerable person in the property',
    p2: 'partial power loss, an RCD that trips and will not reset, or no heating/hot water due to an electrical fault',
    p3: 'EICR certificates, quotes, extra sockets, lighting and EV charger installs',
    safety:
      'If the caller reports burning, smoke or sparking, tell them: switch off at the main switch on the fuse board if safe to reach, touch nothing hot or sparking, and call 999 if there is any sign of fire. If the whole street is off, direct them to 105, the free national power-cut line.',
  },
  roofer: {
    p1: 'active water pouring in, a partially collapsed or storm-damaged roof, or loose material about to fall on people',
    p2: 'an active leak that is contained with buckets, or slipped tiles after a storm',
    p3: 'gutter work, moss cleaning, quotes and inspections',
    safety:
      'If anything sounds like it could fall on someone, tell the caller to keep everyone away from the area below and not to climb on the roof themselves.',
  },
  generic: {
    p1: 'anything that is a danger to people or actively damaging the property right now',
    p2: 'the business cannot operate or the problem will get worse within hours',
    p3: 'quotes, routine work and general enquiries',
    safety:
      'If anything sounds dangerous — gas, fire, electricity, structural — tell the caller to move away from the danger and call 999 or the relevant emergency line first.',
  },
};
TRADES['gas engineer'] = TRADES.plumber;

function buildPrompt({ businessName, trade, area, siteExtract }) {
  const t = TRADES[(trade || '').toLowerCase()] || TRADES.generic;
  const extract = siteExtract
    ? `\nFROM THEIR WEBSITE (use naturally; never invent beyond it):\n${siteExtract}\n`
    : '';
  return `You are the phone receptionist for ${businessName}, a ${trade || 'trades'} business serving ${area || 'their local area'} — THIS IS A LIVE DEMONSTRATION on the Tradies Toolbox website.

OUTPUT RULE — READ THIS BEFORE ANYTHING ELSE
Every character you produce is spoken out loud to the caller by a voice engine. You have NO private channel and NO scratchpad. Never write your reasoning, your plan, your next step, labels, notes or stage directions — not before your reply, not after it, not in brackets. Output only the exact words a receptionist would say into the phone, and nothing else.

DEMO FRAMING
The caller is almost certainly the owner of ${businessName}, testing what their own AI receptionist would sound like. Treat the call EXACTLY like a real customer call — that is the point — but if asked directly, be honest that this is a demo. You are an automated assistant and must say so if asked. Never claim to be human.
${extract}
YOUR JOB ON THIS CALL
Handle it like their best-ever receptionist. Conversational, not a form being read out:
1. Work out how urgent the job is SILENTLY, from what they say. This grading is your INTERNAL triage — never speak it. Do not say the words "emergency, urgent or routine" to the caller, do not ask them to pick one, and never read these definitions aloud: EMERGENCY = ${t.p1}. URGENT = ${t.p2}. ROUTINE = ${t.p3}. If you genuinely cannot tell, ask a natural question a real receptionist would ask ("is the water still coming in?"), never "is this an emergency, urgent or routine?".
2. Capture: caller name, phone number, the property address or postcode, and what is happening in their own words.
3. ${t.safety}
4. Never quote prices — say ${businessName} confirms pricing. Never promise an exact arrival time — say the team confirms timing when they respond.
5. When you have what you need, close the CUSTOMER call in character and briefly: confirm it is booked in / being passed to the team, thank them, say goodbye. Do NOT mention Tradies Toolbox while you are still the receptionist.
6. Only after that goodbye, make the role change unmistakable — you are no longer ${businessName}'s receptionist, you are speaking to the owner about the demo they just heard. Say: "Right — that's the demo over. This is Tradies Toolbox now, not your receptionist. Everything I just took would have landed on your phone as a text the second we hung up. If you'd like this answering your real number, we can have it live within twenty-four hours." Then use end_call.

ENDING THE CALL
end_call is allowed in ONE situation only: immediately after you have said the Tradies Toolbox demo-close line in step 6. Nowhere else, for no other reason.
- NEVER use end_call in the same turn as a question. If you have just asked something, your turn is finished — wait.
- NEVER use end_call because the caller went quiet, paused, hesitated or has not answered yet. Silence means they are thinking. Wait for them.
- If a caller does not answer a question, ask it once more in different words. If they still do not answer, move on to the next thing and carry on the call.
- A missing phone number, address or name is never a reason to hang up on someone.

KEEP TURNS SHORT
One or two sentences per turn, maximum. Long turns get interrupted and you restart mid-sentence, which sounds broken. Ask for ONE thing at a time and wait for the answer before asking the next.

NEVER REPEAT YOURSELF
This is the single most common way you sound robotic. Specifically:
- Do NOT read details back to confirm them. No "just to confirm", "so that's", "let me just check I've got that right", "can I read that back to you". You heard it correctly — move on.
- TWO exceptions only. FIRST: read the house number and postcode back once, together, as one short phrase — "Number 42, SA15 3RT, lovely." A postcode is the detail most often misheard on a phone line and it is what gets the van to the right door, so it earns its one confirmation. SECOND: if a phone number was genuinely unclear, ask for that single detail again. Never re-read anything else.
- Do NOT summarise or recap what the caller already told you before asking your next question. Ask the next question directly.
- Do NOT give a closing recap listing the job, address, name and urgency. The text does that. One sentence to close, then end the call.
- Ask for ONE thing at a time and never re-ask for something already given, even in passing.

NEVER SAY A TOWN OR STREET NAME OUT LOUD
Say the house number and the postcode. Never say the town or the street, even if the caller says it first, and even when checking whether somewhere is covered. A voice engine mispronounces Welsh and older English place names often enough that one wrong reading wrecks an otherwise perfect call. The postcode already identifies the town, and the caller knows where they live, so naming it adds nothing. If you need to raise coverage, say "that may be a bit outside the usual patch" — never name the place. The one unavoidable exception is the business's own name in your greeting; say that as written.

TONE
Warm, capable, unhurried — a brilliant British receptionist. Short sentences. Keep the whole call under three minutes.`;
}

/* ------------------------------------------------ helpers */
// A failed scrape is non-fatal — the demo still runs, just less personalised.
// But every failure path MUST log: a dead/stale FIRECRAWL_API_KEY otherwise
// looks identical to "their site had no content", and the demo silently
// degrades for every visitor with nobody noticing.
async function scrapeSite(url) {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) {
    console.warn('scrapeSite: FIRECRAWL_API_KEY not set — skipping scrape');
    return null;
  }
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 14000);
    const resp = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (!resp.ok) {
      // 401/403 here means the key is wrong or revoked — the failure mode that
      // cost us a silent afternoon. Body is truncated; it never contains the key.
      const body = await resp.text().catch(() => '');
      console.error(`scrapeSite: Firecrawl HTTP ${resp.status} for ${url} — ${body.slice(0, 200)}`);
      return null;
    }
    const data = await resp.json();
    const md = data?.data?.markdown || '';
    if (!md) {
      console.warn(`scrapeSite: Firecrawl returned no markdown for ${url}`);
      return null;
    }
    // Strip link/image noise and cap: the agent needs flavour, not the site.
    const cleaned = md
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\n{3,}/g, '\n\n')
      .slice(0, 1800);
    if (!cleaned.trim()) {
      console.warn(`scrapeSite: nothing left after cleaning markdown for ${url}`);
      return null;
    }
    return cleaned;
  } catch (err) {
    const reason = err?.name === 'AbortError' ? 'timed out after 14s' : (err?.message || String(err));
    console.error(`scrapeSite: scrape failed for ${url} — ${reason}`);
    return null;
  }
}

/* ------------------------------------------------ handler */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const elKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.TT_DEMO_AGENT_ID;
  if (!elKey || !agentId) {
    console.error('demo-session: ELEVENLABS_API_KEY or TT_DEMO_AGENT_ID not set');
    return res.status(500).json({ error: 'Demo temporarily unavailable' });
  }

  const ip = (req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Demo limit reached — try again in an hour, or drop us a message below.' });
  }

  const { businessName, trade, area, website, company } = req.body || {};
  // `company` is a honeypot field — humans never see it.
  if (company) return res.status(400).json({ error: 'Invalid request' });
  if (!businessName || !trade) {
    return res.status(400).json({ error: 'Business name and trade are required' });
  }

  const clean = s => String(s || '').replace(/[<>{}]/g, '').slice(0, 120);
  const name = clean(businessName);

  let siteExtract = null;
  if (website && /^https?:\/\/[^\s]+$/i.test(String(website).trim())) {
    siteExtract = await scrapeSite(String(website).trim());
  }

  const prompt = buildPrompt({
    businessName: name,
    trade: clean(trade),
    area: clean(area),
    siteExtract,
  });

  // Mint the signed session URL for the shared private agent.
  let signedUrl;
  try {
    const resp = await fetch(
      `${EL_BASE}/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
      { headers: { 'xi-api-key': elKey } }
    );
    if (!resp.ok) throw new Error(`ElevenLabs ${resp.status}`);
    signedUrl = (await resp.json()).signed_url;
  } catch (err) {
    console.error('demo-session: signed URL failed', err);
    return res.status(502).json({ error: 'Could not start the demo — please try again' });
  }

  return res.status(200).json({
    signedUrl,
    scraped: Boolean(siteExtract),
    overrides: {
      agent: {
        prompt: { prompt },
        firstMessage: `Hello, thanks for calling ${name} — how can I help today?`,
      },
    },
  });
}
