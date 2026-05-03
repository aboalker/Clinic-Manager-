import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  useGetPatient, useUpdatePatient, useDeletePatient,
  getGetPatientQueryKey, getListPatientsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowRight, Trash2, Mail, Phone, MapPin, Droplet,
  CalendarDays, Clock, Plus, Pencil, FileText
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { t, monthShortAr } from "@/lib/i18n";

const statusBadge = (s: string) => {
  switch (s) {
    case "confirmed": return { label: t.appointments.statusConfirmed, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    case "pending": return { label: t.appointments.statusPending, cls: "bg-amber-100 text-amber-700 border-amber-200" };
    case "cancelled": return { label: t.appointments.statusCancelled, cls: "bg-red-100 text-red-700 border-red-200" };
    default: return { label: s, cls: "bg-slate-100 text-slate-700 border-slate-200" };
  }
};

export default function ViewPatient() {
  const { id } = useParams();
  const patientId = parseInt(id || "0", 10);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [notes, setNotes] = useState("");

  const { data: patient, isLoading } = useGetPatient(patientId, {
    query: { enabled: !!patientId, queryKey: getGetPatientQueryKey(patientId) },
  });

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setAge(patient.age.toString());
      setEmail(patient.email || "");
      setPhone(patient.phone || "");
      setAddress(patient.address || "");
      setBloodType(patient.bloodType || "");
      setNotes(patient.notes || "");
    }
  }, [patient]);

  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient({
    mutation: {
      onSuccess: (data) => {
        toast.success(t.patients.updated);
        queryClient.setQueryData(getGetPatientQueryKey(patientId), (old: any) => ({ ...old, ...data }));
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        setIsEditing(false);
      },
      onError: () => toast.error("تعذّر التحديث"),
    },
  });

  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient({
    mutation: {
      onSuccess: () => {
        toast.success(t.patients.deleted);
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        setLocation("/patients");
      },
      onError: () => toast.error("تعذّر الحذف"),
    },
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">{t.patients.loadingProfile}</div>;
  if (!patient) return <div className="p-8 text-center text-muted-foreground">{t.patients.notFound}</div>;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient({
      id: patientId,
      data: {
        name, age: parseInt(age, 10),
        email: email || undefined, phone: phone || undefined,
        address: address || undefined, bloodType: bloodType || undefined,
        notes: notes || undefined,
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link href="/patients" className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground transition-colors">
            <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.patients.profileTitle}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
              <Pencil size={16} /> {t.patients.edit}
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => {
              if (window.confirm(t.patients.deleteConfirm)) {
                deletePatient({ id: patientId });
              }
            }}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 size={16} /> {t.patients.delete}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-md overflow-hidden">
            {!isEditing ? (
              <>
                <div className="gradient-brand h-24 relative">
                  <div className="absolute -bottom-12 inset-x-0 flex justify-center">
                    <div className="w-24 h-24 rounded-3xl bg-card border-4 border-card flex items-center justify-center text-3xl font-extrabold gradient-brand text-white shadow-lg">
                      {patient.name.charAt(0)}
                    </div>
                  </div>
                </div>
                <CardContent className="pt-16 pb-6">
                  <div className="text-center mb-5">
                    <h2 className="text-xl font-extrabold">{patient.name}</h2>
                    <p className="text-muted-foreground text-sm">{patient.age} {t.patients.yearsOld}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                        <Mail size={15} />
                      </div>
                      <span className="truncate" dir={patient.email ? "ltr" : "rtl"}>{patient.email || t.patients.noEmail}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                        <Phone size={15} />
                      </div>
                      <span dir={patient.phone ? "ltr" : "rtl"}>{patient.phone || t.patients.noPhone}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-muted text-muted-foreground flex items-center justify-center flex-shrink-0">
                        <MapPin size={15} />
                      </div>
                      <span className="pt-1.5">{patient.address || t.patients.noAddress}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                        <Droplet size={15} />
                      </div>
                      <span className="font-semibold">
                        {t.patients.bloodLabel} <span dir="ltr">{patient.bloodType || t.patients.unknown}</span>
                      </span>
                    </div>
                  </div>

                  {patient.notes && (
                    <div className="mt-5 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                        <FileText size={14} />
                        <span className="font-semibold">{t.patients.medicalNotes}</span>
                      </div>
                      <p className="text-sm bg-accent/40 p-3 rounded-xl whitespace-pre-wrap">
                        {patient.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </>
            ) : (
              <CardContent className="p-6">
                <form onSubmit={handleUpdate} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold">{t.patients.fullName} *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="age" className="text-xs font-semibold">{t.patients.age} *</Label>
                    <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">{t.patients.email}</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">{t.patients.phone}</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs font-semibold">{t.patients.address}</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bloodType" className="text-xs font-semibold">{t.patients.bloodType}</Label>
                    <Select value={bloodType} onValueChange={setBloodType}>
                      <SelectTrigger><SelectValue placeholder={t.patients.selectBlood} /></SelectTrigger>
                      <SelectContent>
                        {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => (
                          <SelectItem key={b} value={b}>{b}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="notes" className="text-xs font-semibold">{t.patients.medicalNotes}</Label>
                    <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[80px]" />
                  </div>
                  <div className="flex justify-end gap-2 pt-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      {t.patients.cancel}
                    </Button>
                    <Button type="submit" size="sm" disabled={isUpdating}
                      className="gradient-brand text-white border-0">
                      {isUpdating ? t.patients.saving : t.patients.save}
                    </Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-0 shadow-md h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <CalendarDays size={20} />
                  </div>
                  <h3 className="text-lg font-bold">{t.patients.appointmentHistory}</h3>
                </div>
                <Link href="/appointments/new">
                  <Button size="sm" variant="outline" className="gap-1.5">
                    <Plus size={15} /> {t.appointments.new}
                  </Button>
                </Link>
              </div>

              {!patient.appointments || patient.appointments.length === 0 ? (
                <div className="text-center py-12 border border-dashed rounded-2xl bg-muted/30">
                  <CalendarDays size={32} className="text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">{t.patients.noAppointments}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.appointments
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(apt => {
                      const sb = statusBadge(apt.status);
                      return (
                        <Link key={apt.id} href={`/appointments/${apt.id}`} className="block">
                          <div className="p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-accent/30 transition-all flex items-center justify-between group">
                            <div className="flex gap-4 items-center">
                              <div className="bg-card border-2 border-border text-center min-w-[64px] py-2 rounded-2xl">
                                <span className="text-xs font-bold text-muted-foreground block">
                                  {monthShortAr(apt.date)}
                                </span>
                                <span className="text-2xl font-extrabold leading-none block mt-0.5">
                                  {new Date(apt.date).getDate()}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-bold group-hover:text-primary transition-colors">{apt.reason}</h4>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1.5"><Clock size={13} /> <span dir="ltr">{apt.time}</span></span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className={`${sb.cls} font-semibold`}>{sb.label}</Badge>
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
