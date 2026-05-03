import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  LogOut,
  Plus,
  Menu,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { t } from "@/lib/i18n";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logoutClient } = useAuth();
  const [location] = useLocation();
  const { mutate: logout } = useLogout({
    mutation: { onSuccess: () => logoutClient() },
  });

  if (!user) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard },
    { href: "/appointments", label: t.nav.appointments, icon: CalendarDays },
    { href: "/patients", label: t.nav.patients, icon: Users },
  ];

  const initials = (user.name || "د").trim().charAt(0);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground p-5">
      <div className="mb-10 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-lg">
          <Stethoscope size={22} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">{t.appName}</h1>
          <p className="text-xs text-sidebar-foreground/60">{t.tagline}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? "gradient-brand text-white shadow-lg shadow-primary/20"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-5 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-10 h-10 rounded-full gradient-brand text-white flex items-center justify-center font-bold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.clinicName}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors text-sm font-medium"
        >
          <LogOut size={18} />
          <span>{t.nav.logout}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar — on the right in RTL */}
      <div className="hidden md:block w-72 fixed inset-y-0 right-0 z-50">
        <SidebarContent />
      </div>

      <div className="flex-1 md:pr-72 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-sidebar text-sidebar-foreground p-4 flex items-center justify-between sticky top-0 z-40 shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center text-white">
              <Stethoscope size={18} />
            </div>
            <h1 className="text-lg font-extrabold">{t.appName}</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent">
                <Menu size={22} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 bg-sidebar border-none w-72">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10">{children}</main>
      </div>

      {/* Floating Action Button — bottom-left in RTL */}
      <div className="fixed bottom-8 left-8 z-40">
        <Link href="/appointments/new">
          <Button
            size="icon"
            className="w-14 h-14 rounded-2xl shadow-2xl shadow-primary/30 gradient-brand hover:opacity-90 text-white border-0"
            title={t.nav.quickAdd}
          >
            <Plus size={26} strokeWidth={2.5} />
          </Button>
        </Link>
      </div>
    </div>
  );
}
