import { useGetBadges } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Award, Lock, Flame, Star, Target, BookOpen, Crown } from "lucide-react";
import { motion } from "framer-motion";

const iconMap: Record<string, any> = {
  streak: Flame,
  tasks: Target,
  xp: Star,
  level: Crown,
  subject: BookOpen,
};

export default function Badges() {
  const { data: badges, isLoading } = useGetBadges();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const earnedCount = badges?.filter(b => b.earned).length || 0;
  const totalCount = badges?.length || 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-card p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Award className="w-8 h-8 text-secondary" />
            Badge Collection
          </h1>
          <p className="text-muted-foreground mt-1">Unlock achievements by completing quests and leveling up.</p>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-border">
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completion</p>
            <p className="font-bold text-lg leading-none">{earnedCount} <span className="text-muted-foreground font-normal">/ {totalCount}</span></p>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-primary" strokeDasharray="289" strokeDashoffset={289 - (289 * earnedCount) / (totalCount || 1)} strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges?.map((badge, i) => {
          const IconComponent = iconMap[badge.category] || Award;
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`h-full border-2 transition-all duration-300 ${
                badge.earned 
                  ? 'border-primary/20 bg-card hover:border-primary/50 shadow-sm' 
                  : 'border-border bg-muted/30 opacity-70 grayscale hover:grayscale-0'
              }`}>
                <CardContent className="p-6 text-center flex flex-col items-center justify-center h-full gap-3 relative">
                  {!badge.earned && (
                    <div className="absolute top-3 right-3 text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    badge.earned ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className={`font-bold leading-tight mb-1 ${badge.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {badge.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {badge.description}
                    </p>
                  </div>
                  
                  {badge.earned && badge.earnedAt && (
                    <BadgeUI variant="outline" className="mt-2 text-[10px] uppercase font-mono bg-background">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </BadgeUI>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
