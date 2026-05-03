import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/layout/app-layout";
import NotFound from "@/pages/not-found";

import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments/index";
import NewAppointment from "@/pages/appointments/new";
import ViewAppointment from "@/pages/appointments/view";
import Patients from "@/pages/patients/index";
import NewPatient from "@/pages/patients/new";
import ViewPatient from "@/pages/patients/view";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: any }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;
  if (!user) return <Redirect to="/login" />;
  
  return <Component />;
}

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={() => <Redirect to="/dashboard" />} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
        
        <Route path="/appointments" component={() => <ProtectedRoute component={Appointments} />} />
        <Route path="/appointments/new" component={() => <ProtectedRoute component={NewAppointment} />} />
        <Route path="/appointments/:id" component={() => <ProtectedRoute component={ViewAppointment} />} />
        
        <Route path="/patients" component={() => <ProtectedRoute component={Patients} />} />
        <Route path="/patients/new" component={() => <ProtectedRoute component={NewPatient} />} />
        <Route path="/patients/:id" component={() => <ProtectedRoute component={ViewPatient} />} />
        
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
