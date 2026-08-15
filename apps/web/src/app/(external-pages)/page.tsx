'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Bot, Target, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  return (
    <div ref={containerRef} className="min-h-[200vh] bg-zinc-950 text-zinc-50 relative selection:bg-indigo-500/30">
      
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-900/20 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Hero Section */}
      <motion.div 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="sticky top-0 h-screen flex flex-col items-center justify-center px-6 overflow-hidden z-10"
      >
        <div className="max-w-4xl mx-auto text-center space-y-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-6">
              <SparklesIcon className="w-4 h-4" />
              The Future of Job Hunting
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/40 leading-tight">
              Don't search.<br/>Let the AI match.
            </h1>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Looking for specific things? Wasting time reading endless jobs? Save your time. Set up specific rules, calibrate the AI, and match with hundreds of jobs instantly.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all">
              <Link href="/sign-up">
                Start Matching Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-zinc-800 bg-transparent hover:bg-white/5 text-zinc-300">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Feature Showcases */}
      <div className="relative z-20 bg-zinc-950/80 backdrop-blur-3xl border-t border-white/5">
        
        {/* Showcase 1: The Rule Slider */}
        <section className="py-32 px-6 overflow-hidden">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-8 border border-violet-500/30">
                <Target className="w-6 h-6 text-violet-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Granular Control.<br/><span className="text-violet-400">Absolute Precision.</span></h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Define exactly what matters to you. Use our intuitive sliders to weight your preferences. Give Next.js experience a +5, and penalize legacy stacks with a -5. The AI perfectly understands your calibration.
              </p>
            </motion.div>

            {/* Mockup 1 */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotateX: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, type: "spring", bounce: 0.4 }}
              className="relative perspective-1000"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 to-transparent blur-3xl -z-10 rounded-[3rem]" />
              <div className="bg-zinc-900/80 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl space-y-8">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h3 className="font-medium text-zinc-200">Scoring Rules</h3>
                  <span className="text-xs font-mono text-zinc-500">Auto-saving...</span>
                </div>
                
                {/* Simulated Slider 1 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-200">Next.js & React</span>
                    <span className="text-sm font-bold text-emerald-400">+5</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: "50%" }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                      className="absolute left-1/2 top-0 bottom-0 bg-emerald-500" 
                    />
                  </div>
                </div>

                {/* Simulated Slider 2 */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-200">Legacy Codebases</span>
                    <span className="text-sm font-bold text-red-400">-4</span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden relative">
                    <motion.div 
                      initial={{ width: "50%" }}
                      whileInView={{ width: "10%", left: "10%" }}
                      transition={{ duration: 1.5, delay: 0.7, ease: "easeOut" }}
                      className="absolute right-1/2 top-0 bottom-0 bg-red-500" 
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-2">
                   <div className="h-8 w-24 bg-white/5 rounded-full" />
                   <div className="h-8 w-32 bg-white/5 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Showcase 2: AI Job Card */}
        <section className="py-32 px-6 overflow-hidden bg-zinc-950/50">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Mockup 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, type: "spring", bounce: 0.4 }}
              className="order-2 lg:order-1 relative perspective-1000"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent blur-3xl -z-10 rounded-[3rem]" />
              <div className="bg-[#0a0a0a] border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl shadow-indigo-900/20 relative group">
                <div className="absolute -top-4 -right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-md flex items-center gap-2">
                  <Zap className="w-4 h-4" /> 10/10 AI Match
                </div>
                
                <h3 className="text-2xl font-bold text-zinc-100 mb-2">Senior Frontend Engineer</h3>
                <p className="text-zinc-400 mb-6">Acme Corp • Remote • $140k - $180k</p>
                
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    <span className="font-semibold text-zinc-200">AI Reasoning Snippet</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed italic">
                    "Strong match for Next.js and React (+5). Requires heavy UI/UX focus which aligns with your profile (+3). 'No remote work' penalty bypassed because this role is fully Remote (+2)."
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-300">Next.js</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-300">TypeScript</span>
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-zinc-300">Tailwind</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="order-1 lg:order-2 space-y-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-8 border border-indigo-500/30">
                <Bot className="w-6 h-6 text-indigo-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Instant Context.<br/><span className="text-indigo-400">Zero Guesswork.</span></h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Stop reading every job description to figure out if it's a fit. Our AI reads the entire post, evaluates it against your rules, and gives you a score out of 10 with a personalized reasoning snippet.
              </p>
              
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Extracts tech stack automatically
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Evaluates cultural & benefit fit
                </li>
                <li className="flex items-center gap-3 text-zinc-300">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Filters out ghost jobs & spam
                </li>
              </ul>
            </motion.div>

          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center space-y-8"
          >
            <h2 className="text-5xl font-bold tracking-tight">Ready to let AI find your next job?</h2>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Join thousands of developers who are automating their job search and landing better roles, faster.
            </p>
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-zinc-200 transition-all mt-8">
              <Link href="/sign-up">
                Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </section>

      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
