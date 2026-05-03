import { useState } from "react";
import { useListAppointments, AppointmentWithPatient } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Link } from "wouter";
import { Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Appointments() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const formattedDate = date ? date.toISOString().split('T')[0] : undefined;

  const { data: appointments, isLoading } = useListAppointments({ date: formattedDate });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case 'pending': return "bg-amber-100 text-amber-800 border-amber-200";
      case 'cancelled': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Appointments</h1>
          <p className="text-slate-500 mt-1">Manage your schedule and daily visits.</p>
        </div>
        <Link href="/appointments/new" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors">
          New Appointment
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border border-slate-100 mx-auto"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">
                {date ? `Appointments for ${date.toLocaleDateString()}` : "All Appointments"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-slate-500 text-center py-8">Loading schedule...</div>
              ) : appointments?.length === 0 ? (
                <div className="text-slate-500 text-center py-12 flex flex-col items-center">
                  <CalendarIcon size={48} className="text-slate-300 mb-4" />
                  <p>No appointments scheduled for this date.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments?.map((apt: AppointmentWithPatient) => (
                    <Link key={apt.id} href={`/appointments/${apt.id}`} className="block">
                      <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all shadow-sm hover:shadow">
                        <div className="flex items-start gap-4">
                          <div className="bg-slate-100 p-3 rounded-full text-blue-500">
                            <Clock size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{apt.time} - {apt.patient.name}</h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                              <User size={14} /> {apt.reason}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <Badge variant="outline" className={`${getStatusColor(apt.status)}`}>
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
