import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  LogOut, 
  Plus,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logoutClient } = useAuth();
  const [location] = useLocation();
  const { mutate: logout } = useLogout({
    mutation: {
      onSuccess: () => {
        logoutClient();
      }
    }
  });

  if (!user) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/appointments", label: "Appointments", icon: Calendar },
    { href: "/patients", label: "Patients", icon: Users },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white p-4">
      <div className="mb-8 px-2 flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center font-bold">C</div>
        <h1 className="text-xl font-bold tracking-tight">ClinicOS</h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-blue-500 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-800">
        <div className="mb-4 px-3 text-sm text-slate-400">
          Dr. {user.name}
        </div>
        <button 
          onClick={() => logout()} 
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center font-bold">C</div>
            <h1 className="text-xl font-bold">ClinicOS</h1>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-slate-900 border-none w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link href="/appointments/new">
          <Button size="icon" className="w-14 h-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600">
            <Plus size={24} className="text-white" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
