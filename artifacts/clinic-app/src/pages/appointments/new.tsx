import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateAppointment, useListPatients } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getListAppointmentsQueryKey } from "@workspace/api-client-react";

export default function NewAppointment() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("09:00");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"confirmed" | "pending" | "cancelled">("pending");
  const [notes, setNotes] = useState("");

  const { data: patientsData, isLoading: isPatientsLoading } = useListPatients({ limit: 100 });
  const patients = patientsData?.patients || [];

  const { mutate: createAppointment, isPending } = useCreateAppointment({
    mutation: {
      onSuccess: () => {
        toast.success("Appointment created successfully");
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        setLocation("/appointments");
      },
      onError: () => {
        toast.error("Failed to create appointment");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      toast.error("Please select a patient");
      return;
    }
    
    createAppointment({
      data: {
        patientId: parseInt(patientId, 10),
        date,
        time,
        reason,
        status,
        notes: notes || undefined
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/appointments" className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Appointment</h1>
          <p className="text-slate-500">Schedule a new visit</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select value={patientId} onValueChange={setPatientId} disabled={isPatientsLoading}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                placeholder="e.g., Annual checkup, Flu symptoms"
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
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Add any internal notes here..."
                className="min-h-[100px] bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setLocation("/appointments")}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isPending}>
                {isPending ? "Creating..." : "Create Appointment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
