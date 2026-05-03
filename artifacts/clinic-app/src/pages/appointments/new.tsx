import { useState } from "react";
import { useLocation, Link } from "wouter";
import {
  useCreateAppointment, useListPatients, getListAppointmentsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, CalendarPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { t } from "@/lib/i18n";

export default function NewAppointment() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"confirmed" | "pending" | "cancelled">("pending");
  const [notes, setNotes] = useState("");

  const { data: patientsData, isLoading: isPatientsLoading } = useListPatients({ limit: 100 });
  const patients = patientsData?.patients || [];

  const { mutate: createAppointment, isPending } = useCreateAppointment({
    mutation: {
      onSuccess: () => {
        toast.success(t.appointments.created);
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        setLocation("/appointments");
      },
      onError: () => toast.error(t.appointments.createFailed),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      toast.error(t.appointments.pickPatient);
      return;
    }
    createAppointment({
      data: {
        patientId: parseInt(patientId, 10),
        date, time, reason, status,
        notes: notes || undefined,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/appointments" className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground transition-colors">
          <ArrowRight size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-brand text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <CalendarPlus size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.appointments.new}</h1>
            <p className="text-muted-foreground text-sm">جدولة زيارة جديدة في عيادتك</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="patient" className="font-semibold">{t.appointments.patient}</Label>
              <Select value={patientId} onValueChange={setPatientId} disabled={isPatientsLoading}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder={t.appointments.selectPatient} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date" className="font-semibold">{t.appointments.date}</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time" className="font-semibold">{t.appointments.time}</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="h-11" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="font-semibold">{t.appointments.reason}</Label>
              <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)}
                required placeholder={t.appointments.reasonPlaceholder} className="h-11" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="font-semibold">{t.appointments.status}</Label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{t.appointments.statusPending}</SelectItem>
                  <SelectItem value="confirmed">{t.appointments.statusConfirmed}</SelectItem>
                  <SelectItem value="cancelled">{t.appointments.statusCancelled}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-semibold">{t.appointments.notes}</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder={t.appointments.notesPlaceholder} className="min-h-[100px]" />
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t">
              <Button type="button" variant="outline" onClick={() => setLocation("/appointments")}>
                {t.appointments.cancel}
              </Button>
              <Button type="submit" disabled={isPending}
                className="gradient-brand text-white border-0 shadow-lg shadow-primary/20 px-6 font-bold">
                {isPending ? t.appointments.creating : t.appointments.create}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
