import {
  useGetDashboardSummary,
  useGetUpcomingAppointments,
  useGetRecentPatients,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import {
  Users, CalendarDays, CheckCircle2, Clock, ArrowLeft,
  TrendingUp, UserPlus, Stethoscope, Sparkles
} from "lucide-react";
import { Link } from "wouter";
import { t, formatDateShortAr, monthShortAr } from "@/lib/i18n";

function greetingForNow() {
  const h = new Date().getHours();
  if (h < 12) return t.dashboard.greetingMorning;
  if (h < 18) return t.dashboard.greetingAfternoon;
  return t.dashboard.greetingEvening;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: l1 } = useGetDashboardSummary();
  const { data: upcoming, isLoading: l2 } = useGetUpcomingAppointments({ limit: 5 });
  const { data: recent, isLoading: l3 } = useGetRecentPatients({ limit: 5 });

  if (l1 || l2 || l3) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: t.dashboard.todayAppointments, value: summary?.todayAppointmentsCount || 0, icon: CalendarDays, color: "from-teal-500 to-cyan-500", iconBg: "bg-teal-500/15", iconColor: "text-teal-600" },
    { label: t.dashboard.patientsSeen, value: summary?.patientsSeen || 0, icon: Users, color: "from-emerald-500 to-teal-500", iconBg: "bg-emerald-500/15", iconColor: "text-emerald-600" },
    { label: t.dashboard.confirmed, value: summary?.confirmedCount || 0, icon: CheckCircle2, color: "from-cyan-500 to-blue-500", iconBg: "bg-cyan-500/15", iconColor: "text-cyan-600" },
    { label: t.dashboard.pending, value: summary?.pendingCount || 0, icon: Clock, color: "from-amber-500 to-orange-500", iconBg: "bg-amber-500/15", iconColor: "text-amber-600" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero greeting */}
      <div className="relative overflow-hidden rounded-3xl gradient-brand text-white p-8 md:p-10 shadow-xl shadow-primary/20">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
              <Sparkles size={16} />
              <span>{user?.clinicName}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {greetingForNow()}، {user?.name}
            </h1>
            <p className="text-white/85 mt-2 text-lg">{t.dashboard.todaySummary}</p>
          </div>
          <div className="hidden md:flex w-20 h-20 rounded-3xl bg-white/15 backdrop-blur items-center justify-center">
            <Stethoscope size={36} />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 shadow-md overflow-hidden relative group hover:shadow-xl transition-shadow">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${s.color}`} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl ${s.iconBg} ${s.iconColor} flex items-center justify-center`}>
                    <Icon size={22} />
                  </div>
                  <TrendingUp size={16} className="text-muted-foreground/50" />
                </div>
                <div className="text-3xl font-extrabold tracking-tight">{s.value}</div>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CalendarDays size={20} />
                </div>
                <h2 className="text-lg font-bold">{t.dashboard.upcomingTitle}</h2>
              </div>
              <Link href="/appointments" className="text-sm text-primary hover:underline font-semibold flex items-center gap-1">
                {t.dashboard.viewAll}
                <ArrowLeft size={14} />
              </Link>
            </div>
            <div className="space-y-2">
              {!upcoming || upcoming.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <CalendarDays size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{t.dashboard.noUpcoming}</p>
                </div>
              ) : (
                upcoming.map((apt) => (
                  <Link
                    key={apt.id}
                    href={`/appointments/${apt.id}`}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary flex flex-col items-center justify-center">
                      <span className="text-xs font-semibold">{monthShortAr(apt.date)}</span>
                      <span className="text-lg font-extrabold leading-none">{new Date(apt.date).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate group-hover:text-primary transition-colors">{apt.patient.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{apt.reason}</p>
                    </div>
                    <div className="text-left text-sm font-bold text-primary" dir="ltr">{apt.time}</div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent patients */}
        <Card className="border-0 shadow-md overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <UserPlus size={20} />
                </div>
                <h2 className="text-lg font-bold">{t.dashboard.recentTitle}</h2>
              </div>
              <Link href="/patients" className="text-sm text-primary hover:underline font-semibold flex items-center gap-1">
                {t.dashboard.viewAll}
                <ArrowLeft size={14} />
              </Link>
            </div>
            <div className="space-y-2">
              {!recent || recent.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">{t.dashboard.noRecent}</p>
                </div>
              ) : (
                recent.map((p) => (
                  <Link
                    key={p.id}
                    href={`/patients/${p.id}`}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-brand text-white flex items-center justify-center font-bold">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate group-hover:text-primary transition-colors">{p.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {p.email || p.phone || t.dashboard.noContact}
                      </p>
                    </div>
                    <div className="text-left text-xs text-muted-foreground">
                      <p className="font-semibold">{p.age} {t.dashboard.yearsOld}</p>
                      <p className="mt-0.5">
                        {p.lastVisitDate ? formatDateShortAr(p.lastVisitDate) : t.dashboard.newPatient}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
