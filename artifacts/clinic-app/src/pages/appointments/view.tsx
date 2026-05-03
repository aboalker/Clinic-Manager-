import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useGetAppointment, useUpdateAppointment, useDeleteAppointment, getGetAppointmentQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Calendar, Clock, User, FileText } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";

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
    query: { enabled: !!appointmentId, queryKey: getGetAppointmentQueryKey(appointmentId) }
  });

  useEffect(() => {
    if (appointment) {
      setDate(appointment.date);
      setTime(appointment.time);
      setReason(appointment.reason);
      setStatus(appointment.status);
      setNotes(appointment.notes || "");
    }
  }, [appointment]);

  const { mutate: updateAppointment, isPending: isUpdating } = useUpdateAppointment({
    mutation: {
      onSuccess: (data) => {
        toast.success("Appointment updated");
        queryClient.setQueryData(getGetAppointmentQueryKey(appointmentId), data);
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        setIsEditing(false);
      },
      onError: () => toast.error("Failed to update")
    }
  });

  const { mutate: deleteAppointment, isPending: isDeleting } = useDeleteAppointment({
    mutation: {
      onSuccess: () => {
        toast.success("Appointment deleted");
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        setLocation("/appointments");
      },
      onError: () => toast.error("Failed to delete")
    }
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading appointment details...</div>;
  if (!appointment) return <div className="p-8 text-center text-slate-500">Appointment not found</div>;

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppointment({
      id: appointmentId,
      data: { date, time, reason, status, notes: notes || undefined }
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/appointments" className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Appointment Details</h1>
            <p className="text-slate-500">Manage visit information</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
          )}
          <Button 
            variant="destructive" 
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this appointment?")) {
                deleteAppointment({ id: appointmentId });
              }
            }}
            disabled={isDeleting}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </Button>
        </div>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{appointment.reason}</h2>
                    <p className="text-slate-500 mt-1">Status: 
                      <Badge variant="outline" className={`ml-2 ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-blue-500 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Date</p>
                      <p className="text-slate-900">{new Date(appointment.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="text-blue-500 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Time</p>
                      <p className="text-slate-900">{appointment.time}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-3">
                    <FileText className="text-slate-400 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-medium text-slate-500">Notes</p>
                      <p className="text-slate-900 whitespace-pre-wrap mt-1">
                        {appointment.notes || "No additional notes provided."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-1">
            <Card className="border-slate-200 shadow-sm bg-slate-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User size={18} className="text-slate-500" />
                  Patient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-500">Patient ID</p>
                    <p className="font-medium text-slate-900">#{appointment.patientId}</p>
                  </div>
                  <Link href={`/patients/${appointment.patientId}`}>
                    <Button variant="outline" className="w-full mt-2">View Patient Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    required 
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input 
                    id="time" 
                    type="time" 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    required 
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input 
                  id="reason" 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  required 
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(val: any) => setStatus(val)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="min-h-[100px] bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
