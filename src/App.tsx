import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wrench,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Star,
  TrendingUp,
  Check,
  Send,
  Zap,
  Phone,
  Globe,
  ExternalLink,
  Clock,
  Mic,
} from 'lucide-react';

export default function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
  };

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

  const portfolio: { name: string; trade: string; location: string; package: string; url: string | null; description: string }[] = [
    {
      name: 'Wayne Edwards Plumbing & Gas',
      trade: 'Plumber & Gas Engineer',
      location: 'Llanelli, South Wales',
      package: 'Growth',
      url: 'https://wayne-edwards.netlify.app/',
      description: 'Multi-page local SEO site for a Gas Safe registered engineer with 20+ years experience. Competitor research, service pages, schema markup.',
    },
    {
      name: 'Craig Edwards Plumbing',
      trade: 'Plumber',
      location: 'Llanelli, Wales',
      package: 'Growth',
      url: 'https://craig-edwards.netlify.app/',
      description: 'Service-page focused Growth build targeting boiler installations, repairs, and central heating across Llanelli.',
    },
    {
      name: 'Corcoran Plumbing & Heating',
      trade: 'Plumber & Gas Engineer',
      location: 'Llanelli, Wales',
      package: 'Starter',
      url: 'https://corcoran-plumbing.netlify.app/',
      description: 'Steel and orange brand identity for a Gas Safe registered heating specialist. Boiler installations, servicing, and LPG work across Carmarthenshire.',
    },
  ];

  return (
    <div className="min-h-screen font-sans text-brand-dark selection:bg-brand-orange selection:text-white">

      {/* Nav */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/ttlogo.svg" alt="TradersToolkit" className="h-9 w-auto" />
          </div>

          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <a href="#how-it-works" className="hover:text-brand-orange transition-colors">How It Works</a>
            <a href="#portfolio" className="hover:text-brand-orange transition-colors">Our Work</a>
            <a href="#pricing" className="hover:text-brand-orange transition-colors">Pricing</a>
            <a href="#start-build" className="bg-brand-dark text-white px-5 py-2.5 rounded-full hover:bg-brand-orange transition-colors font-semibold shadow-lg shadow-brand-dark/10">
              Start Your Build
            </a>
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-6 text-xl font-display font-bold">
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#portfolio" onClick={() => setMobileMenuOpen(false)}>Our Work</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <a href="#start-build" onClick={() => setMobileMenuOpen(false)} className="bg-brand-orange text-white px-6 py-4 rounded-xl mt-4 text-center">
                Start Your Build
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative pt-28 pb-10 lg:pt-32 lg:pb-16 overflow-hidden min-h-screen flex flex-col justify-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:18px_18px] opacity-40" />
        <div className="absolute top-0 right-0 -z-10 w-[700px] h-[700px] bg-brand-orange/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange font-semibold text-sm mb-6 border border-brand-orange/20">
                <Zap className="w-4 h-4" />
                For Plumbers, Roofers, Electricians & HVAC
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight mb-4">
                Websites built for the trades.{' '}
                <span className="text-brand-orange">AI tools to back them up.</span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-base text-brand-slate mb-6 leading-relaxed max-w-[55ch]">
                We build high-converting sites for tradespeople — researched against your competitors, optimised for local search, and delivered fully async. No calls required.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <a href="#portfolio" className="bg-brand-orange text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-[#e66000] transition-colors shadow-xl shadow-brand-orange/20 flex items-center justify-center gap-2">
                  See Our Work <ArrowRight className="w-5 h-5" />
                </a>
                <a href="#start-build" className="bg-white text-brand-dark border-2 border-gray-200 px-8 py-4 rounded-xl font-bold text-base hover:border-brand-dark transition-colors flex items-center justify-center gap-2">
                  View Pricing
                </a>
              </motion.div>

              <motion.div variants={fadeInUp} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-brand-slate font-medium">
                {['Trades only', 'You own the site', 'Fully async', 'AI-powered'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative lg:ml-auto"
            >
              <div className="relative w-full mx-auto">
                {/* Desktop monitor mockup */}
                <div className="flex flex-col items-center">
                  {/* Monitor bezel */}
                  <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-3 pt-7 shadow-[0_30px_80px_-10px_rgba(0,0,0,0.5)] border border-gray-700/80 relative w-full ring-1 ring-white/5">
                    {/* Webcam dot */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-600 ring-1 ring-gray-500" />
                    {/* Screen with inner glow */}
                    <div className="rounded-lg overflow-hidden shadow-inner ring-1 ring-black/40">
                      <img
                        src="/wayne-edwards-preview.png"
                        alt="Wayne Edwards Plumbing — client site preview"
                        className="w-full h-auto block"
                        loading="eager"
                      />
                    </div>
                    {/* Bottom bezel reflection */}
                    <div className="h-1.5 mt-2 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent mx-8" />
                  </div>
                  {/* Stand neck — tapered */}
                  <div
                    className="mx-auto bg-gradient-to-b from-gray-700 to-gray-600"
                    style={{ width: '48px', height: '28px', clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)' }}
                  />
                  {/* Stand base — pill with sheen */}
                  <div className="relative w-44 h-3 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full shadow-lg">
                    <div className="absolute inset-x-6 top-0.5 h-0.5 rounded-full bg-white/20" />
                  </div>
                </div>

                {/* Mobile phone mockup — floating in front */}
                <motion.div
                  initial={{ x: 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6, ease: 'easeOut' }}
                  className="absolute -bottom-2 right-2 z-10"
                  style={{ width: '90px' }}
                >
                  {/* Phone frame */}
                  <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-[18px] p-1.5 shadow-[0_20px_50px_-5px_rgba(0,0,0,0.6)] border border-gray-700/80 ring-1 ring-white/5 relative">
                    {/* Notch */}
                    <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gray-700 z-10" />
                    {/* Screen */}
                    <div className="rounded-[12px] overflow-hidden bg-black" style={{ aspectRatio: '9/18' }}>
                      <img
                        src="/wayne-edwards-mobile-preview.svg"
                        alt="Mobile preview"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                    {/* Home bar */}
                    <div className="mt-1 w-8 h-1 bg-gray-600 rounded-full mx-auto" />
                  </div>
                  {/* Phone shadow */}
                  <div className="w-3/4 h-2 bg-black/30 rounded-full blur-sm mx-auto mt-1" />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -bottom-4 left-4 right-4 bg-white rounded-2xl p-4 shadow-2xl border border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">Local search ranking up</p>
                      <p className="text-xs text-brand-slate truncate">"Plumber Llanelli" — page 1</p>
                    </div>
                    <div className="flex gap-1 items-end shrink-0">
                      {[6, 10, 8, 14, 10, 16].map((h, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [h * 0.6, h, h * 0.6] }}
                          transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.15 }}
                          className="w-1.5 bg-green-500 rounded-full"
                          style={{ height: h }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-brand-slate">The whole process runs by message. No calls, no meetings, no waiting around.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: '1',
                icon: <Globe className="w-6 h-6" />,
                title: 'Fill in the form',
                body: 'Tell us your trade, your area, and your current site if you have one. Takes 3 minutes.',
              },
              {
                n: '2',
                icon: <Wrench className="w-6 h-6" />,
                title: 'We research and build',
                body: "We analyse your competitors, extract your brand, and build a site designed to beat what's already out there.",
              },
              {
                n: '3',
                icon: <CheckCircle2 className="w-6 h-6" />,
                title: 'Review and go live',
                body: "You get a preview link. Approve it or send feedback by message. We handle the rest — including going live on your domain.",
                highlight: true,
              },
            ].map(step => (
              <motion.div
                key={step.n}
                whileHover={{ y: -4 }}
                className={`rounded-3xl p-8 border ${step.highlight ? 'bg-brand-orange text-white border-brand-orange shadow-xl shadow-brand-orange/20' : 'bg-gray-50 border-gray-100'}`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-6 font-display font-bold text-lg ${step.highlight ? 'bg-white text-brand-orange' : 'bg-brand-dark text-white'}`}>
                  {step.n}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className={`leading-relaxed text-sm ${step.highlight ? 'text-orange-50' : 'text-brand-slate'}`}>{step.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-24 bg-brand-light border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl font-bold mb-4">Our work</h2>
            <p className="text-lg text-brand-slate">Every site is built from scratch — researched, designed, and optimised for local search.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {portfolio.map(p => (
              <motion.div
                key={p.name}
                whileHover={{ y: -4 }}
                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col"
              >
                <div className="overflow-hidden bg-gray-100 relative" style={{ height: '240px' }}>
                  {p.url ? (
                    <iframe
                      src={p.url}
                      title={p.name}
                      loading="lazy"
                      style={{
                        pointerEvents: 'none',
                        width: '1200px',
                        height: '800px',
                        transform: 'scale(0.4)',
                        transformOrigin: 'top left',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-brand-slate">
                      <Globe className="w-8 h-8 opacity-30" />
                      <span className="text-xs font-medium opacity-50">Coming soon</span>
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                      <p className="text-sm text-brand-slate mt-0.5">{p.trade} · {p.location}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full border border-brand-orange/20">{p.package}</span>
                  </div>
                  <p className="text-sm text-brand-slate leading-relaxed mb-5 flex-1">{p.description}</p>
                  {p.url ? (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-brand-orange hover:underline"
                    >
                      View live site <ExternalLink className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-slate opacity-50">
                      <Clock className="w-4 h-4" /> Deploying soon
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl font-bold mb-4">What we offer</h2>
            <p className="text-lg text-brand-slate">Start with a site that converts. Add AI tools when you're ready.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Website Build */}
            <div className="bg-brand-dark text-white rounded-3xl p-8">
              <div className="w-11 h-11 bg-brand-orange rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Website Build</h3>
              <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                A high-converting, mobile-first website optimised for local search. Built from competitor research, not templates.
              </p>
              <ul className="space-y-2.5 text-sm text-gray-300">
                {['Local SEO on every page', 'Schema.org structured data', 'Google review integration', 'Contact form lead capture', 'Delivered in 5–7 days'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-orange shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#pricing" className="mt-8 block text-center bg-brand-orange text-white font-bold py-3.5 rounded-xl hover:bg-[#e66000] transition-colors text-sm">
                See Pricing
              </a>
            </div>

            {/* AI Receptionist */}
            <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-xs font-bold bg-brand-dark text-white px-3 py-1 rounded-full">Coming Soon</div>
              <div className="w-11 h-11 bg-brand-orange/10 border border-brand-orange/20 rounded-xl flex items-center justify-center mb-6">
                <Mic className="w-6 h-6 text-brand-orange" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Receptionist</h3>
              <p className="text-brand-slate leading-relaxed mb-6 text-sm">
                An AI voice agent that answers your calls 24/7, qualifies leads, and books jobs directly into your calendar — while you're on the tools.
              </p>
              <ul className="space-y-2.5 text-sm text-brand-slate">
                {['Answers within 2 seconds', 'Sounds like a real person', 'Qualifies leads to your criteria', 'Books directly into your calendar', '0 missed calls'].map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-orange shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className="mt-8 w-full text-center bg-brand-dark text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors text-sm">
                Join the Waitlist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-brand-light border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl font-bold mb-4">Pricing</h2>
            <p className="text-lg text-brand-slate">One-off builds. You own the site outright — no monthly subscription to escape from.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            {/* Starter */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-xl font-bold mb-1">Starter</h3>
              <div className="text-4xl font-display font-bold mb-1">£297</div>
              <p className="text-sm text-brand-slate mb-6">Get online fast with a professional single-page site.</p>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                {[
                  'Single-page website',
                  'Mobile optimised',
                  'Basic local SEO',
                  'Contact form',
                  '1 round of revisions',
                  '5–7 day delivery',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#start-build" className="block text-center bg-gray-100 text-brand-dark font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors text-sm">
                Get Started
              </a>
            </div>

            {/* Growth */}
            <div className="bg-brand-dark text-white rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 bg-brand-orange text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-wider">Most Popular</div>
              <h3 className="text-xl font-bold mb-1">Growth</h3>
              <div className="text-4xl font-display font-bold mb-1">£597</div>
              <p className="text-sm text-gray-300 mb-6">A full local SEO machine built to dominate your area.</p>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-gray-200">
                {[
                  'Multi-page website',
                  'Competitor research included',
                  'Deep local SEO (service + location pages)',
                  'Google review integration',
                  'Schema.org markup',
                  '2 rounds of revisions',
                  '5–7 day delivery',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#start-build" className="block text-center bg-brand-orange text-white font-bold py-3.5 rounded-xl hover:bg-[#e66000] transition-colors shadow-lg shadow-brand-orange/20 text-sm">
                Get Started
              </a>
            </div>

            {/* Scale */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-xl font-bold mb-1">Scale</h3>
              <div className="text-4xl font-display font-bold mb-1">£997</div>
              <p className="text-sm text-brand-slate mb-6">Everything in Growth, plus AI receptionist setup.</p>
              <ul className="space-y-3 mb-8 flex-1 text-sm">
                {[
                  'Everything in Growth',
                  'AI voice receptionist included',
                  'Answers calls 24/7',
                  'Qualifies leads & books jobs',
                  'Priority delivery',
                  '3 rounds of revisions',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a href="#start-build" className="block text-center bg-gray-100 text-brand-dark font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors text-sm">
                Get Started
              </a>
            </div>
          </div>

          {/* Add-ons */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 max-w-2xl">
            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider text-brand-slate">Add-ons</h4>
            <div className="space-y-3">
              {[
                { label: 'Rush Delivery', desc: '24–48hr turnaround', price: '+£100' },
                { label: 'Logo Refresh', desc: 'Modernise your brand mark', price: '+£75' },
                { label: 'Monthly Maintenance', desc: 'Hosting, security, edits & monthly SEO report', price: '£65/mo' },
              ].map(a => (
                <div key={a.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="font-bold text-sm">{a.label}</span>
                    <span className="text-brand-slate text-sm ml-2">{a.desc}</span>
                  </div>
                  <span className="font-bold text-brand-orange text-sm">{a.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="results" className="py-24 bg-brand-dark text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <h2 className="text-4xl font-bold mb-4">Results</h2>
            <p className="text-lg text-gray-300">What trades businesses say after going live.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                quote: "Didn't have to sit through a single sales call. Filled in the form on my lunch break, had a preview site in 5 days. Best money I've spent on marketing.",
                name: 'Mike T.',
                role: 'Owner, Precision Plumbing',
              },
              {
                quote: "The site looks properly professional — way better than what I had on Wix. Already had 3 enquiries in the first week from Google.",
                name: 'Dave R.',
                role: 'Apex Roofing Solutions',
              },
            ].map(t => (
              <div key={t.name} className="bg-white/5 p-8 rounded-3xl border border-white/10">
                <div className="flex gap-1 text-brand-orange mb-6">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-lg font-medium mb-8 leading-relaxed text-gray-200">"{t.quote}"</p>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started Form */}
      <section id="start-build" className="py-24 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h2 className="text-4xl font-bold mb-3">Start your build</h2>
            <p className="text-brand-slate">Pick your package, tell us about your business, and we'll get to work. No calls, no back-and-forth.</p>
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">You're in — we'll be in touch!</h3>
              <p className="text-brand-slate text-sm">We've received your order. We'll kick off your build within 1 working day.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold mb-1.5">Business Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Plumbing"
                    value={formData.businessName}
                    onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1.5">Trade</label>
                  <select
                    required
                    value={formData.trade}
                    onChange={e => setFormData({ ...formData, trade: e.target.value })}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all appearance-none text-sm"
                  >
                    <option value="">Select your trade...</option>
                    {['Plumber', 'Electrician', 'Roofer', 'HVAC / Heating Engineer', 'Carpenter', 'Builder', 'Landscaper', 'Other'].map(t => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">Location / Service Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manchester & surrounding areas"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">Current Website <span className="font-normal text-brand-slate">(optional)</span></label>
                <input
                  type="url"
                  placeholder="https://www.yoursite.com"
                  value={formData.currentSite}
                  onChange={e => setFormData({ ...formData, currentSite: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">Package Interested In</label>
                <select
                  required
                  value={formData.package}
                  onChange={e => setFormData({ ...formData, package: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all appearance-none text-sm"
                >
                  <option value="">Select a package...</option>
                  <option>Starter — £297</option>
                  <option>Growth — £597</option>
                  <option>Scale — £997</option>
                  <option>Not sure yet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold mb-1.5">Your Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-orange focus:border-brand-orange outline-none transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-dark text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
              >
                {submitting ? 'Processing...' : <><Send className="w-4 h-4" /> Confirm My Order</>}
              </button>

              {submitError && (
                <p className="text-sm text-center text-red-600 bg-red-50 rounded-lg py-2 px-3">{submitError}</p>
              )}
              <p className="text-xs text-center text-brand-slate">We'll be in touch within 1 working day to get started. No calls, no spam.</p>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-dark text-gray-400 py-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <img src="/tlogowhite.svg" alt="TradersToolkit" className="h-7 w-auto" />
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#portfolio" className="hover:text-white transition-colors">Our Work</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <p className="text-xs">© 2026 TradersToolkit. traderstoolkit.io</p>
        </div>
      </footer>

    </div>
  );
}
