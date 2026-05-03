import { useEffect, useState } from "react";
import { useListPatients, Patient } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, UserPlus, Mail, Phone, CalendarDays } from "lucide-react";
import { t, formatDateShortAr } from "@/lib/i18n";

export default function Patients() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useListPatients({
    search: debouncedSearch || undefined,
    limit: 50,
  });
  const patients = data?.patients || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{t.patients.title}</h1>
          <p className="text-muted-foreground mt-1">{t.patients.subtitle}</p>
        </div>
        <Link href="/patients/new">
          <Button className="gradient-brand hover:opacity-90 text-white border-0 shadow-lg shadow-primary/20 h-11 px-5 font-bold gap-1.5">
            <UserPlus size={18} />
            {t.patients.new}
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder={t.patients.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-12 h-14 text-base rounded-2xl border-0 shadow-md bg-card"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">{t.patients.loading}</div>
      ) : patients.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="text-center py-16 flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl gradient-brand-soft text-primary flex items-center justify-center mb-4">
              <UserPlus size={32} />
            </div>
            <h3 className="text-lg font-bold mb-1">{t.patients.emptyTitle}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {search ? t.patients.emptySearch : t.patients.emptyHint}
            </p>
            {!search && (
              <Link href="/patients/new">
                <Button className="gradient-brand text-white border-0 shadow-lg shadow-primary/20 px-5 font-bold">
                  {t.patients.addPatient}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((p: Patient) => (
            <Link key={p.id} href={`/patients/${p.id}`}>
              <Card className="border-0 shadow-md hover:shadow-xl transition-all cursor-pointer h-full overflow-hidden group">
                <div className="h-2 gradient-brand" />
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-14 h-14 rounded-2xl gradient-brand text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-primary/20">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold group-hover:text-primary transition-colors truncate">{p.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.age} {t.patients.yearsOld}</p>
                      {p.bloodType && (
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-xs font-bold rounded-md bg-red-50 text-red-600 border border-red-100" dir="ltr">
                          {p.bloodType}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="opacity-60" />
                      <span className="truncate" dir={p.email ? "ltr" : "rtl"}>{p.email || t.patients.noEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="opacity-60" />
                      <span dir={p.phone ? "ltr" : "rtl"}>{p.phone || t.patients.noPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <CalendarDays size={14} className="opacity-60" />
                      <span className="text-xs">
                        {t.patients.lastVisit}: {p.lastVisitDate ? formatDateShortAr(p.lastVisitDate) : t.patients.never}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
