import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Award, 
  BookOpen, 
  Settings, 
  LogOut,
  Sword
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { data: profile } = useGetProfile({ query: { enabled: true } });

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Quests", icon: CheckSquare },
    { href: "/badges", label: "Badges", icon: Award },
    { href: "/subjects", label: "Subjects", icon: BookOpen },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-card border-r border-border flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/20 text-primary p-2 rounded-xl">
            <Sword className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-card-foreground">Study XP</h1>
            <p className="text-xs text-muted-foreground font-mono">Level up your learning</p>
          </div>
        </div>

        {profile && (
          <div className="px-6 pb-6 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src={profile.avatar || ""} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" data-testid="text-username">{profile.name}</p>
                <p className="text-xs text-muted-foreground">Lvl {profile.level} Scholar</p>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">XP</span>
                <span className="text-primary font-bold">{profile.xpForCurrentLevel - profile.xpToNextLevel} / {profile.xpForCurrentLevel}</span>
              </div>
              <Progress 
                value={Math.max(0, Math.min(100, ((profile.xpForCurrentLevel - profile.xpToNextLevel) / profile.xpForCurrentLevel) * 100))} 
                className="h-2 bg-muted"
                data-testid="progress-sidebar-xp"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                data-testid={`link-${item.label.toLowerCase()}`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-1">
          <Link 
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location === "/settings" 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            data-testid="link-settings"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-y-auto overflow-x-hidden p-6 md:p-8">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
