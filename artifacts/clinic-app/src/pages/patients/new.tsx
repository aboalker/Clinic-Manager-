import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useCreatePatient, getListPatientsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowRight, UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { t } from "@/lib/i18n";

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
        toast.success(t.patients.created);
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        setLocation(`/patients/${data.id}`);
      },
      onError: () => toast.error("تعذّر إنشاء المريض"),
    },
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
        notes: notes || undefined,
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/patients" className="p-2.5 rounded-xl hover:bg-accent text-muted-foreground transition-colors">
          <ArrowRight size={20} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-brand text-white flex items-center justify-center shadow-lg shadow-primary/20">
            <UserPlus size={22} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.patients.new}</h1>
            <p className="text-muted-foreground text-sm">إنشاء سجل مريض جديد</p>
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-semibold">{t.patients.fullName} *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
                  required placeholder={t.patients.namePlaceholder} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="font-semibold">{t.patients.age} *</Label>
                <Input id="age" type="number" min="0" max="150" value={age}
                  onChange={(e) => setAge(e.target.value)} required className="h-11" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">{t.patients.email}</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.patients.emailPlaceholder} dir="ltr" className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-semibold">{t.patients.phone}</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder={t.patients.phonePlaceholder} dir="ltr" className="h-11" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="font-semibold">{t.patients.address}</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder={t.patients.addressPlaceholder} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodType" className="font-semibold">{t.patients.bloodType}</Label>
                <Select value={bloodType} onValueChange={setBloodType}>
                  <SelectTrigger className="h-11"><SelectValue placeholder={t.patients.selectBlood} /></SelectTrigger>
                  <SelectContent>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-semibold">{t.patients.medicalNotes}</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder={t.patients.notesPlaceholder} className="min-h-[120px]" />
            </div>

            <div className="flex justify-end gap-3 pt-5 border-t">
              <Button type="button" variant="outline" onClick={() => setLocation("/patients")}>
                {t.patients.cancel}
              </Button>
              <Button type="submit" disabled={isPending}
                className="gradient-brand text-white border-0 shadow-lg shadow-primary/20 px-6 font-bold">
                {isPending ? t.patients.creating : t.patients.create}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
