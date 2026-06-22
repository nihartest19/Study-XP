import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Sword, Sparkles, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8 text-center bg-muted/30 border-b border-border">
            <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
              <Sword className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Study XP</h1>
            <p className="text-muted-foreground font-medium">Turn your study sessions into quests.</p>
          </div>
          
          <div className="p-8 space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Adventurer Name</Label>
                <Input 
                  id="username" 
                  placeholder="Enter your hero name" 
                  className="bg-background"
                  data-testid="input-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Secret Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  className="bg-background"
                  data-testid="input-password"
                />
              </div>
              <Button type="submit" className="w-full font-bold text-md h-12" data-testid="button-login">
                Begin Adventure
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-mono">Or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={login}
              className="w-full h-12 border-primary/20 hover:bg-primary/5 text-primary gap-2"
              data-testid="button-demo"
            >
              <Sparkles className="w-4 h-4" />
              Play Demo Mode
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
