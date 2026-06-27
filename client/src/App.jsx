import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, FileText, Zap, DollarSign, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_live_51TabVoRhcVsJZDqEdXCRGzds6vhimLJLtJEFfLpuM8xsbMNiQWlF74MKSmh3Qk0qUdTpKyc8n4NRqGz0Bo0OFlFc00tMhjmGWB');

const App = () => {
  const [contractText, setContractText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async () => {
    if (!contractText) return;
    setLoading(true);
    setError(null);
    try {
      // In a real app, we would check payment status here
      const response = await axios.post('http://localhost:5000/api/scan', { contractText });
      setResults(response.data);
    } catch (err) {
      setError('Analysis failed. Please ensure your backend is running and Gemini API key is set.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (priceId, mode) => {
    try {
      const response = await axios.post('http://localhost:5000/api/create-checkout-session', { priceId, mode });
      const { id } = response.data;
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: id });
    } catch (err) {
      setError('Payment failed to initialize.');
      console.error(err);
    }
  };

  const pricingTiers = [
    {
      name: 'Basic Scan',
      price: '$9',
      description: 'One-time audit for a single contract.',
      features: ['Red Flag Detection', 'IP Risk Check', 'Payment Trap Analysis'],
      buttonText: 'Buy Single Scan',
      mode: 'payment',
      priceId: 'price_1TmqQ5RhcVsJZDqEcxqak6ti' 
    },
    {
      name: 'Unlimited',
      price: '$29',
      description: 'Unlimited scans for growing businesses.',
      features: ['All Basic features', 'Priority AI Analysis', 'Contract Storage', 'Team Access'],
      buttonText: 'Subscribe Now',
      mode: 'subscription',
      priceId: 'price_1TmqQ5RhcVsJZDqERhs3Vt9y' 
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/10 px-6 py-4 flex justify-between items-center backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Shield className="text-blue-500 w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">ClauseGuard</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-full text-sm font-medium transition-all">
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent">
            Don't sign a bad deal.<br />Detect red flags instantly.
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            ClauseGuard scans your freelance and vendor contracts for hidden risks, 
            predatory terms, and IP gaps in seconds.
          </p>
        </motion.div>

        {/* Input Area */}
        <section className="relative group max-w-4xl mx-auto mb-24">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4 text-gray-400">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Paste your contract text below</span>
            </div>
            <textarea
              className="w-full h-64 bg-transparent border-none focus:ring-0 text-gray-200 resize-none placeholder:text-gray-600 scrollbar-hide"
              placeholder="PASTE CONTRACT HERE: e.g. This agreement is between Company A and Freelancer B..."
              value={contractText}
              onChange={(e) => setContractText(e.target.value)}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleScan}
                disabled={loading || !contractText}
                className="bg-white text-black hover:bg-gray-200 px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-black" />}
                {loading ? 'Analyzing...' : 'Scan for Red Flags'}
              </button>
            </div>
          </div>
        </section>

        {/* Results Area */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-4xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center"
            >
              {error}
            </motion.div>
          )}

          {results && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto mb-24"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Shield className="text-blue-500" /> Analysis Report
              </h2>
              <div className="grid gap-4">
                {results.flags && results.flags.length > 0 ? (
                  results.flags.map((flag, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          flag.severity === 'High' ? 'bg-red-500/20 text-red-400' : 
                          flag.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {flag.severity} RISK
                        </span>
                        <span className="text-sm text-gray-500">{flag.category}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-1">{flag.description}</h3>
                      <p className="text-gray-400 text-sm">{flag.suggestion}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-12 bg-white/5 rounded-2xl border border-dashed border-white/20">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No critical red flags detected. Still, consider a legal review for safety!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pricing Section */}
        <section id="pricing" className="pt-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 tracking-tight">Simple, No-Bullshit Pricing</h2>
            <p className="text-gray-400">Protect your business for less than the cost of a coffee.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingTiers.map((tier, i) => (
              <div key={i} className="bg-glass-gradient border border-white/10 rounded-3xl p-8 hover:border-blue-500/50 transition-all flex flex-col h-full">
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-extrabold">{tier.price}</span>
                    <span className="text-gray-500 text-sm">{tier.mode === 'subscription' ? '/month' : '/scan'}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{tier.description}</p>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {tier.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="bg-blue-500/20 p-1 rounded-full">
                        <CheckCircle className="w-3 h-3 text-blue-500" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => handlePayment(tier.priceId, tier.mode)}
                  className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  i === 1 ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20' : 'bg-white/10 hover:bg-white/20 text-white'
                }`}>
                  {tier.buttonText}
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Shield className="w-5 h-5" />
            <span className="font-bold tracking-tighter">ClauseGuard</span>
          </div>
          <p className="text-gray-500 text-xs">
            © 2024 ClauseGuard. Not legal advice. Use responsibly.
          </p>
          <div className="flex gap-6 text-gray-500 text-xs">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
