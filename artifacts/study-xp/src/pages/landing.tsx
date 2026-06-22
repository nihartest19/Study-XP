import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Sword,
  Flame,
  Trophy,
  Star,
  CheckCircle,
  TrendingUp,
  Zap,
  BookOpen,
  Target,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Brain,
  Clock,
  BarChart3,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: Zap,
    title: "XP & Leveling System",
    description: "Every task completed earns XP. Watch your level climb as your knowledge grows.",
    color: "text-primary bg-primary/10",
  },
  {
    icon: Flame,
    title: "Daily Streaks",
    description: "Build momentum with streak tracking. Miss a day and your streak resets — stay consistent.",
    color: "text-orange-500 bg-orange-500/10",
  },
  {
    icon: Trophy,
    title: "Achievement Badges",
    description: "Unlock 13 unique badges across four categories: Streak, Tasks, XP, and Level milestones.",
    color: "text-secondary bg-secondary/10",
  },
  {
    icon: BookOpen,
    title: "Subject Organization",
    description: "Categorize quests by subject — Math, Physics, History, or anything you're studying.",
    color: "text-green-500 bg-green-500/10",
  },
  {
    icon: BarChart3,
    title: "Progress Dashboard",
    description: "See exactly how you're progressing across all subjects with visual charts and stats.",
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    icon: Target,
    title: "Priority Quests",
    description: "Mark tasks as low, medium, or high priority. High-priority quests reward more XP.",
    color: "text-red-500 bg-red-500/10",
  },
];

const problems = [
  { icon: Clock, text: "Hard to stay consistent without external motivation" },
  { icon: Brain, text: "No sense of progress when studying feels endless" },
  { icon: Sparkles, text: "Boring to-do lists that feel like chores" },
];

const reasons = [
  { stat: "3x", label: "more likely to study daily with a streak" },
  { stat: "13", label: "achievement badges to unlock" },
  { stat: "100+", label: "XP per high-priority task completed" },
  { stat: "Free", label: "always free, no hidden fees" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-primary/15 text-primary p-1.5 rounded-lg">
              <Sword className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Study XP</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" data-testid="link-nav-login">Sign In</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="font-bold gap-1.5" data-testid="button-nav-cta">
                Begin Adventure <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-semibold rounded-full hover:bg-primary/10" data-testid="badge-hero-tag">
              <Star className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Gamified Study Tracker
            </Badge>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05]"
          >
            Turn Studying Into{" "}
            <span className="text-primary relative inline-block">
              an Adventure
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-secondary/60" viewBox="0 0 300 12" fill="none">
                <path d="M2 10 Q75 2 150 10 Q225 18 298 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Study XP turns every homework task into a quest. Earn XP, level up, build streaks, and unlock badges — all by just doing the work.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-base font-bold gap-2 shadow-lg" data-testid="button-hero-cta">
                <Sword className="w-5 h-5" />
                Begin Your Adventure
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold gap-2" data-testid="button-hero-demo">
                <Sparkles className="w-5 h-5 text-primary" />
                Try Demo Mode
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Hero Preview Card */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="max-w-3xl mx-auto mt-16 relative"
        >
          <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Mock level banner */}
            <div className="bg-primary p-6 text-primary-foreground">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full border-4 border-primary-foreground/20 bg-primary-foreground/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl font-black">5</span>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg mb-1">Welcome back, Alex!</p>
                  <p className="text-primary-foreground/80 text-sm mb-3">850 more XP to reach Level 6.</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-primary-foreground/80">
                      <span>650 / 1500 XP</span>
                      <span>Level 6</span>
                    </div>
                    <div className="h-3 bg-primary-foreground/20 rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full" style={{ width: "43%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Mock stats */}
            <div className="grid grid-cols-4 divide-x divide-border border-b border-border">
              {[
                { label: "Streak", value: "7 Days", icon: Flame, color: "text-orange-500" },
                { label: "Today's XP", value: "+150", icon: Star, color: "text-secondary" },
                { label: "Tasks Done", value: "3", icon: Target, color: "text-green-500" },
                { label: "Badges", value: "6 / 13", icon: Trophy, color: "text-primary" },
              ].map((s) => (
                <div key={s.label} className="p-4 text-center">
                  <s.icon className={`w-5 h-5 mx-auto mb-1.5 ${s.color}`} />
                  <p className="font-bold text-base">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4 border-destructive/30 text-destructive bg-destructive/5">The Problem</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Studying Is Hard to Keep Up With
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Without a reward system, it's easy to procrastinate, lose track of progress, and fall behind.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {problems.map((p, i) => (
              <motion.div
                key={p.text}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="flex gap-4 items-start bg-card p-6 rounded-xl border border-border shadow-sm"
              >
                <div className="p-2.5 rounded-lg bg-destructive/10 text-destructive flex-shrink-0">
                  <p.icon className="w-5 h-5" />
                </div>
                <p className="text-muted-foreground font-medium leading-relaxed">{p.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5">The Solution</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Make Every Study Session{" "}
              <span className="text-primary">Count</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Study XP wraps your existing study habits in a game layer — no extra effort required. Just do the work and watch the rewards pile up.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Create a Quest", desc: "Add a study task with a title, subject, and priority level.", icon: Target },
              { step: "2", title: "Complete It", desc: "Check it off when done. XP is instantly added to your profile.", icon: CheckCircle },
              { step: "3", title: "Level Up", desc: "Watch your level, streak, and badge count grow over time.", icon: TrendingUp },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="relative bg-card rounded-xl border border-border p-6 shadow-sm text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-black text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <item.icon className="w-8 h-8 text-primary mx-auto mb-3 opacity-60" />
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary bg-primary/5">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Everything You Need to Stay Motivated
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Built specifically for students who want to study smarter, not just longer.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i % 3}
                className="bg-card rounded-xl border border-border p-6 shadow-sm hover:border-primary/30 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Students */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <Badge variant="outline" className="mb-4 border-secondary/40 text-secondary bg-secondary/5">Why It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Students Who Level Up, <span className="text-primary">Study More</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Gamification isn't just for gaming — it's a proven technique to increase motivation, consistency, and performance.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-14">
            {reasons.map((r, i) => (
              <motion.div
                key={r.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="text-center bg-card border border-border rounded-xl p-6 shadow-sm"
              >
                <p className="text-4xl font-black text-primary mb-1">{r.stat}</p>
                <p className="text-sm text-muted-foreground leading-snug">{r.label}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-5"
          >
            {[
              { icon: Award, title: "Instant Gratification", desc: "XP is awarded the moment you complete a task — no delay, no waiting. The dopamine hit is immediate." },
              { icon: Flame, title: "Streak Psychology", desc: "Streaks create loss aversion. Once you're on a 7-day streak, you'll do anything to keep it alive." },
              { icon: TrendingUp, title: "Visible Progress", desc: "Watching your level bar fill up makes abstract studying feel concrete and measurable." },
              { icon: Star, title: "Goal-Driven Studying", desc: "Badge goals give you something to aim for beyond just 'study more'. Each badge is a small victory." },
            ].map((item, i) => (
              <div key={item.title} className="flex gap-4 bg-card rounded-xl border border-border p-5 shadow-sm">
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary flex-shrink-0 h-fit">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -ml-48 -mt-48" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -mr-48 -mb-48" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Sword className="w-12 h-12 mx-auto mb-6 opacity-80" />
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
              Your First Quest Awaits
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">
              Join students who are turning boring study sessions into leveling-up adventures. Free forever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 border-secondary-border gap-2"
                  data-testid="button-final-cta"
                >
                  Begin Your Adventure <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="bg-primary/15 text-primary p-1 rounded">
              <Sword className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-foreground">Study XP</span>
            <span>— Turn your study sessions into quests.</span>
          </div>
          <Link href="/login">
            <Button variant="link" size="sm" className="text-muted-foreground h-auto p-0">Sign in to get started</Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}
