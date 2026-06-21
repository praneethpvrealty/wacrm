'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  Bot, 
  Zap, 
  Users, 
  Layers, 
  ArrowRight, 
  Check, 
  Sparkles, 
  Globe, 
  ChevronDown, 
  Play, 
  Building,
  UserCheck,
  Send,
  Bell,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MARKETING_CONFIG } from '@/config/marketing';

export function MarketingLanding() {
  // Parsing demo state
  const [demoStep, setDemoStep] = useState<'idle' | 'parsing' | 'completed'>('idle');
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  const handleSimulateParse = () => {
    if (demoStep !== 'idle') return;
    setDemoStep('parsing');
    setTimeout(() => {
      setDemoStep('completed');
    }, 1800);
  };

  const handleResetDemo = () => {
    setDemoStep('idle');
  };

  const toggleFaq = (idx: number) => {
    setFaqOpen(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Helper to render correct icon dynamically
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'message':
        return <MessageSquare className="size-5" />;
      case 'bot':
        return <Bot className="size-5" />;
      case 'zap':
        return <Zap className="size-5" />;
      case 'globe':
        return <Globe className="size-5" />;
      case 'send':
        return <Send className="size-5" />;
      case 'bell':
        return <Bell className="size-5" />;
      default:
        return <Sparkles className="size-5" />;
    }
  };

  const isRealEstate = MARKETING_CONFIG.vertical === 'real_estate';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white overflow-x-hidden relative">
      {/* Decorative Radial Background Lights */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 left-1/3 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-xl tracking-tighter shadow-lg shadow-indigo-500/25">
              C
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent tracking-tight">
              ConvoReal
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/login'}
              className="text-slate-300 hover:text-white hover:bg-slate-900/60 text-xs font-semibold px-4 cursor-pointer"
            >
              Sign In
            </Button>
            <Button
              onClick={() => window.location.href = '/signup'}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 hover:scale-[1.02] transition-all cursor-pointer"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-bold mb-6 animate-fade-in tracking-wide">
              <Sparkles className="size-3.5" />
              {MARKETING_CONFIG.hero.badge}
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none max-w-4xl mx-auto mb-6">
              {MARKETING_CONFIG.hero.headlineStart}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                {MARKETING_CONFIG.hero.headlineHighlight}
              </span>
              {MARKETING_CONFIG.hero.headlineEnd}
            </h1>

            {/* Sub-headline */}
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 font-medium mb-10 leading-relaxed">
              {MARKETING_CONFIG.hero.subheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Button
                onClick={() => window.location.href = '/signup'}
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold px-8 py-6 rounded-xl hover:scale-103 transition-all shadow-xl shadow-indigo-600/25 cursor-pointer flex items-center justify-center gap-2"
              >
                {MARKETING_CONFIG.hero.ctaPrimary}
                <ArrowRight className="size-4" />
              </Button>
              <a
                href="#demo"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border border-slate-800 bg-slate-900/40 text-slate-200 text-sm font-semibold hover:bg-slate-800 hover:text-white hover:scale-102 transition-all"
              >
                <Play className="size-4 text-indigo-400" />
                {MARKETING_CONFIG.hero.ctaSecondary}
              </a>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-slate-800/80 bg-slate-900/30 p-2 sm:p-4 backdrop-blur-md shadow-2xl shadow-slate-950/80 group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-10 blur-xl group-hover:opacity-15 transition-opacity" />
              <div className="relative rounded-xl border border-slate-950 overflow-hidden bg-slate-950 flex flex-col aspect-[16/9]">
                {/* Header Mockup */}
                <div className="h-10 bg-slate-900/80 border-b border-slate-800/50 px-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className="size-3 rounded-full bg-rose-500/80" />
                    <div className="size-3 rounded-full bg-amber-500/80" />
                    <div className="size-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono tracking-widest">https://app.convoreal.com/dashboard</span>
                  <div className="w-12" />
                </div>
                {/* Dashboard layout simulator */}
                <div className="flex-1 flex overflow-hidden text-left text-xs text-slate-400">
                  {/* Left Sidebar */}
                  <div className="w-36 bg-slate-950 border-r border-slate-900/50 p-2 flex flex-col gap-1.5 shrink-0 hidden sm:flex">
                    <div className="h-5 bg-indigo-500/10 text-indigo-300 rounded px-2 py-0.5 font-bold flex items-center gap-1.5">
                      <MessageSquare className="size-3" /> Inbox
                    </div>
                    <div className="h-5 hover:bg-slate-900 rounded px-2 py-0.5 flex items-center gap-1.5">
                      <Users className="size-3" /> {isRealEstate ? 'Contacts' : 'Customers'}
                    </div>
                    <div className="h-5 hover:bg-slate-900 rounded px-2 py-0.5 flex items-center gap-1.5">
                      {isRealEstate ? <Building className="size-3" /> : <ShoppingCart className="size-3" />} 
                      {isRealEstate ? 'Inventory' : 'Catalog'}
                    </div>
                    <div className="h-5 hover:bg-slate-900 rounded px-2 py-0.5 flex items-center gap-1.5">
                      <Layers className="size-3" /> Broadcasts
                    </div>
                  </div>
                  
                  {/* Main Work Area Mock */}
                  <div className="flex-1 bg-slate-900/20 p-3 overflow-hidden flex flex-col gap-3">
                    {/* Header stat boxes */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-950/80 border border-slate-850 p-2 rounded-lg flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{isRealEstate ? 'Total Leads' : 'Total Orders'}</span>
                        <span className="text-sm font-black text-white">{isRealEstate ? '412' : '1,284'}</span>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-850 p-2 rounded-lg flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Active Inquiries</span>
                        <span className="text-sm font-black text-indigo-400">{isRealEstate ? '54' : '142'}</span>
                      </div>
                      <div className="bg-slate-950/80 border border-slate-850 p-2 rounded-lg flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">{isRealEstate ? 'Properties Matched' : 'Cart Recovery'}</span>
                        <span className="text-sm font-black text-emerald-400">{isRealEstate ? '89%' : '42.8%'}</span>
                      </div>
                    </div>

                    {/* Chat simulator & Details panel split */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-0">
                      {/* Left Inbox Column */}
                      <div className="md:col-span-7 bg-slate-950 border border-slate-900 rounded-lg flex flex-col overflow-hidden min-h-0">
                        <div className="bg-slate-900/60 p-2 border-b border-slate-900 flex justify-between items-center shrink-0">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Rajesh Kumar
                          </span>
                          <span className="text-[10px] text-slate-500">{isRealEstate ? 'JP Nagar, Bangalore' : 'Shopify Store'}</span>
                        </div>
                        <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto">
                          <div className="max-w-[85%] bg-slate-900/70 p-2 rounded-lg self-start">
                            <p className="text-[11px] text-slate-300">
                              {isRealEstate 
                                ? 'Looking for a premium 3 BHK apartment or villa plot around JP Nagar. Budget 2-2.5 Cr. Send options.'
                                : 'Looking for a premium leather watch strap in dark brown, size 22mm. Budget is under 2,000 INR. Send options.'
                              }
                            </p>
                            <span className="text-[8px] text-slate-500 block text-right mt-1">11:05 AM</span>
                          </div>
                          <div className="max-w-[85%] bg-indigo-600/25 border border-indigo-500/25 p-2 rounded-lg self-end text-slate-200">
                            <p className="text-[11px]">
                              {isRealEstate
                                ? 'Hi Rajesh, here is a list of handpicked properties matching your budget of ₹2.5 Cr in JP Nagar: convoreal.com/pvrealty?ref=pv'
                                : 'Hi Rajesh, here is our Classic Brown Leather Band matching your 22mm preference for ₹1,800: convoreal.com/shop?ref=store'
                              }
                            </p>
                            <span className="text-[8px] text-indigo-400 block text-right mt-1">11:07 AM · Delivered</span>
                          </div>
                        </div>
                      </div>

                      {/* Right AI Match Suggestions */}
                      <div className="md:col-span-5 bg-slate-950 border border-slate-900 rounded-lg p-2 flex flex-col gap-2 overflow-y-auto min-h-0">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-900 pb-1 flex items-center gap-1">
                          <Bot className="size-3.5 text-indigo-400" />
                          AI Match suggestions
                        </span>
                        <div className="border border-emerald-500/30 bg-emerald-950/10 p-2 rounded-lg flex flex-col gap-1.5">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-white text-[11px]">
                              {isRealEstate ? 'JP Nagar Villa Plot' : 'Classic Brown Band'}
                            </span>
                            <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-bold px-1.5 py-0.5 rounded">98% Match</span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            {isRealEstate ? '1200 Sq.Ft · ₹2.1 Cr · Owner Direct' : '22mm Italian Calfskin · ₹1,800 · In Stock'}
                          </p>
                          <div className="flex gap-1.5 mt-0.5">
                            <button className="bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[9px] cursor-default">Share via WA</button>
                            <button className="border border-slate-800 hover:bg-slate-900 text-slate-300 px-2 py-0.5 rounded text-[9px] cursor-default">View Details</button>
                          </div>
                        </div>
                        <div className="border border-indigo-500/20 bg-slate-900/30 p-2 rounded-lg flex flex-col gap-1.5 opacity-60">
                          <div className="flex justify-between items-start">
                            <span className="font-bold text-white text-[11px]">
                              {isRealEstate ? 'Sobha Clovelly 3BHK' : 'Vintage Leather Strap'}
                            </span>
                            <span className="bg-indigo-500/10 text-indigo-400 text-[8px] font-bold px-1.5 py-0.5 rounded">82% Match</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-medium">
                            {isRealEstate ? '2100 Sq.Ft · ₹2.7 Cr · Agent Referred' : '22mm Genuine Leather · ₹1,500 · Out of Stock'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="py-20 bg-slate-900/30 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Supercharge Your Inbound Inquiries
              </h2>
              <p className="mt-4 text-slate-400 text-sm sm:text-base font-medium">
                ConvoReal integrates directly with WhatsApp to capture customers, catalog inventory, and broadcast updates instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {MARKETING_CONFIG.features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-950 border border-slate-900 rounded-2xl p-6 hover:border-indigo-500/30 hover:scale-[1.02] transition-all flex flex-col gap-4"
                >
                  <div className="size-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 animate-pulse">
                    {renderIcon(feature.icon)}
                  </div>
                  <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Ingestion Demo Section */}
        <section id="demo" className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">Try it Live</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
                {MARKETING_CONFIG.demo.title}
              </h2>
              <p className="mt-4 text-slate-400 text-sm sm:text-base font-medium">
                {MARKETING_CONFIG.demo.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center max-w-5xl mx-auto">
              
              {/* Input: Messy Message */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative flex flex-col gap-4 h-[350px] shadow-lg">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Forwarded WhatsApp Chat Message</span>
                
                <div className="flex-1 bg-slate-950 rounded-xl border border-slate-850 p-4 font-mono text-xs text-slate-350 overflow-y-auto leading-relaxed select-none">
                  <p className="text-slate-500 mb-2">{"// Sample text copied from a WhatsApp chat thread:"}</p>
                  &ldquo;{MARKETING_CONFIG.demo.mockMessage}&rdquo;
                </div>

                {demoStep === 'idle' && (
                  <Button
                    onClick={handleSimulateParse}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bot className="size-4" />
                    Simulate AI Parse Ingestion
                  </Button>
                )}

                {demoStep === 'parsing' && (
                  <Button
                    disabled
                    className="w-full bg-slate-800 text-slate-400 font-bold py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <div className="size-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    Gemini chatbot engine parsing...
                  </Button>
                )}

                {demoStep === 'completed' && (
                  <Button
                    onClick={handleResetDemo}
                    className="w-full border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold py-3.5 rounded-xl transition-all cursor-pointer"
                  >
                    Reset & Try Again
                  </Button>
                )}
              </div>

              {/* Output: Structured Profile Card */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 relative flex flex-col gap-4 h-[350px] shadow-lg overflow-hidden">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CRM Ingestion Result</span>
                
                <div className="flex-1 flex items-center justify-center">
                  {demoStep === 'idle' && (
                    <div className="text-center p-6 text-slate-500">
                      <Bot className="size-12 mx-auto mb-2 text-slate-700 opacity-60 animate-pulse" />
                      <p className="text-xs font-medium">Click the button on the left to trigger the AI parser simulation.</p>
                    </div>
                  )}

                  {demoStep === 'parsing' && (
                    <div className="w-full space-y-4 px-4">
                      <div className="h-4 bg-slate-950/60 rounded-full w-2/3 animate-pulse" />
                      <div className="h-3 bg-slate-950/60 rounded-full w-1/2 animate-pulse" />
                      <div className="h-10 bg-slate-950/60 rounded-xl w-full animate-pulse" />
                      <div className="h-3 bg-slate-950/60 rounded-full w-3/4 animate-pulse" />
                    </div>
                  )}

                  {demoStep === 'completed' && (
                    <div className="w-full bg-slate-950 border border-slate-850 rounded-xl p-4 text-left space-y-3.5 animate-fade-in">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <div>
                          <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                            {MARKETING_CONFIG.demo.parsedCard.name}
                            <span className="size-2 rounded-full bg-emerald-500" />
                          </h4>
                          <span className="text-[10px] text-slate-400">{MARKETING_CONFIG.demo.parsedCard.contact}</span>
                        </div>
                        <span className="bg-indigo-500/10 text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded-full border border-indigo-500/20">
                          {MARKETING_CONFIG.demo.parsedCard.badge}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        {MARKETING_CONFIG.demo.parsedCard.fields.map((field, fidx) => (
                          <div key={fidx}>
                            <span className="text-slate-500 block font-bold uppercase tracking-wide">{field.label}</span>
                            <span className={`font-semibold ${field.isHighlight ? 'text-emerald-400 font-black' : 'text-slate-200'}`}>
                              {field.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border border-emerald-500/30 bg-emerald-950/15 p-2 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <UserCheck className="size-3.5" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-white block">Auto-Matched Listing</span>
                            <span className="text-[8px] text-slate-400">{MARKETING_CONFIG.demo.parsedCard.matchedItem.title}</span>
                          </div>
                        </div>
                        <span className="text-[8px] bg-emerald-400 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">
                          {MARKETING_CONFIG.demo.parsedCard.matchedItem.percentage}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Pricing Plan Cards */}
        <section id="pricing" className="py-20 bg-slate-900/30 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">Simple Pricing</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
                Plans Built for Every Scale
              </h2>
              <p className="mt-4 text-slate-400 text-sm sm:text-base font-medium">
                Choose the pricing plan that fits your business size. Start free, upgrade as you grow.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {MARKETING_CONFIG.pricing.map((plan, idx) => (
                <div 
                  key={idx} 
                  className={`bg-slate-950 rounded-2xl p-8 flex flex-col gap-6 relative shadow-lg ${
                    plan.isPopular ? 'border-2 border-indigo-600 shadow-2xl shadow-indigo-600/5' : 'border border-slate-900'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                      Most Popular
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-xs text-slate-400">/ {plan.period}</span>
                  </div>
                  <Button
                    onClick={() => window.location.href = plan.name === 'Enterprise' ? 'mailto:hello@convoreal.com' : '/signup'}
                    className={`w-full font-bold py-3.5 rounded-xl transition-all cursor-pointer ${
                      plan.isPopular 
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                        : 'border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
                  </Button>
                  <ul className="space-y-3.5 text-xs text-slate-350 border-t border-slate-900 pt-6">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex items-center gap-2">
                        <Check className="size-4 text-indigo-400 shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase text-indigo-400 tracking-wider">Got Questions?</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {MARKETING_CONFIG.faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/40 border border-slate-900 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-white hover:text-indigo-400 transition-colors text-sm sm:text-base cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`size-4 text-slate-400 shrink-0 transition-transform duration-255 ${faqOpen[idx] ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                <div 
                  className={`transition-all duration-255 overflow-hidden ${
                    faqOpen[idx] ? 'max-h-60 border-t border-slate-900/60' : 'max-h-0'
                  }`}
                >
                  <p className="px-5 py-4 text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-20 relative">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
              <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px]" />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[80px]" />
              
              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Supercharge Your Inbound Pipeline
                </h2>
                <p className="max-w-xl mx-auto text-slate-400 text-sm leading-relaxed font-medium">
                  Connect your WhatsApp business account and start importing contacts and listings within 5 minutes. No credit card required.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={() => window.location.href = '/signup'}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-8 py-5 rounded-xl hover:scale-102 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    Create Free Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/login'}
                    className="w-full sm:w-auto border-slate-850 bg-slate-950 hover:bg-slate-900 text-slate-200 text-xs font-semibold px-8 py-5 rounded-xl cursor-pointer"
                  >
                    Portal Login
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-indigo-600 flex items-center justify-center font-black text-white text-xs tracking-tighter">
              C
            </div>
            <span className="font-bold text-slate-350">ConvoReal</span>
          </div>
          <p className="font-medium">
            &copy; {new Date().getFullYear()} ConvoReal CRM (waCRM). All rights reserved.
          </p>
          <div className="flex items-center gap-6 font-semibold">
            <a href="/privacy" className="hover:text-slate-300">Privacy Policy</a>
            <a href="/terms" className="hover:text-slate-300">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
