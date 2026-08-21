import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import DemoWidget from './DemoWidget';
import './design.css';
import Wordmark from './Wordmark';

/* =========================================================
   Trade picker colours (hero variant B)
   ========================================================= */
const tradeColors: Record<string, string> = {
  plumbers: '#2BA6E8',
  electricians: '#FFD400',
  builders: '#FF7A1A',
  roofers: '#8B5CF6',
  decorators: '#E84D8A',
  landscapers: '#4CAF50',
};

/* Accent palette for the nav colour-cycler (starts on the brand orange) */
const ACCENTS = ['#FF7A1A', '#2BA6E8', '#4CAF50', '#8B5CF6', '#E84D8A', '#FFD400'];

/* =========================================================
   App
   ========================================================= */
export default function App() {
  /* ---- form state ---- */
  const [formData, setFormData] = useState({
    businessName: '',
    trade: '',
    location: '',
    currentSite: '',
    package: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /* ---- tweaks panel state ---- */
  const [heroVariant, setHeroVariant] = useState<'editorial' | 'blocks' | 'ticker'>('editorial');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [fonts, setFonts] = useState<'display-sans' | 'condensed-serif' | 'mono-grotesk'>('display-sans');
  const [tweaksOpen, setTweaksOpen] = useState(false);

  /* ---- process step ---- */
  const [activeStep, setActiveStep] = useState(0);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---- faq open item ---- */
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  /* ---- pricing billing period ----
     Only the phone layout reads this: two full tier cards stacked is a very
     long scroll on a handset, so a phone shows one plan at a time. Desktop
     renders both regardless. Defaults to yearly — it's the featured side. */
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');

  /* ---- accent colour cycler (logo easter egg) ---- */
  const accentRef = useRef(0);
  const cycleAccent = () => {
    const next = (accentRef.current + 1) % ACCENTS.length;
    accentRef.current = next;
    document.documentElement.style.setProperty('--hi', ACCENTS[next]);
  };

  /* ---- Apply theme/fonts to body ---- */
  useEffect(() => {
    document.body.dataset.theme = theme;
    document.body.dataset.fonts = fonts;
  }, [theme, fonts]);

  /* ---- Process auto-advance ---- */
  useEffect(() => {
    stepTimerRef.current = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 3);
    }, 4000);
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  /* ---- Tweaks panel: listen for editmode messages ---- */
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
      if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
    };
    window.addEventListener('message', handler);
    try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (_) {}
    return () => window.removeEventListener('message', handler);
  }, []);

  /* ---- Scroll spy ---- */
  useEffect(() => {
    const sectionIds = ['demo', 'services', 'process', 'pricing', 'faq'];
    const sections = sectionIds.map(id => document.getElementById(id));
    const navLinks = document.querySelectorAll<HTMLAnchorElement>('.nav-links a[data-link]');

    function spy() {
      let activeId: string | null = null;
      const y = window.scrollY + 100;
      sections.forEach(s => { if (s && s.offsetTop <= y) activeId = s.id; });
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + activeId);
      });
    }
    window.addEventListener('scroll', spy, { passive: true });
    spy();
    return () => window.removeEventListener('scroll', spy);
  }, []);

  /* ---- Process fill line width ---- */
  const processFillWidth = `${((activeStep + 1) / 3) * 100}%`;

  /* ---- handleSubmit ---- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/submit-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---- setKey helper (tweaks) ---- */
  function setKey(key: string, val: string) {
    if (key === 'hero') setHeroVariant(val as typeof heroVariant);
    if (key === 'theme') setTheme(val as typeof theme);
    if (key === 'fonts') setFonts(val as typeof fonts);
    try { window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: val } }, '*'); } catch (_) {}
  }

  return (
    <>
      {/* ============ TAPE ============ */}
      <div className="tape">
        <div className="tape-track">
          <span>UK trades · never miss another call · answered 24/7 · books jobs while you work · free website on yearly · no contracts · live in 24 hours</span>
          <span>UK trades · never miss another call · answered 24/7 · books jobs while you work · free website on yearly · no contracts · live in 24 hours</span>
        </div>
      </div>

      {/* ============ NAV ============ */}
      <nav className="nav">
        <div className="container nav-inner">
          <a href="#top" className="brand">
            <svg className="brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" onClick={(e) => { e.preventDefault(); cycleAccent(); }} style={{ cursor: 'pointer' }}><title>Psst… click me</title><path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" /><path d="M14.5 5.5l4 4" /><path d="M12 8l-5 -5l-4 4l5 5" /><path d="M7 8l-1.5 1.5" /><path d="M16 12l5 5l-4 4l-5 -5" /><path d="M16 17l-1.5 1.5" /></svg>
            <Wordmark />
          </a>
          <div className="nav-links">
            <a href="#demo" data-link="">Try it live</a>
            <a href="#services" data-link="">What it does</a>
            <a href="#process" data-link="">How it works</a>
            <a href="#pricing" data-link="">Pricing</a>
            <a href="#faq" data-link="">FAQ</a>
          </div>
          <button className="theme-toggle" onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} aria-label="Toggle dark mode">{theme === 'light' ? (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>) : (<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>)}</button>
          <a href="#contact" className="btn btn-primary btn-sm nav-cta">Get set up <span className="btn-arrow"></span></a>
        </div>
      </nav>

      <main id="top">

        {/* ============ HERO ============ */}
        <section className="hero" data-variant={heroVariant}>
          <div className="hero-grid-bg"></div>
          <div className="container">

            {/* Only the active variant is rendered — three heroes in the DOM
                meant three <h1>s and duplicate copy for crawlers. */}

            {/* Variant A: Editorial split */}
            {heroVariant === 'editorial' && (
            <>
            <div className="hero-editorial">
              <div className="hero-copy">
                <div className="hero-eyebrow-row">
                  <span className="dot"></span>
                  <span>Now answering calls · 2026</span>
                </div>
                <h1 className="hero-title">
                  Never miss<br />
                  <span className="hi">another</span><br />
                  <span className="stroke">call.</span>
                </h1>
                <p className="hero-sub">
                  An AI receptionist for the trades. It answers every call 24/7, qualifies the job, books it into your diary<span className="sub-clip">, and texts you the details — while you're on the tools, up a ladder, or fast asleep</span>.<span className="sub-tail"> Professional website free on the yearly plan.</span>
                </p>
                <div className="hero-cta">
                  <a href="#demo" className="btn btn-primary">Try it on your business <span className="btn-arrow"></span></a>
                  <a href="#pricing" className="btn btn-ghost">See pricing</a>
                </div>
                <div className="hero-meta">
                  <div><span className="num">24/7</span><span className="lbl">Always on</span></div>
                  <div><span className="num">No</span><span className="lbl">Contracts</span></div>
                </div>
              </div>
              {/* The demo IS the hero's right-hand column. One instance,
                  mounted once: it must never unmount on a resize, or a live
                  call would be cut off mid-sentence. The night report it
                  replaced is now .hero-strip below (desktop) and .proof
                  (phones). */}
              <div className="mockup-wrap">
                <DemoWidget />
              </div>
            </div>

            {/* Overnight numbers, full width along the bottom of the first
                screen — the proof the hero used to carry in a card. */}
            <div className="hero-strip">
              <div><span className="hs-num">6/6</span><span className="hs-lbl">Overnight calls answered</span></div>
              <div><span className="hs-num">3</span><span className="hs-lbl">Jobs booked in</span></div>
              <div><span className="hs-num">0</span><span className="hs-lbl">Voicemails left</span></div>
              <div><span className="hs-num">£149</span><span className="hs-lbl">A month, no contract</span></div>
            </div>
            </>
            )}

            {/* Variant B: Blocks / trade picker */}
            {heroVariant === 'blocks' && (
            <div className="hero-blocks">
              <div className="hero-eyebrow-row">
                <span className="dot"></span>
                <span>Pick your trade · It's trained on yours</span>
              </div>
              <div className="hero-blocks-top">
                <h1 className="hero-title">
                  Every <span className="hi">missed call</span><br />
                  is a job<br />
                  <span className="stroke">gone elsewhere.</span>
                </h1>
                <p className="hero-sub">
                  An AI receptionist trained on your trade. It knows the jobs you do, the questions to ask, and exactly how to get a caller booked in.
                </p>
              </div>

              <div className="trade-picker">
                {Object.entries({
                  plumbers: { label: 'Plumbers', n: '01 / 06', svg: <svg viewBox="0 0 24 24"><path d="M5 4v6a4 4 0 0 0 4 4h2v6M13 4h6v6M19 10l-6 6" /></svg> },
                  electricians: { label: 'Electricians', n: '02 / 06', svg: <svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-2 8 9-12h-7z" /></svg> },
                  builders: { label: 'Builders', n: '03 / 06', svg: <svg viewBox="0 0 24 24"><path d="M3 21V9l9-6 9 6v12M9 21v-8h6v8" /></svg> },
                  roofers: { label: 'Roofers', n: '04 / 06', svg: <svg viewBox="0 0 24 24"><path d="M2 12 12 4l10 8M5 10v10h14V10" /></svg> },
                  decorators: { label: 'Decorators', n: '05 / 06', svg: <svg viewBox="0 0 24 24"><path d="M3 8h14v4H3zM7 12v8h6v-8M17 10V6a2 2 0 0 1 2-2h2" /></svg> },
                  landscapers: { label: 'Landscapers', n: '06 / 06', svg: <svg viewBox="0 0 24 24"><path d="M12 22V8M5 12c0-4 3-7 7-7s7 3 7 7-3 7-7 7M3 22h18" /></svg> },
                }).map(([key, val]) => (
                  <button
                    key={key}
                    className="trade-pill"
                    onClick={() => {
                      document.querySelectorAll('.trade-picker .trade-pill').forEach(x => x.classList.remove('active'));
                      (document.querySelector(`.trade-pill[data-trade="${key}"]`) as HTMLElement)?.classList.add('active');
                      const c = tradeColors[key];
                      if (c) document.documentElement.style.setProperty('--hi', c);
                    }}
                    data-trade={key}
                  >
                    <span className="pill-ico">{val.svg}</span>
                    <span>{val.label}</span>
                    <span className="num">{val.n}</span>
                  </button>
                ))}
              </div>

              <div className="hero-blocks-cta">
                <div className="hero-cta">
                  <a href="#demo" className="btn btn-primary">Try it on your business <span className="btn-arrow"></span></a>
                  <a href="#pricing" className="btn btn-ghost">See pricing</a>
                </div>
                <div className="hero-meta">
                  <div><span className="num">24/7</span><span className="lbl">Always on</span></div>
                </div>
              </div>
            </div>

            )}

            {/* Variant C: Ticker */}
            {heroVariant === 'ticker' && (
            <div className="hero-ticker">
              <div className="ticker-intro">
                <h1>An AI receptionist that answers, qualifies and books — 24/7.</h1>
                <p>
                  Built for plumbers, electricians, roofers, builders and every UK trade that can't answer the phone from up a ladder.
                </p>
              </div>
              <div className="ticker-row">
                <span>PLUMBERS</span>
                <span className="ticker-divider">◆</span>
                <span className="stroke">SPARKS</span>
                <span className="ticker-divider">◆</span>
                <span className="hi">BUILDERS</span>
                <span className="ticker-divider">◆</span>
                <span>ROOFERS</span>
              </div>
              <div className="ticker-row reverse">
                <span className="stroke">DECORATORS</span>
                <span className="ticker-divider">◆</span>
                <span className="hi">GAS ENGINEERS</span>
                <span className="ticker-divider">◆</span>
                <span>JOINERS</span>
                <span className="ticker-divider">◆</span>
                <span className="stroke">LANDSCAPERS</span>
              </div>
              <div className="ticker-row">
                <span className="hi">TILERS</span>
                <span className="ticker-divider">◆</span>
                <span>PLASTERERS</span>
                <span className="ticker-divider">◆</span>
                <span className="stroke">HANDYMEN</span>
                <span className="ticker-divider">◆</span>
                <span className="hi">PAVERS</span>
              </div>
              <div className="ticker-bottom">
                <p className="hero-sub">
                  £149/mo, no contract, free website on yearly. Every missed call goes to the next guy — yours get answered and booked.
                </p>
                <div className="hero-cta">
                  <a href="#demo" className="btn btn-primary">Try it on your business <span className="btn-arrow"></span></a>
                  <a href="#pricing" className="btn btn-ghost">See pricing</a>
                </div>
                <div className="hero-meta">
                  <div><span className="num">24/7</span><span className="lbl">Always on</span></div>
                  <div><span className="num">0</span><span className="lbl">Missed calls</span></div>
                </div>
              </div>
            </div>
            )}

          </div>
        </section>

        {/* ============ PROOF (phones only) ============ */}
        {/* The night report is the hero's right-hand column on desktop. On a
            phone the hero gives that space to the demo form instead, so the
            report gets its own section here rather than being dropped. No
            number in the eyebrow — the numbered run (01–05) is the same on
            both layouts and this section only exists on one of them. */}
        <section className="proof">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Proof</div>
                <h2 className="section-title">What happened while you slept.</h2>
              </div>
            </div>
            <div className="rc-card rc-report">
              <div className="cm-head"><span className="cm-dot"></span>Overnight · while you slept</div>
              <div className="report-grid">
                <div><span className="r-num">6/6</span><span className="r-lbl">Calls answered</span></div>
                <div><span className="r-num">3</span><span className="r-lbl">Jobs booked</span></div>
                <div><span className="r-num">0</span><span className="r-lbl">Voicemails</span></div>
                <div><span className="r-num">2</span><span className="r-lbl">Quotes requested</span></div>
              </div>
              <div className="report-foot">Every caller answered on the first ring</div>
            </div>
          </div>
        </section>

        {/* ============ SERVICES ============ */}
        <section id="services" className="services">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">What it does · 01</div>
                <h2 className="section-title">Everything a receptionist does. None of the wages.</h2>
              </div>
              <p className="section-lede">
                Answers every call, day or night. Qualifies the job, books it into your diary, and texts you the details before you've put your tools down. And because customers who find you need somewhere to land, pay yearly and we build your website free.
              </p>
            </div>

            <div className="services-grid">
              <article className="svc">
                <div className="svc-num">01 / Always on <span className="tick"></span></div>
                <h3>Answers every call, 24/7.</h3>
                <p>First ring, every time — nights, weekends, bank holidays. Take every call, or just the ones you miss — your choice. Sounds natural, knows your trade, and never sends a caller to voicemail.</p>
                <div className="svc-tag">Included</div>
              </article>

              <article className="svc is-featured">
                <div className="svc-num">02 / Qualifying <span className="tick"></span></div>
                <h3>Asks the right questions.</h3>
                <p>Job type, location, urgency, contact details. You find out whether it's worth the drive before you ever pick up the phone.</p>
                <div className="svc-tag">Included</div>
              </article>

              <article className="svc">
                <div className="svc-num">03 / Booking <span className="tick"></span></div>
                <h3>Books straight into your diary.</h3>
                <p>Checks your availability and locks in the slot while you're on the tools. Wake up to a full calendar, not a list of voicemails.</p>
                <div className="svc-tag">Included</div>
              </article>

              <article className="svc">
                <div className="svc-num">04 / Instant alerts <span className="tick"></span></div>
                <h3>The details hit your phone.</h3>
                <p>Every call summed up and texted to you the second it ends — name, number, the job, how urgent. Call back when it suits you.</p>
                <div className="svc-tag">Included</div>
              </article>

              <article className="svc">
                <div className="svc-num">05 / Reviews engine <span className="tick"></span></div>
                <h3>More 5-stars, automatically.</h3>
                <p>Texts a Google review link after every completed job. More reviews, higher ranking, more calls — and no nagging from you.</p>
                <div className="svc-tag">Included</div>
              </article>

              <article className="svc">
                <div className="svc-num">06 / Your website <span className="tick"></span></div>
                <h3>A proper website. Free.</h3>
                <p>Designed, built and hosted by us — free when you pay yearly, a £497 build included. The receptionist answers the calls; the website wins you the ones who Google first.</p>
                <div className="svc-tag">On yearly</div>
              </article>
            </div>
          </div>
        </section>

        {/* ============ PROCESS ============ */}
        <section id="process" className="process">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">How it works · 02</div>
                <h2 className="section-title">Three steps. Live by tomorrow.</h2>
              </div>
              <p className="section-lede">
                The whole setup runs by message. No calls, no install, no new hardware. Most lines are answering within 24 hours of you sending your details.
              </p>
            </div>

            <div className="process-timeline">
              <div className="process-line">
                <div className="process-line-fill" style={{ width: processFillWidth }}></div>
              </div>
              <div className="process-grid">
                {[
                  { n: '01', lbl: 'Tell us', h3: 'Tell us about your business.', p: 'Your trade, your services, your hours, and the questions you always get asked. Takes a few minutes by message — no call to book.', dur: 'Day 1 · 5 mins' },
                  { n: '02', lbl: 'We build', h3: 'We train your receptionist.', p: 'We write the script, set the voice, and wire up the booking logic — trained on how your trade actually works, not a generic bot.', dur: 'Same day · async' },
                  { n: '03', lbl: 'Live', h3: 'Forward your calls. Done.', p: 'Point your number at it, or use a fresh one we give you. It starts answering, qualifying and booking jobs straight away. On the yearly plan, your free website follows within the week.', dur: 'Live in 24h' },
                ].map((step, i) => (
                  <article
                    key={step.n}
                    className={`step${activeStep === i ? ' active' : ''}`}
                    onClick={() => {
                      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
                      setActiveStep(i);
                      stepTimerRef.current = setInterval(() => {
                        setActiveStep(prev => (prev + 1) % 3);
                      }, 4000);
                    }}
                  >
                    <div className="step-head">
                      <div className="step-num">{step.n}</div>
                      <div className="step-lbl">{step.lbl}</div>
                    </div>
                    <h3>{step.h3}</h3>
                    <p>{step.p}</p>
                    <div className="step-dur">{step.dur}</div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ PRICING ============ */}
        <section id="pricing" className="pricing">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">Pricing · 03</div>
                <h2 className="section-title">Simple pricing.</h2>
              </div>
              <p className="section-lede">
                One plan, everything in. Month-to-month, no setup fee, cancel any time — or pay yearly, get two months free, and we build your website free on top. Most trades cover it with the first job it books them.
              </p>
            </div>

            {/* One plan, two ways to pay. Yearly is the featured side: the
                website is the yearly bonus, so the build cost is only ever
                incurred once the year is paid up front. */}
            <div className="billing-toggle" role="tablist" aria-label="Billing period">
              {([['monthly', 'Monthly'], ['yearly', 'Yearly']] as const).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={billing === v}
                  className={billing === v ? 'active' : ''}
                  onClick={() => setBilling(v)}
                >
                  {label}{v === 'yearly' && <span className="bt-flag">2 mo free</span>}
                </button>
              ))}
            </div>

            <div className="tiers tiers-2" data-billing={billing}>
              <div className="tier">
                <div className="tier-head">
                  <div>
                    <div className="tier-name">Monthly</div>
                  </div>
                </div>
                <div className="tier-price">
                  <span className="cur">£</span><span className="num">149</span><span className="per">/mo</span>
                </div>
                <p className="tier-blurb">Your calls answered around the clock, leads qualified, and jobs booked straight into your diary. Live in 24 hours.</p>
                <ul className="tier-features">
                  {[
                    '24/7 call answering — first ring, every time',
                    'Natural voice, trained on your trade',
                    'Qualifies every lead — job, location, urgency',
                    'Books jobs straight into your calendar',
                    'Instant text summary after every call',
                    'Missed-call rescue — catches the ones you can\'t',
                    'Automatic Google review request after every job',
                    'Monthly call & booking report',
                    'Spam & time-waster filtering',
                    'Use your existing number or a new one',
                    'Free setup & onboarding — we build and train it',
                    'No contract — cancel any time',
                  ].map(f => <li key={f}>{f}</li>)}
                </ul>
                <div className="tier-spacer"></div>
                <a href="#contact" className="btn btn-ghost btn-full">Get Started <span className="btn-arrow"></span></a>
              </div>

              <div className="tier featured">
                <div className="tier-ribbon">Best value</div>
                <div className="tier-head">
                  <div>
                    <div className="tier-name">Yearly</div>
                  </div>
                </div>
                <div className="tier-price">
                  <span className="cur">£</span><span className="num">1,490</span><span className="per">/yr</span>
                </div>
                <p className="tier-blurb">The same receptionist, two months free, and we design and build your website free on top — a £497 build, included.</p>
                <ul className="tier-features">
                  {[
                    'Everything in Monthly',
                    'Two months free — £1,490 instead of £1,788',
                    'Your website built free — a £497 build, included',
                    'Single-page site tuned to your trade',
                    'Conversion copy + trade photography throughout',
                    'Click-to-call, WhatsApp + contact form',
                    'Built to rank for your trade in your home town',
                    'Simple logo included (if you don\'t have one)',
                    'Hosting, SSL & backups included',
                    'Your domain, your site — keep it if you leave',
                  ].map(f => <li key={f}>{f}</li>)}
                </ul>
                <div className="care-addon">
                  <div className="care-title">Already got a site you love?</div>
                  <div className="care-sub">Keep it — the receptionist works with any website, or none at all. The two months free still stand.</div>
                </div>
                <a href="#contact" className="btn btn-primary btn-full">Get Started <span className="btn-arrow"></span></a>
              </div>
            </div>

            <div className="addons">
              <div className="addons-label">Add-ons</div>
              <div className="addon-row">
                <div className="addon-name">Extra line</div>
                <div className="addon-desc">A second number or location, answered by the same receptionist.</div>
                <div className="addon-price">£40/mo</div>
              </div>
              <div className="addon-row">
                <div className="addon-name">Custom voice</div>
                <div className="addon-desc">Choose the voice and accent that fits your business, or clone your own.</div>
                <div className="addon-price">£25/mo</div>
              </div>
              <div className="addon-row">
                <div className="addon-name">Outbound follow-ups</div>
                <div className="addon-desc">It calls back missed leads and chases quotes you've sent, so nothing slips.</div>
                <div className="addon-price">£40/mo</div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ FAQ ============ */}
        <section id="faq" className="faq">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="eyebrow">FAQ · 04</div>
                <h2 className="section-title">Fair questions, straight answers.</h2>
              </div>
              <p className="section-lede">
                The stuff trades actually ask us. Nothing here? Drop us a message and we'll answer honestly — even if the honest answer is that we're not the right fit.
              </p>
            </div>

            <div className="faq-grid">
              <div className="faq-side">
                <p style={{ fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12 }}>Still stuck?</p>
                <h3 style={{ fontSize: 32, letterSpacing: '-0.02em', marginBottom: 24 }}>Drop us a message.</h3>
                <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.6, marginBottom: 28, maxWidth: '40ch' }}>
                  We reply fast and answer straight — no pushy sales, no jargon.
                </p>
                <a href="#contact" className="btn btn-dark">Get in touch</a>
              </div>

              <div className="faq-list">
                {[
                  { n: '01', q: 'Will it sound like a robot?', a: "No. It uses a natural voice, trained on your trade, and most callers don't realise they're talking to AI. You can pick the voice and even the accent if you want. Better yet — try it yourself in the live demo above." },
                  { n: '02', q: 'What happens to my existing number?', a: 'Nothing changes for your customers. You forward your calls to the receptionist — all of them, or only the ones you miss — or we give you a brand-new number. Your call either way.' },
                  { n: '03', q: "What if it can't answer a question?", a: "It takes the details and texts them to you straight away, or transfers the call to you live if you'd rather. It never leaves a caller hanging or stuck in a loop." },
                  { n: '04', q: 'Will it actually book jobs?', a: 'Yes. It checks your availability, books the slot into your diary, and sends you the details by text. You set the rules — job types, hours, the areas you cover — so it only books what you want.' },
                  { n: '05', q: 'How fast can I go live?', a: 'Usually within 24 hours of sending your details. There\'s no hardware to install and no app for your customers — we set it up and point your calls at it.' },
                  { n: '06', q: 'Is there a contract?', a: 'No. It\'s month-to-month, cancel any time. Most trades find one booked job more than covers the month — fewer missed calls, more work won.' },
                  { n: '07', q: 'Is the website really free?', a: 'Yes — on the yearly plan. Pay £1,490 up front (two months free) and we design, build and host a professional site for you at no extra cost: a £497 build, included. On monthly it\'s not part of the £149 — switch to yearly whenever you like and we\'ll build it. Already got a site you love? Keep it; the receptionist works with any website or none.' },
                ].map((item, i) => (
                  <div key={item.n} className={`faq-item${openFaq === i ? ' open' : ''}`}>
                    <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span><span className="q-num">{item.n}</span>{item.q}</span>
                      <span className="q-toggle">+</span>
                    </button>
                    <div className="faq-a">{item.a}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ CONTACT ============ */}
        <section id="contact" className="contact">
          <div className="container contact-grid">
            <div className="contact-left">
              <div className="eyebrow">Let's go · 05</div>
              <h2>Get your receptionist live.</h2>
              <p>Tell us about your business, pick a plan, and we'll have your calls answered within 24 hours. No calls, no back-and-forth.</p>
              <div className="contact-deets">
                <div className="row"><span className="lbl">Email</span><span className="val">hello@tradiestoolbox.co.uk</span></div>
                <div className="row"><span className="lbl">Based</span><span className="val">South Wales · serving UK-wide</span></div>
              </div>
            </div>

            {submitted ? (
              <div className="contact-form" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 800, padding: '40px 0' }}>
                  Cheers — we'll be in touch within 1 working day to get your receptionist set up.
                </div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="field-row">
                  <div className="field">
                    <label>Business name</label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Plumbing"
                      required
                      value={formData.businessName}
                      onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Trade</label>
                    <select
                      required
                      value={formData.trade}
                      onChange={e => setFormData({ ...formData, trade: e.target.value })}
                    >
                      <option value="" disabled>Select your trade…</option>
                      <option>Plumber</option>
                      <option>Electrician</option>
                      <option>Builder</option>
                      <option>Roofer</option>
                      <option>Decorator</option>
                      <option>Landscaper</option>
                      <option>Gas Engineer</option>
                      <option>Joiner / Carpenter</option>
                      <option>Tiler</option>
                      <option>Plasterer</option>
                      <option>Handyman</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Location / service area</label>
                  <input
                    type="text"
                    placeholder="e.g. Manchester &amp; surrounding areas"
                    required
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Current website <span className="field-opt">(optional)</span></label>
                  <input
                    type="url"
                    placeholder="https://www.yoursite.com"
                    value={formData.currentSite}
                    onChange={e => setFormData({ ...formData, currentSite: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Plan interested in</label>
                  <select
                    required
                    value={formData.package}
                    onChange={e => setFormData({ ...formData, package: e.target.value })}
                  >
                    <option value="" disabled>Select a plan…</option>
                    <option>Monthly — £149/mo</option>
                    <option>Yearly — £1,490 (2 months free)</option>
                    <option>Not sure — help me decide</option>
                  </select>
                </div>
                <div className="field">
                  <label>Your email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn btn-dark btn-full btn-submit" disabled={submitting}>
                  <span className="submit-ico">➤</span> {submitting ? 'Sending…' : 'Get set up'}
                </button>
                {submitError && (
                  <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0, textAlign: 'center' }}>{submitError}</p>
                )}
                <p className="form-foot">
                  We'll be in touch within 1 working day to get you set up. No calls, no spam.{' '}
                  <Link to="/privacy">Privacy policy</Link>.
                </p>
              </form>
            )}
          </div>
        </section>

        {/* ============ FOOTER ============ */}
        <footer>
          <div className="container">
            <div className="footer-grid">
              <div className="footer-brand">
                <a href="#top" className="brand">
                  <svg className="brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h4l13 -13a1.5 1.5 0 0 0 -4 -4l-13 13v4" /><path d="M14.5 5.5l4 4" /><path d="M12 8l-5 -5l-4 4l5 5" /><path d="M7 8l-1.5 1.5" /><path d="M16 12l5 5l-4 4l-5 -5" /><path d="M16 17l-1.5 1.5" /></svg>
                  <Wordmark />
                </a>
                <p>An AI receptionist for UK trades — with a free website on the yearly plan. Answers every call, books every job, 24/7. South Wales–based, working nationwide.</p>
              </div>
              <div className="footer-col">
                <h5>What it does</h5>
                <ul>
                  <li><a href="#services">24/7 answering</a></li>
                  <li><a href="#services">Lead qualifying</a></li>
                  <li><a href="#services">Job booking</a></li>
                  <li><a href="#services">Text alerts</a></li>
                  <li><a href="#services">Free website</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h5>Trades we serve</h5>
                <ul>
                  <li><a href="#services">Plumbers</a></li>
                  <li><a href="#services">Electricians</a></li>
                  <li><a href="#services">Builders</a></li>
                  <li><a href="#services">Roofers</a></li>
                  <li><a href="#services">Landscapers</a></li>
                </ul>
              </div>
              <div className="footer-col">
                <h5>Company</h5>
                <ul>
                  <li><a href="#demo">Try it live</a></li>
                  <li><a href="#process">How it works</a></li>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#faq">FAQ</a></li>
                  <li><a href="#contact">Contact</a></li>
                  <li><Link to="/privacy">Privacy</Link></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <div>© 2026 Tradies Toolbox Ltd · South Wales, UK</div>
              <div>Built on the tools</div>
            </div>
          </div>
        </footer>

      </main>

      {/* ============ THUMB BAR (phones only) ============ */}
      {/* Price left, action right at 48px. The page is ~2600px tall on a
          handset, so without this both the price and the CTA spend most of
          the scroll off-screen. Fixed rather than sticky: it has no place in
          the flow to stick to, and the footer carries matching bottom
          padding so nothing sits under it. */}
      <div className="thumb-bar">
        <a href="#pricing" className="thumb-price">
          <span className="tb-num">£149</span>
          <span className="tb-lbl">per month</span>
        </a>
        <a href="#demo" className="btn btn-primary thumb-cta">
          Hear it answer <span className="btn-arrow"></span>
        </a>
      </div>

      {/* ============ TWEAKS PANEL ============ */}
      <div className={`tweaks${tweaksOpen ? ' open' : ''}`}>
        <div className="tweaks-head">
          <span>Tweaks</span>
          <button className="tweaks-close" onClick={() => setTweaksOpen(false)}>×</button>
        </div>
        <div className="tweaks-row">
          <label>Hero layout</label>
          <div className="tweaks-chips">
            {(['editorial', 'blocks', 'ticker'] as const).map(v => (
              <button key={v} className={heroVariant === v ? 'active' : ''} onClick={() => setKey('hero', v)}>
                {v === 'editorial' ? 'Editorial' : v === 'blocks' ? 'Trade picker' : 'Ticker'}
              </button>
            ))}
          </div>
        </div>
        <div className="tweaks-row">
          <label>Theme</label>
          <div className="tweaks-chips">
            {(['light', 'dark'] as const).map(v => (
              <button key={v} className={theme === v ? 'active' : ''} onClick={() => setKey('theme', v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="tweaks-row">
          <label>Font pairing</label>
          <div className="tweaks-chips">
            {([
              ['display-sans', 'Archivo / Inter'],
              ['condensed-serif', 'Narrow / Fraunces'],
              ['mono-grotesk', 'Grotesk / Plex Mono'],
            ] as const).map(([v, label]) => (
              <button key={v} className={fonts === v ? 'active' : ''} onClick={() => setKey('fonts', v)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
