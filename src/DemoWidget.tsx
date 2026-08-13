import React, { useEffect, useRef, useState } from 'react';
// Type-only: the SDK itself is loaded on demand in start(), so the ~half-megabyte
// of WebRTC client isn't in the initial page load for visitors who never demo.
import type { Conversation } from '@elevenlabs/client';

/* =========================================================
   DemoWidget — "talk to your own receptionist" section.

   Flow: form -> /api/demo-session (scrape + personalised
   prompt + signed URL for the shared private agent) ->
   ElevenLabs WebRTC session in the browser via mic.

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

export default function DemoWidget() {
  const [form, setForm] = useState({ businessName: '', trade: '', area: '', website: '' });
  const [phase, setPhase] = useState<Phase>('idle');
  const [buildStep, setBuildStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'listening' | 'speaking'>('listening');
  const [seconds, setSeconds] = useState(0);
  const [scraped, setScraped] = useState(false);

  const convRef = useRef<Awaited<ReturnType<typeof Conversation.startSession>> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* Cycle the "building" copy while the scrape runs. */
  useEffect(() => {
    if (phase !== 'building') return;
    setBuildStep(0);
    const t = setInterval(() => setBuildStep(s => Math.min(s + 1, BUILD_STEPS.length - 1)), 3500);
    return () => clearInterval(t);
  }, [phase]);

  /* Call timer. */
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

  /* Never leave a session running if the component unmounts. */
  useEffect(() => () => { convRef.current?.endSession().catch(() => {}); }, []);

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPhase('building');

    try {
      // Ask for the mic up front — clearer than failing mid-connect.
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setPhase('idle');
      setError("We need microphone access for the demo — it's how you talk to it. Nothing is recorded beyond the call itself.");
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

  return (
    <section id="demo" className="demo">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Try it live · 00</div>
            <h2 className="section-title">Hear it answer for <span className="hi">your</span> business.</h2>
          </div>
          <p className="section-lede">
            Type your business name, pick your trade, and talk to your own receptionist right here —
            built from your details in about a minute. No sign-up, no card, no sales call after.
          </p>
        </div>

        <div className="demo-panel">
          {phase === 'idle' || phase === 'error' ? (
            <form className="demo-form" onSubmit={start}>
              <div className="field-row">
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
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Area you cover</label>
                  <input
                    type="text" placeholder="e.g. Cardiff &amp; the Vale"
                    value={form.area}
                    onChange={e => setForm({ ...form, area: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Your website <span className="field-opt">(optional — makes it uncannily good)</span></label>
                  <input
                    type="url" placeholder="https://www.yoursite.co.uk"
                    value={form.website}
                    onChange={e => setForm({ ...form, website: e.target.value })}
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-full">
                Build my receptionist &amp; talk to it <span className="btn-arrow"></span>
              </button>
              {error && <p className="demo-error">{error}</p>}
              <p className="form-foot">Uses your microphone, right here in the browser. Calls cap at 3 minutes.</p>
            </form>
          ) : phase === 'building' ? (
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
                <button className="btn btn-ghost" onClick={() => setPhase('idle')}>Try another call</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
