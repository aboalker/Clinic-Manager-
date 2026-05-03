import { useGetDashboardSummary, useGetUpcomingAppointments, useGetRecentPatients } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { Users, Calendar as CalendarIcon, CheckCircle2, Clock } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: summary, isLoading: isSummaryLoading } = useGetDashboardSummary();
  const { data: upcoming, isLoading: isUpcomingLoading } = useGetUpcomingAppointments({ limit: 5 });
  const { data: recent, isLoading: isRecentLoading } = useGetRecentPatients({ limit: 5 });

  if (isSummaryLoading || isUpcomingLoading || isRecentLoading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Good morning, Dr. {user?.name?.split(' ')[1] || 'Smith'}</h1>
        <p className="text-slate-500 mt-1">Here is your schedule for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Today's Appointments</CardTitle>
            <CalendarIcon className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary?.todayAppointmentsCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Patients Seen</CardTitle>
            <Users className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary?.patientsSeen || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Confirmed</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary?.confirmedCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Pending</CardTitle>
            <Clock className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary?.pendingCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">Upcoming Appointments</CardTitle>
            <Link href="/appointments" className="text-sm text-blue-500 hover:text-blue-600 font-medium">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcoming?.length === 0 ? (
                <p className="text-slate-500 text-sm">No upcoming appointments.</p>
              ) : (
                upcoming?.map((apt) => (
                  <Link key={apt.id} href={`/appointments/${apt.id}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900">{apt.patient.name}</p>
                      <p className="text-sm text-slate-500">{apt.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">{apt.time}</p>
                      <p className="text-sm text-slate-500">{new Date(apt.date).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold text-slate-900">Recent Patients</CardTitle>
            <Link href="/patients" className="text-sm text-blue-500 hover:text-blue-600 font-medium">View all</Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recent?.length === 0 ? (
                <p className="text-slate-500 text-sm">No recent patients.</p>
              ) : (
                recent?.map((patient) => (
                  <Link key={patient.id} href={`/patients/${patient.id}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-900">{patient.name}</p>
                      <p className="text-sm text-slate-500">{patient.email || patient.phone || 'No contact info'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">Age: {patient.age}</p>
                      <p className="text-xs text-slate-500">
                        {patient.lastVisitDate ? `Last visit: ${new Date(patient.lastVisitDate).toLocaleDateString()}` : 'New patient'}
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
