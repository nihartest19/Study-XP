import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { Sword, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const { login, loginWithCredentials } = useAuth();

  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Pressing Enter in the username field moves focus to password — never submits
  const handleUsernameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    const trimmedPassword = password;

    if (!trimmedUsername) {
      setError("Please enter your adventurer name.");
      usernameRef.current?.focus();
      return;
    }
    if (trimmedPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      passwordRef.current?.focus();
      return;
    }

    setError(null);
    setIsLoading(true);

    const result = await loginWithCredentials(trimmedUsername, trimmedPassword);

    setIsLoading(false);
    if (result.error) {
      setError(result.error);
      // Wrong password — clear password field and refocus it
      setPassword("");
      passwordRef.current?.focus();
    }
  };

  const handleDemoMode = () => {
    setError(null);
    login();
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center bg-muted/30 border-b border-border">
            <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
              <Sword className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Study XP</h1>
            <p className="text-muted-foreground font-medium">
              Sign in to continue your adventure, or create a new account.
            </p>
          </div>

          <div className="p-8 space-y-5">
            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="username">Adventurer Name</Label>
                <Input
                  ref={usernameRef}
                  id="username"
                  name="username"
                  autoComplete="username"
                  placeholder="Enter your hero name"
                  className="bg-background"
                  data-testid="input-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleUsernameKeyDown}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Secret Password</Label>
                <Input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Min. 4 characters"
                  className="bg-background"
                  data-testid="input-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  New here? Just pick a name and password — your account is created automatically.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full font-bold text-md h-12"
                data-testid="button-login"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Begin Adventure"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-mono">Or</span>
              </div>
            </div>

            {/* Demo mode — completely separate from the form, no submit possible */}
            <Button
              type="button"
              variant="outline"
              onClick={handleDemoMode}
              className="w-full h-12 border-primary/20 hover:bg-primary/5 text-primary gap-2"
              data-testid="button-demo"
              disabled={isLoading}
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
