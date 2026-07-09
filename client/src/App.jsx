import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, FileText, Zap, DollarSign, Loader2, Lock, ArrowRight, Star, Users, Briefcase, Globe, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { fetchWithTimeout, FetchTimeoutError } from './lib/fetchWithTimeout';

const stripePromise = loadStripe('pk_live_51TabVoRhcVsJZDqEdXCRGzds6vhimLJLtJEFfLpuM8xsbMNiQWlF74MKSmh3Qk0qUdTpKyc8n4NRqGz0Bo0OFlFc00tMhjmGWB');

const App = () => {
  const [contractText, setContractText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScan = async () => {
    if (!contractText) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithTimeout('http://localhost:5000/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractText }),
        timeoutMs: 9000,
      });
      if (!response.ok) throw new Error(`Scan request failed (${response.status})`);
      const data = await response.json();
      setResults(data);
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      if (err instanceof FetchTimeoutError) {
        setError({
          message: "The scan is taking longer than expected. Check your connection and try again.",
          retry: handleScan,
        });
      } else {
        setError({
          message: 'Analysis failed. Please ensure your backend is running.',
          retry: handleScan,
        });
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (priceId, mode) => {
    try {
      const response = await fetchWithTimeout('http://localhost:5000/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, mode }),
        timeoutMs: 9000,
      });
      if (!response.ok) throw new Error(`Checkout session request failed (${response.status})`);
      const { id } = await response.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (err) {
      if (err instanceof FetchTimeoutError) {
        setError({
          message: 'Payment setup is taking longer than expected. Check your connection and try again.',
          retry: () => handlePayment(priceId, mode),
        });
      } else {
        setError({ message: 'Payment failed to initialize.', retry: () => handlePayment(priceId, mode) });
      }
      console.error(err);
    }
  };

  const pricingTiers = [
    {
      name: 'Basic Scan',
      price: '$9',
      description: 'Perfect for a single project or vendor agreement.',
      features: ['Full Red Flag Detection', 'IP Ownership Audit', 'Payment Trap Identification', '1-Page Summary Report'],
      buttonText: 'Get Basic Scan',
      mode: 'payment',
      priceId: 'price_1TmqQ5RhcVsJZDqEcxqak6ti'
    },
    {
      name: 'Unlimited',
      price: '$29',
      description: 'For scaling agencies and frequent freelancers.',
      features: ['Unlimited Monthly Scans', 'Priority AI Analysis', 'Bulk Contract Upload', 'Team Access (up to 3)', 'IP Protection Guarantee Tips'],
      buttonText: 'Start Unlimited',
      mode: 'subscription',
      priceId: 'price_1TmqQ5RhcVsJZDqERhs3Vt9y',
      popular: true
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 border-b ${scrolled ? 'bg-black/60 backdrop-blur-xl border-white/10 py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-blue-600 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">ClauseGuard</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Enterprise</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-2">Login</button>
            <button className="bg-white text-black hover:bg-blue-50 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-white/5">
              Start Scanning
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8"
          >
            <Zap className="w-3 h-3 fill-blue-400" /> Trusted by 2,000+ Freelancers
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tighter leading-[0.9] max-w-4xl"
          >
            Don't Sign Your <br />
            <span className="text-blue-500 italic">Business Away.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed"
          >
            AI-powered contract auditing that flags predatory clauses, IP traps, and payment risks in seconds. Professional legal protection for the price of a coffee.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center"
          >
            <a href="#scanner" className="bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20">
              Run Free Check <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#pricing" className="bg-white/5 hover:bg-white/10 border border-white/10 px-8 py-4 rounded-2xl font-bold flex items-center justify-center transition-all backdrop-blur-md">
              View Pricing
            </a>
          </motion.div>
        </div>
      </header>

      {/* Trust Bar */}
      <section className="py-12 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-gray-600 uppercase tracking-[0.3em] mb-10">Protecting work across the globe</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale contrast-125">
            <div className="flex items-center gap-2 font-black text-2xl italic"><Globe className="w-6 h-6" /> GLOBAL</div>
            <div className="flex items-center gap-2 font-black text-2xl italic"><Briefcase className="w-6 h-6" /> WORKFLOW</div>
            <div className="flex items-center gap-2 font-black text-2xl italic"><Lock className="w-6 h-6" /> SECURE</div>
            <div className="flex items-center gap-2 font-black text-2xl italic"><Shield className="w-6 h-6" /> COMPLIANT</div>
          </div>
        </div>
      </section>

      {/* Main Scanner Area */}
      <section id="scanner" className="py-32 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Contract Analyzer</h2>
            <p className="text-gray-500">Paste your agreement below to run a security scan.</p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative bg-[#0d0d0d] border border-white/10 rounded-[2rem] p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">Agreement Text</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                  <Lock className="w-3 h-3" /> Encrypted & Private
                </div>
              </div>
              
              <textarea
                className="w-full h-80 bg-transparent border-none focus:ring-0 text-gray-200 text-lg resize-none placeholder:text-gray-700 scrollbar-hide"
                placeholder="Paste your freelance or vendor contract here... e.g., '1. Services to be performed...'"
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
              />
              
              {error && (
                <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-sm text-red-300">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                    <span>{error.message}</span>
                  </div>
                  <button
                    onClick={error.retry}
                    className="shrink-0 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0d0d0d] bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                        <Users className="w-3 h-3" />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">Currently analyzing 14 contracts in real-time</p>
                </div>
                <button
                  onClick={handleScan}
                  disabled={loading || !contractText}
                  className="w-full md:w-auto bg-white text-black hover:bg-gray-100 px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-black" />}
                  {loading ? 'ANALYZING CLAUSES...' : 'SCAN FOR RED FLAGS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {results && (
          <motion.section 
            id="results-section"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-24 px-6 bg-blue-600/5"
          >
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div>
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                      <Shield className="text-blue-500" /> Audit Summary
                    </h2>
                    <p className="text-gray-400">Analysis completed using ClauseGuard AI v1.5</p>
                  </div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-center">
                    {results.flags?.length || 0} Issues Detected
                  </div>
                </div>

                <div className="grid gap-6">
                  {results.flags && results.flags.length > 0 ? (
                    results.flags.map((flag, i) => (
                      <div key={i} className="group bg-black/40 border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all">
                        <div className="flex justify-between items-start mb-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            flag.severity === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                            flag.severity === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                            'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          }`}>
                            {flag.severity} RISK
                          </span>
                          <div className="text-gray-600 group-hover:text-gray-400 transition-colors">
                            <Info className="w-4 h-4" />
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">{flag.description}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                          <span className="text-blue-400 font-bold uppercase text-[9px] block mb-1">Expert Recommendation</span>
                          {flag.suggestion}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">Clear Scan!</h3>
                      <p className="text-gray-400 max-w-sm mx-auto">Our AI didn't find any critical red flags. You're likely safe, but always trust your gut.</p>
                    </div>
                  )}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500 mb-6 italic">"A \$9 scan saved me from a \$15,000 IP dispute." - Sarah J., Freelance UI Designer</p>
                    <button className="bg-white text-black px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all">Download PDF Report</button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 tracking-tighter leading-none">Invest in your Peace of Mind.</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Simple, transparent pricing. No hidden fees. Cancel the monthly plan any time.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <div key={i} className={`relative flex flex-col h-full bg-[#0d0d0d] border ${tier.popular ? 'border-blue-500 shadow-2xl shadow-blue-500/10' : 'border-white/10'} rounded-[2.5rem] p-10 overflow-hidden group hover:translate-y-[-8px] transition-all duration-500`}>
                {tier.popular && (
                  <div className="absolute top-6 right-6 bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Most Popular</div>
                )}
                
                <div className="mb-10">
                  <h3 className="text-xl font-black mb-4 uppercase tracking-widest text-gray-500">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-6xl font-black tracking-tighter">{tier.price}</span>
                    <span className="text-gray-600 font-bold uppercase text-xs">{tier.mode === 'subscription' ? 'per month' : 'per scan'}</span>
                  </div>
                  <p className="text-gray-400 font-medium leading-relaxed">{tier.description}</p>
                </div>

                <div className="space-y-5 mb-12 flex-grow">
                  {tier.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-4 group/item">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${tier.popular ? 'bg-blue-500/20' : 'bg-white/10'} group-hover/item:scale-110 transition-transform`}>
                        <CheckCircle className={`w-3 h-3 ${tier.popular ? 'text-blue-500' : 'text-gray-400'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handlePayment(tier.priceId, tier.mode)}
                  className={`w-full py-5 rounded-[1.25rem] font-black tracking-tight text-lg transition-all ${
                  tier.popular ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/30' : 'bg-white text-black hover:bg-blue-50'
                }`}
                >
                  {tier.buttonText}
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  <Lock className="w-3 h-3" /> Secure Stripe Checkout
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 px-6 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
              {[
                  { name: "Alex Chen", role: "Full-stack Dev", text: "Caught a non-compete clause that would have blocked me from my next 3 projects. \$9 scan saved me \$20k." },
                  { name: "Elena Rossi", role: "Creative Director", text: "The IP ownership report is so clear even my clients understand why I need to change the terms." },
                  { name: "Marcus Thorne", role: "Agency Founder", text: "We run every vendor agreement through ClauseGuard now. It's our first line of defense." }
              ].map((t, i) => (
                  <div key={i} className="p-8 bg-[#0d0d0d] border border-white/5 rounded-3xl">
                      <div className="flex gap-1 mb-4">
                          {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-yellow-500 text-yellow-500" />)}
                      </div>
                      <p className="text-gray-400 mb-6 italic leading-relaxed">"{t.text}"</p>
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs">{t.name[0]}</div>
                          <div>
                              <div className="text-sm font-bold">{t.name}</div>
                              <div className="text-[10px] text-gray-600 uppercase font-black">{t.role}</div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="text-blue-500 w-6 h-6" />
                <span className="text-2xl font-black tracking-tighter">ClauseGuard</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                The world's first AI-driven contract auditor for the modern workforce. Protecting your rights, one clause at a time.
              </p>
              <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"><Globe className="w-4 h-4" /></div>
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"><Users className="w-4 h-4" /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <h4 className="font-bold mb-6 text-sm uppercase tracking-[0.2em] text-gray-600">Product</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Scanner</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-sm uppercase tracking-[0.2em] text-gray-600">Resources</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Red Flag Library</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Legal Blog</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-sm uppercase tracking-[0.2em] text-gray-600">Company</h4>
                <ul className="space-y-4 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
            <div>© 2024 ClauseGuard AI. All rights reserved.</div>
            <div className="flex gap-8">
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Legal Disclaimer</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
