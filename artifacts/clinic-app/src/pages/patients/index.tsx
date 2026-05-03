import { useState } from "react";
import { useListPatients, Patient } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Search, UserPlus, Mail, Phone, CalendarDays } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce"; // We need to create this hook or implement debouncing

export default function Patients() {
  const [search, setSearch] = useState("");
  
  // Custom simple debounce since we don't have useDebounce hook yet
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  // Effect to update debounced search
  useState(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useListPatients({ 
    search: debouncedSearch || undefined,
    limit: 50 
  });
  
  const patients = data?.patients || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Patients</h1>
          <p className="text-slate-500 mt-1">Manage patient records and histories.</p>
        </div>
        <Link href="/patients/new">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
            <UserPlus size={18} /> New Patient
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input 
              placeholder="Search patients by name, email, or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 h-12 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">Loading patients...</div>
      ) : patients.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center border border-dashed border-slate-300 rounded-xl bg-slate-50">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <UserPlus size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">No patients found</h3>
          <p className="text-slate-500 mb-4 max-w-sm text-center">
            {search ? "Try adjusting your search terms." : "Add your first patient to get started."}
          </p>
          {!search && (
            <Link href="/patients/new">
              <Button variant="outline">Add Patient</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient: Patient) => (
            <Link key={patient.id} href={`/patients/${patient.id}`}>
              <Card className="hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full border-slate-200 shadow-sm bg-white group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {patient.name}
                        </h3>
                        <p className="text-xs text-slate-500">{patient.age} years old</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate">{patient.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      <span>{patient.phone || "No phone"}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2 mt-2 border-t border-slate-100">
                      <CalendarDays size={14} className="text-slate-400" />
                      <span className="text-xs">
                        Last visit: {patient.lastVisitDate ? new Date(patient.lastVisitDate).toLocaleDateString() : "Never"}
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
