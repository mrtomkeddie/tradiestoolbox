import React, { useEffect, useRef, useState } from 'react';
// Type-only: the SDK itself is loaded on demand in startLive(), so the ~half-megabyte
// of WebRTC client isn't in the initial page load for visitors who never demo.
import type { Conversation } from '@elevenlabs/client';

/* =========================================================
   DemoWidget — two demos, deliberately layered.

   1. SCRIPTED (default, zero friction): a canned transcript
      plays out in the browser. No mic, no sign-up, no cost,
      works on any device. This is what most visitors see.
   2. LIVE (escalation): the real thing — /api/demo-session
      scrapes their site, builds a personalised prompt and
      mints a signed URL for the shared private agent, then
      they talk to it through the mic.

   Gating the expensive path behind a click means tyre-kickers
   cost nothing and only warm visitors burn ElevenLabs minutes.

   The agent id + API keys never touch the client; the
   serverless function is the only thing that can mint a
   session, and it rate-limits per IP.
   ========================================================= */

type Phase = 'idle' | 'building' | 'live' | 'ended' | 'error';

const BUILD_STEPS = [
  'Reading your website…',
  'Learning your services…',
  'Training your receptionist…',
  'Connecting the line…',
];

const DEMO_TRADES = [
  'Plumber', 'Gas Engineer', 'Electrician', 'Builder', 'Roofer',
  'Decorator', 'Landscaper', 'Joiner / Carpenter', 'Tiler', 'Plasterer',
  'Handyman', 'Other',
];

/* The caller's opening line per trade, plus the job label used in the closing
   receipt. Keeps the scripted call believable whichever trade is picked. */
const TRADE_PROBLEMS: Record<string, { problem: string; job: string }> = {
  'Plumber': { problem: "Hiya — I've got a burst pipe under the kitchen sink, water's everywhere.", job: 'Burst pipe' },
  'Gas Engineer': { problem: "Hi — the boiler's cut out and we've got no heating or hot water.", job: 'Boiler breakdown' },
  'Electrician': { problem: 'Hi — half the sockets have stopped working and the fuse box keeps tripping.', job: 'Electrical fault' },
  'Builder': { problem: "Hello — we're after a quote for a single-storey extension on the back of the house.", job: 'Extension quote' },
  'Roofer': { problem: "Hi — a few tiles came off in the storm and there's a leak in the back bedroom.", job: 'Roof leak' },
  'Decorator': { problem: 'Hiya — I need the hall, stairs and landing repainted before the house goes up for sale.', job: 'Repaint' },
  'Landscaper': { problem: 'Hello — the back patio needs relaying and the garden tidying up for summer.', job: 'Patio & garden' },
  'Joiner / Carpenter': { problem: "Hi — we're after fitted wardrobes in the main bedroom, and a door rehung.", job: 'Fitted wardrobes' },
  'Tiler': { problem: 'Hello — the bathroom needs retiling, floor and walls, about 12 square metres.', job: 'Bathroom retile' },
  'Plasterer': { problem: 'Hi — the ceiling in the front room is cracked and needs skimming.', job: 'Ceiling skim' },
  'Handyman': { problem: "Hiya — got a few odd jobs: a door that won't shut and a fence panel down.", job: 'Odd jobs' },
  'Other': { problem: "Hello — I've got a job that needs looking at, are you taking work on at the moment?", job: 'New enquiry' },
};

type Bubble = { who: 'ai' | 'caller'; text: string };

export default function DemoWidget() {
  /* ---- shared form ---- */
  const [form, setForm] = useState({ businessName: '', trade: '', area: '', website: '' });

  /* ---- scripted demo ---- */
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [scriptStatus, setScriptStatus] = useState('Waiting to ring…');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [scriptRunning, setScriptRunning] = useState(false);
  /* Sticky once a call has played, so the button reads "Restart" after it ends. */
  const [scriptPlayed, setScriptPlayed] = useState(false);
  const [speak, setSpeak] = useState(true);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  /* ---- live demo ---- */
  const [showLive, setShowLive] = useState(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const [buildStep, setBuildStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'listening' | 'speaking'>('listening');
  const [seconds, setSeconds] = useState(0);
  const [scraped, setScraped] = useState(false);

  const convRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearScript = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  /* Never leave timers, speech or a session running if the component unmounts. */
  useEffect(() => () => {
    timeoutsRef.current.forEach(clearTimeout);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    convRef.current?.endSession().catch(() => {});
  }, []);

  /* Keep the transcript pinned to the newest line. */
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [bubbles, receipt]);

  /* Cycle the "building" copy while the scrape runs. */
  useEffect(() => {
    if (phase !== 'building') return;
    setBuildStep(0);
    const t = setInterval(() => setBuildStep(s => Math.min(s + 1, BUILD_STEPS.length - 1)), 3500);
    return () => clearInterval(t);
  }, [phase]);

  /* Live call timer. */
  useEffect(() => {
    if (phase === 'live') {
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const say = (text: string) => {
    if (!speak || !window.speechSynthesis) return;
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const gb = voices.find(v => v.lang === 'en-GB') || voices.find(v => v.lang?.startsWith('en'));
    if (gb) u.voice = gb;
    u.rate = 1.02;
    window.speechSynthesis.speak(u);
  };

  const runScript = (e: React.FormEvent) => {
    e.preventDefault();
    clearScript();

    const biz = form.businessName.trim() || 'your business';
    const area = form.area.trim() || 'your area';
    const t = TRADE_PROBLEMS[form.trade] || TRADE_PROBLEMS['Other'];

    setBubbles([]);
    setReceipt(null);
    setScriptRunning(true);
    setScriptPlayed(true);
    setScriptStatus('Ringing…');

    const push = (who: 'ai' | 'caller', text: string) => {
      setBubbles(b => [...b, { who, text }]);
      if (who === 'ai') say(text);
    };

    const steps: [number, () => void][] = [
      [1400, () => {
        setScriptStatus('Answered in 2 rings');
        push('ai', `Thanks for calling ${biz} — you're through to their 24/7 assistant. How can I help?`);
      }],
      [4200, () => push('caller', t.problem)],
      [7400, () => push('ai', `Sorry to hear that — whereabouts in ${area} are you?`)],
      [10200, () => push('caller', 'Just off the high street.')],
      [12200, () => push('ai', `No problem. ${biz} can be with you tomorrow at 8am — shall I book that in?`)],
      [16000, () => push('caller', "Yes please, 8am's fine.")],
      [18000, () => push('ai', `Done — you're booked for 8am. You'll get a text confirming, and I've sent the full details to ${biz}.`)],
      [22000, () => {
        setScriptStatus('Call ended · 0:47');
        setReceipt(`${t.job} booked · details texted to you`);
        setScriptRunning(false);
      }],
    ];
    timeoutsRef.current = steps.map(([ms, fn]) => setTimeout(fn, ms));
  };

  const startLive = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    clearScript();
    setPhase('building');

    try {
      // Ask for the mic up front — clearer than failing mid-connect.
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setPhase('idle');
      setError("We need microphone access for the live demo — it's how you talk to it. Nothing is recorded beyond the call itself.");
      return;
    }

    try {
      const res = await fetch('/api/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, company: '' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not start the demo — please try again.');
      setScraped(Boolean(data.scraped));

      const { Conversation: Conv } = await import('@elevenlabs/client');
      convRef.current = await Conv.startSession({
        signedUrl: data.signedUrl,
        overrides: data.overrides,
        onConnect: () => setPhase('live'),
        onDisconnect: () => setPhase(p => (p === 'live' ? 'ended' : p)),
        onModeChange: ({ mode: m }) => setMode(m === 'speaking' ? 'speaking' : 'listening'),
        onError: () => {
          setError('The line dropped — give it another go.');
          setPhase('error');
        },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not start the demo — please try again.');
      setPhase('error');
    }
  };

  const hangUp = async () => {
    try { await convRef.current?.endSession(); } catch { /* already closed */ }
    convRef.current = null;
    setPhase('ended');
  };

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  /* Once a live call is building/running/ended it takes over the whole panel. */
  const liveActive = showLive && phase !== 'idle' && phase !== 'error';

  return (
    <section id="demo" className="demo">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Hear it yourself · 00</div>
            <h2 className="section-title">Hear it answer for <span className="hi">your</span> business.</h2>
          </div>
          <p className="section-lede">
            Put your details in and watch it handle a late-night call — answered, qualified, booked and
            texted back to you. No sign-up, no card. Then talk to it yourself if you want the real thing.
          </p>
        </div>

        {liveActive ? (
          <div className="demo-panel">
            {phase === 'building' ? (
              <div className="demo-stage">
                <div className="demo-orb building"></div>
                <div className="demo-status">{BUILD_STEPS[form.website ? buildStep : Math.max(buildStep, 2)]}</div>
                <p className="demo-substatus">Usually under a minute. Worth it.</p>
              </div>
            ) : phase === 'live' ? (
              <div className="demo-stage">
                <div className={`demo-orb ${mode}`}></div>
                <div className="demo-status">
                  {mode === 'speaking' ? `${form.businessName || 'Your receptionist'} is speaking…` : 'Listening — go ahead'}
                </div>
                <p className="demo-substatus">
                  Try: “I’ve got water coming through the ceiling” · {mmss}
                </p>
                <button className="btn btn-dark" onClick={hangUp}>Hang up</button>
              </div>
            ) : (
              <div className="demo-stage">
                <div className="demo-orb"></div>
                <div className="demo-status">That receptionist took about a minute to build.</div>
                <p className="demo-substatus">
                  {scraped
                    ? 'It read your website and answered as your business. On a real line it texts you every job the second the call ends.'
                    : 'On a real line it texts you every job the second the call ends — and we train it properly on your business, not just a form.'}
                </p>
                <div className="demo-cta-row">
                  <a href="#contact" className="btn btn-primary">Put it on my number — live in 24h <span className="btn-arrow"></span></a>
                  <button className="btn btn-ghost" onClick={() => { setPhase('idle'); setShowLive(false); }}>Back to the demo</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="demo-grid">
              <form className="demo-form" onSubmit={showLive ? startLive : runScript}>
                <div className="field">
                  <label>Business name</label>
                  <input
                    type="text" required placeholder="e.g. Apex Plumbing"
                    value={form.businessName}
                    onChange={e => setForm({ ...form, businessName: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Trade</label>
                  <select required value={form.trade} onChange={e => setForm({ ...form, trade: e.target.value })}>
                    <option value="" disabled>Select your trade…</option>
                    {DEMO_TRADES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Area you cover</label>
                  <input
                    type="text" placeholder="e.g. Cardiff &amp; the Vale"
                    value={form.area}
                    onChange={e => setForm({ ...form, area: e.target.value })}
                  />
                </div>

                {showLive && (
                  <div className="field">
                    <label>Your website <span className="field-opt">(optional — makes it uncannily good)</span></label>
                    <input
                      type="url" placeholder="https://www.yoursite.co.uk"
                      value={form.website}
                      onChange={e => setForm({ ...form, website: e.target.value })}
                    />
                  </div>
                )}

                {!showLive && (
                  <label className="demo-voice">
                    <input type="checkbox" checked={speak} onChange={e => setSpeak(e.target.checked)} />
                    Read the receptionist's lines aloud
                  </label>
                )}

                <button type="submit" className="btn btn-primary btn-full">
                  {showLive
                    ? <>Build my receptionist &amp; talk to it <span className="btn-arrow"></span></>
                    : <>{scriptPlayed ? 'Restart the demo call' : 'Start the demo call'} <span className="btn-arrow"></span></>}
                </button>

                {error && <p className="demo-error">{error}</p>}
                <p className="form-foot">
                  {showLive
                    ? 'Uses your microphone, right here in the browser. Calls cap at 3 minutes.'
                    : 'A scripted example — no microphone needed, nothing saved.'}
                </p>
              </form>

              <div className="rc-card demo-call">
                <div className="cm-head">
                  <span className="cm-dot"></span>
                  <span>{scriptStatus}</span>
                  <span className="cm-dur">2:14am</span>
                </div>
                <div className="cm-body" ref={bodyRef}>
                  {bubbles.length === 0 && !receipt ? (
                    <div className="demo-idle">
                      Fill in your details and press start.<br />
                      Your phone rings at 2:14am — but you're asleep…
                    </div>
                  ) : (
                    <>
                      {bubbles.map((b, i) => (
                        <div key={i} className={`cm-bubble ${b.who}`}>
                          <span className="cm-who">{b.who === 'ai' ? 'AI · your receptionist' : 'Caller'}</span>
                          {b.text}
                        </div>
                      ))}
                      {receipt && (
                        <div className="cm-status"><span className="cm-tick">✓</span> {receipt}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {!showLive ? (
              <div className="demo-escalate">
                <p className="demo-escalate-lede">
                  That's the script. Want the real thing? Talk to a receptionist built from your own
                  website — out loud, through your mic, right now.
                </p>
                <button
                  className="btn btn-dark"
                  onClick={() => { clearScript(); setScriptRunning(false); setError(null); setShowLive(true); }}
                >
                  Now talk to it yourself <span className="btn-arrow"></span>
                </button>
              </div>
            ) : (
              <div className="demo-escalate">
                <button className="btn btn-ghost" onClick={() => { setError(null); setShowLive(false); }}>
                  ← Back to the scripted demo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
