import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetPatient, useUpdatePatient, useDeletePatient, getGetPatientQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Mail, Phone, MapPin, Droplet, Calendar as CalendarIcon, Clock, Plus } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getListPatientsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

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
    query: { enabled: !!patientId, queryKey: getGetPatientQueryKey(patientId) }
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
        toast.success("Patient updated");
        queryClient.setQueryData(getGetPatientQueryKey(patientId), (old: any) => ({ ...old, ...data }));
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        setIsEditing(false);
      },
      onError: () => toast.error("Failed to update")
    }
  });

  const { mutate: deletePatient, isPending: isDeleting } = useDeletePatient({
    mutation: {
      onSuccess: () => {
        toast.success("Patient deleted");
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        setLocation("/patients");
      },
      onError: () => toast.error("Failed to delete")
    }
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading patient profile...</div>;
  if (!patient) return <div className="p-8 text-center text-slate-500">Patient not found</div>;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient({
      id: patientId,
      data: { 
        name, 
        age: parseInt(age, 10), 
        email: email || undefined, 
        phone: phone || undefined, 
        address: address || undefined, 
        bloodType: bloodType || undefined, 
        notes: notes || undefined 
      }
    });
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'confirmed': return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case 'pending': return "bg-amber-100 text-amber-800 border-amber-200";
      case 'cancelled': return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/patients" className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Profile</h1>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
          <Button 
            variant="destructive" 
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this patient? This will also delete all their appointments.")) {
                deletePatient({ id: patientId });
              }
            }}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            {!isEditing ? (
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-3xl mx-auto mb-4">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{patient.name}</h2>
                  <p className="text-slate-500">{patient.age} years old</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={16} className="text-slate-400" />
                    <span className="text-slate-700">{patient.email || "No email provided"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={16} className="text-slate-400" />
                    <span className="text-slate-700">{patient.phone || "No phone provided"}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                    <span className="text-slate-700">{patient.address || "No address provided"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm pt-2">
                    <Droplet size={16} className="text-red-400" />
                    <span className="text-slate-700 font-medium">Blood Type: {patient.bloodType || "Unknown"}</span>
                  </div>
                </div>

                {patient.notes && (
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900 mb-2">Medical Notes</h3>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md border border-slate-100 whitespace-pre-wrap">
                      {patient.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            ) : (
              <CardContent className="pt-6">
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select value={bloodType} onValueChange={setBloodType}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Medical Notes</Label>
                    <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-[100px]" />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button type="submit" size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isUpdating}>Save</Button>
                  </div>
                </form>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Appointment History */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-100">
              <CardTitle className="text-lg">Appointment History</CardTitle>
              <Link href="/appointments/new">
                <Button size="sm" variant="outline" className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Plus size={16} /> New Appointment
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              {!patient.appointments || patient.appointments.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                  <CalendarIcon size={32} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No appointments recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(apt => (
                    <Link key={apt.id} href={`/appointments/${apt.id}`} className="block">
                      <div className="p-4 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-slate-50 transition-all flex items-center justify-between group">
                        <div className="flex gap-4">
                          <div className="bg-white p-2 rounded border border-slate-200 text-center min-w-[60px] flex flex-col justify-center shadow-sm">
                            <span className="text-xs font-semibold text-slate-500 uppercase">
                              {new Date(apt.date).toLocaleDateString(undefined, { month: 'short' })}
                            </span>
                            <span className="text-lg font-bold text-slate-900 leading-tight">
                              {new Date(apt.date).getDate()}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{apt.reason}</h4>
                            <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                              <span className="flex items-center gap-1"><Clock size={14} /> {apt.time}</span>
                            </div>
                          </div>
                        </div>
                        <div>
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
