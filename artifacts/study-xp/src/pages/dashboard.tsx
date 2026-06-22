import { useGetProfile, useGetStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Flame, Trophy, Target, Star, Activity, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useGetProfile();
  const { data: stats, isLoading: statsLoading } = useGetStats();

  if (profileLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-[300px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!profile || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center p-12">
        <Trophy className="w-16 h-16 text-muted-foreground opacity-40" />
        <h2 className="text-xl font-bold text-muted-foreground">Unable to load your dashboard</h2>
        <p className="text-sm text-muted-foreground max-w-xs">The server may still be starting up. Try refreshing the page in a moment.</p>
      </div>
    );
  }

  const xpEarned = Math.max(0, profile.xpForCurrentLevel - profile.xpToNextLevel);
  const xpProgress = profile.xpForCurrentLevel > 0
    ? Math.max(0, Math.min(100, (xpEarned / profile.xpForCurrentLevel) * 100))
    : 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Level Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground border border-primary-border shadow-lg p-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 flex items-center justify-center w-32 h-32 rounded-full border-4 border-primary-foreground/20 bg-primary-foreground/10 relative">
            <span className="text-5xl font-black">{profile.level}</span>
            <div className="absolute -bottom-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 border border-secondary-border">
              <Star className="w-3 h-3 fill-current" />
              Level
            </div>
          </div>
          
          <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Welcome back, {profile.name}!</h2>
            <p className="text-primary-foreground/80 mb-6 max-w-lg">Keep up the momentum. You need {profile.xpToNextLevel} more XP to reach level {profile.level + 1}.</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-medium font-mono text-primary-foreground/90">
                <span>{xpEarned} / {profile.xpForCurrentLevel} XP</span>
                <span>{profile.xpToNextLevel} XP to Level {profile.level + 1}</span>
              </div>
              <Progress value={xpProgress} className="h-4 bg-primary-foreground/20 border border-primary-foreground/10" data-testid="progress-hero-xp" />
            </div>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            <Link href="/tasks">
              <Button size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold border border-secondary-border h-14" data-testid="button-new-quest">
                <Plus className="w-5 h-5 mr-2" />
                New Quest
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Current Streak", value: `${stats.currentStreak} Days`, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Today's XP", value: `+${stats.xpEarnedToday}`, icon: Star, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Tasks Done (Today)", value: stats.tasksCompletedToday, icon: Target, color: "text-green-500", bg: "bg-green-500/10" },
          { label: "Total Tasks", value: stats.totalTasksCompleted, icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover-elevate">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight" data-testid={`stat-${stat.label.toLowerCase().replace(/[^a-z]/g, '')}`}>{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <Card className="lg:col-span-1 border-border shadow-sm flex flex-col">
          <CardHeader className="border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <CardTitle>Recent Quests</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {stats.recentActivity.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No activity yet. Time to start a quest!
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {stats.recentActivity.map((activity, i) => (
                  <motion.li 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1 mr-4">
                      <p className="text-sm font-semibold truncate text-foreground">{activity.taskTitle}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{new Date(activity.completedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex-shrink-0 text-sm font-bold text-secondary bg-secondary/10 px-2.5 py-1 rounded-md border border-secondary/20">
                      +{activity.xpAwarded} XP
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="border-b border-border bg-muted/30">
            <CardTitle>Subject Mastery</CardTitle>
            <CardDescription>Tasks completed per subject</CardDescription>
          </CardHeader>
          <CardContent className="p-6 h-[300px]">
            {stats.tasksPerSubject.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                No subject data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.tasksPerSubject} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="subjectName" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                    axisLine={false} 
                    tickLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                    {stats.tasksPerSubject.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
