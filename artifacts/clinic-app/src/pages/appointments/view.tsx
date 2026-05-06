import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  useGetAppointment, useUpdateAppointment, useDeleteAppointment,
  getGetAppointmentQueryKey, getListAppointmentsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, Trash2, CalendarDays, Clock, User, FileText, Pencil, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { t, formatDateAr } from "@/lib/i18n";

const statusBadge = (s: string) => {
  switch (s) {
    case "confirmed": return { label: t.appointments.statusConfirmed, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    case "pending":   return { label: t.appointments.statusPending,   cls: "bg-amber-100 text-amber-700 border-amber-200" };
    case "cancelled": return { label: t.appointments.statusCancelled, cls: "bg-red-100 text-red-700 border-red-200" };
    default: return { label: s, cls: "bg-slate-100 text-slate-700 border-slate-200" };
  }
};

function toInputDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  if (d instanceof Date) return d.toISOString().split("T")[0];
  const s = String(d);
  return s.length > 10 ? s.split("T")[0] : s;
}

export default function ViewAppointment() {
  const { id } = useParams();
  const appointmentId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"confirmed" | "pending" | "cancelled">("pending");
  const [notes, setNotes] = useState("");

  const { data: appointment, isLoading } = useGetAppointment(appointmentId, {
    query: { enabled: !!appointmentId, queryKey: getGetAppointmentQueryKey(appointmentId) },
  });

  useEffect(() => {
    if (appointment) {
      setDate(toInputDate(appointment.date));
      setTime(appointment.time);
      setReason(appointment.reason);
      setStatus(appointment.status);
      setNotes(appointment.notes || "");
    }
  }, [appointment]);

  const { mutate: updateAppointment, isPending: isUpdating } = useUpdateAppointment({
    mutation: {
      onSuccess: (data) => {
        toast.success(t.appointments.updated);
        queryClient.setQueryData(getGetAppointmentQueryKey(appointmentId), data);
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        setIsEditing(false);
      },
      onError: () => toast.error(t.appointments.updateFailed),
    },
  });

  const { mutate: deleteAppointment, isPending: isDeleting } = useDeleteAppointment({
    mutation: {
      onSuccess: () => {
        toast.success(t.appointments.deleted);
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        setLocation("/appointments");
      },
      onError: () => toast.error(t.appointments.deleteFailed),
    },
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t.appointments.loadingDetails}</div>;
  if (!appointment) return <div className="p-8 text-center text-muted-foreground">{t.appointments.notFound}</div>;

  const sb = statusBadge(appointment.status);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppointment({
      id: appointmentId,
      data: { date, time, reason, status, notes: notes || undefined },
    });
  };

  const quickStatus = (s: "confirmed" | "pending" | "cancelled") => {
    updateAppointment({
      id: appointmentId,
      data: { status: s },
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/appointments" className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground transition-colors">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.appointments.details}</h1>
            <p className="text-muted-foreground text-sm">{t.appointments.detailsSub}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
              <Pencil size={16} /> {t.appointments.edit}
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => {
              if (window.confirm(t.appointments.deleteConfirm)) {
                deleteAppointment({ id: appointmentId });
              }
            }}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 size={16} /> {t.appointments.delete}
          </Button>
        </div>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-4">
            <Card className="border-0 shadow-md">
              <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-extrabold">{appointment.reason}</h2>
                    <Badge variant="outline" className={`${sb.cls} mt-2 font-semibold`}>{sb.label}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5 pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <CalendarDays size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{t.appointments.date}</p>
                      <p className="font-bold mt-0.5">{formatDateAr(appointment.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">{t.appointments.time}</p>
                      <p className="font-bold mt-0.5" dir="ltr">{appointment.time}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-muted-foreground">{t.appointments.notes}</p>
                      <p className="mt-1 whitespace-pre-wrap text-foreground/90">
                        {appointment.notes || t.appointments.noNotes}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick status action buttons */}
            <Card className="border-0 shadow-md">
              <CardContent className="p-5">
                <p className="text-sm font-semibold text-muted-foreground mb-3">{t.appointments.quickActions}</p>
                <div className="flex flex-wrap gap-2">
                  {appointment.status !== "confirmed" && (
                    <Button
                      size="sm"
                      onClick={() => quickStatus("confirmed")}
                      disabled={isUpdating}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0"
                    >
                      <CheckCircle2 size={15} />
                      {t.appointments.markReviewed}
                    </Button>
                  )}
                  {appointment.status !== "pending" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => quickStatus("pending")}
                      disabled={isUpdating}
                      className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <RotateCcw size={15} />
                      {t.appointments.markPending}
                    </Button>
                  )}
                  {appointment.status !== "cancelled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => quickStatus("cancelled")}
                      disabled={isUpdating}
                      className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle size={15} />
                      {t.appointments.markCancelled}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-md gradient-brand-soft border-primary/10 h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <User size={18} />
                  <span className="font-bold">{t.appointments.patientCard}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t.appointments.patientId}</p>
                  <p className="font-extrabold text-lg">#{appointment.patientId}</p>
                </div>
                <Link href={`/patients/${appointment.patientId}`}>
                  <Button variant="outline" className="w-full mt-5 bg-white">
                    {t.appointments.viewProfile}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleUpdate} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date" className="font-semibold">{t.appointments.date}</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-11" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="font-semibold">{t.appointments.time}</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="h-11" dir="ltr" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason" className="font-semibold">{t.appointments.reason}</Label>
                <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} required className="h-11" />
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
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[100px]" />
              </div>
              <div className="flex justify-end gap-3 pt-5 border-t">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  {t.appointments.cancel}
                </Button>
                <Button type="submit" disabled={isUpdating}
                  className="gradient-brand text-white border-0 shadow-lg shadow-primary/20 px-6 font-bold">
                  {isUpdating ? t.appointments.updating : t.appointments.update}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
