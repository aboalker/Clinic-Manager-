import { useState } from "react";
import { useListAppointments, AppointmentWithPatient } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Link } from "wouter";
import { CalendarDays, Clock, User, Plus, CalendarHeart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { t, formatDateAr } from "@/lib/i18n";

const statusBadge = (s: string) => {
  switch (s) {
    case "confirmed": return { label: t.appointments.statusConfirmed, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    case "pending": return { label: t.appointments.statusPending, cls: "bg-amber-100 text-amber-700 border-amber-200" };
    case "cancelled": return { label: t.appointments.statusCancelled, cls: "bg-red-100 text-red-700 border-red-200" };
    default: return { label: s, cls: "bg-slate-100 text-slate-700 border-slate-200" };
  }
};

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Appointments() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const formattedDate = date ? toLocalDateStr(date) : undefined;
  const { data: appointments, isLoading } = useListAppointments({ date: formattedDate });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.appointments.title}</h1>
          <p className="text-muted-foreground mt-1">{t.appointments.subtitle}</p>
        </div>
        <Link href="/appointments/new">
          <Button className="gradient-brand hover:opacity-90 text-white border-0 shadow-lg shadow-primary/20 h-11 px-5 font-bold">
            <Plus size={18} className="ml-1" />
            {t.appointments.new}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CalendarDays size={18} />
                </div>
                <h3 className="font-bold">{t.appointments.calendar}</h3>
              </div>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-xl mx-auto"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-0 shadow-md h-full overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <CalendarHeart size={18} />
                </div>
                <h3 className="font-bold text-lg">
                  {date ? `${t.appointments.forDate} ${formatDateAr(date)}` : t.appointments.allAppointments}
                </h3>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">{t.appointments.loading}</div>
              ) : !appointments || appointments.length === 0 ? (
                <div className="text-center py-16 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <CalendarDays size={28} className="text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground">{t.appointments.empty}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.map((apt: AppointmentWithPatient) => {
                    const sb = statusBadge(apt.status);
                    return (
                      <Link key={apt.id} href={`/appointments/${apt.id}`} className="block">
                        <div className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-accent/30 transition-all group">
                          <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-2xl gradient-brand-soft text-primary border border-primary/20">
                            <Clock size={16} />
                            <span className="font-extrabold text-sm mt-1" dir="ltr">{apt.time}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold group-hover:text-primary transition-colors">{apt.patient.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                              <User size={13} /> {apt.reason}
                            </p>
                          </div>
                          <Badge variant="outline" className={`${sb.cls} font-semibold`}>
                            {sb.label}
                          </Badge>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
