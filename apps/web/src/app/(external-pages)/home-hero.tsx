'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bot, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function HomeHero() {
  return (
    <section className="relative overflow-hidden w-full bg-background pt-24 pb-32">
      {/* Background Gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-background to-background" />
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6">
        <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-violet-500 to-indigo-500 opacity-20" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>

      <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="secondary" className="px-4 py-1.5 rounded-full border-primary/20 bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            V1.5 Now Live
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-6"
        >
          Stop reading job descriptions. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-indigo-500">
            Let AI find your 10/10 match.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mb-10"
        >
          Save hundreds of hours by letting our AI engine search, read, and score jobs based on your exact custom rules and CV.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full">
            <Link href="/sign-up">
              Start Your AI Search <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full">
            <Link href="#how-it-works">
              See How It Works
            </Link>
          </Button>
        </motion.div>

        {/* UI Mockup Animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="w-full max-w-5xl mt-20 relative"
        >
          <div className="rounded-xl border bg-card/80 backdrop-blur-sm shadow-2xl p-2 relative overflow-hidden ring-1 ring-white/10">
            {/* Window Controls */}
            <div className="flex items-center gap-1.5 p-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="mx-auto text-xs text-muted-foreground flex items-center gap-1">
                <Bot className="w-3 h-3" /> AI Job Scanner Running...
              </div>
            </div>
            
            {/* Fake Table */}
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground pb-2 border-b">
                <div className="col-span-4">JOB TITLE</div>
                <div className="col-span-2">LOCATION</div>
                <div className="col-span-4">AI REASONING</div>
                <div className="col-span-2 text-right">MATCH SCORE</div>
              </div>

              {[
                { title: 'Senior React Developer', company: 'TechCorp', loc: 'Remote', score: 10, delay: 0.8 },
                { title: 'Frontend Engineer', company: 'StartupX', loc: 'New York', score: 9, delay: 1.2 },
                { title: 'Fullstack Dev (Next.js)', company: 'Innovate', loc: 'Remote', score: 8, delay: 1.6 },
              ].map((row, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: row.delay }}
                  className="grid grid-cols-12 gap-4 items-center p-3 rounded-lg bg-muted/30 border border-white/5"
                >
                  <div className="col-span-4">
                    <div className="font-semibold text-sm">{row.title}</div>
                    <div className="text-xs text-muted-foreground">{row.company}</div>
                  </div>
                  <div className="col-span-2 text-sm">{row.loc}</div>
                  <div className="col-span-4 text-xs text-muted-foreground line-clamp-2">
                    <CheckCircle2 className="inline w-3 h-3 text-emerald-500 mr-1" />
                    Matches your "+5 points for Remote Next.js" rule.
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
                      row.score >= 9 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 ring-emerald-500/20' : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-400 ring-blue-500/20'
                    }`}>
                      {row.score}/10
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Scanning Overlay Effect */}
            <motion.div
              animate={{
                top: ['-10%', '110%'],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute left-0 right-0 h-[2px] bg-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
