import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { setGuestIdGetter } from "@workspace/api-client-react";
import { useEffect } from "react";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Badges from "@/pages/badges";
import Subjects from "@/pages/subjects";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Wire up the guest ID getter once at module level so every API request
// automatically includes the X-Guest-Id header from localStorage.
setGuestIdGetter(() => localStorage.getItem("study_xp_guest_id"));

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function HomeRoute() {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) {
    return (
      <Layout>
        <Dashboard />
      </Layout>
    );
  }
  return <Landing />;
}

function Routes() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/login" component={Login} />
      <Route path="/tasks" component={() => <ProtectedRoute component={Tasks} />} />
      <Route path="/badges" component={() => <ProtectedRoute component={Badges} />} />
      <Route path="/subjects" component={() => <ProtectedRoute component={Subjects} />} />
      <Route path="/settings" component={() => <ProtectedRoute component={Settings} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Routes />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
