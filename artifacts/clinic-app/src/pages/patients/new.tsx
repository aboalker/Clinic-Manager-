import { useState } from "react";
import { useLocation } from "wouter";
import { useCreatePatient } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { getListPatientsQueryKey } from "@workspace/api-client-react";

export default function NewPatient() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [notes, setNotes] = useState("");

  const { mutate: createPatient, isPending } = useCreatePatient({
    mutation: {
      onSuccess: (data) => {
        toast.success("Patient created successfully");
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        setLocation(`/patients/${data.id}`);
      },
      onError: () => {
        toast.error("Failed to create patient");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createPatient({
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/patients" className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Patient</h1>
          <p className="text-slate-500">Create a new patient record</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="John Doe"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input 
                  id="age" 
                  type="number"
                  min="0"
                  max="150"
                  value={age} 
                  onChange={(e) => setAge(e.target.value)} 
                  required 
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="john@example.com"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="(555) 123-4567"
                  className="bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="123 Main St, City"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select value={bloodType} onValueChange={setBloodType}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Medical Notes</Label>
              <Textarea 
                id="notes" 
                value={notes} 
                onChange={(e) => setNotes(e.target.value)} 
                placeholder="Allergies, chronic conditions, etc..."
                className="min-h-[120px] bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setLocation("/patients")}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white" disabled={isPending}>
                {isPending ? "Creating..." : "Create Patient"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
