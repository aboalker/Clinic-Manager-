import { useState } from "react";
import { useLogin } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { Stethoscope } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("doctor@clinic.com");
  const [password, setPassword] = useState("demo1234");

  const { mutate: login, isPending } = useLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data);
        toast.success("Welcome back, Dr. Smith");
        setLocation("/dashboard");
      },
      onError: () => {
        toast.error("Invalid credentials");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ data: { email, password } });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-lg">
          <Stethoscope size={28} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ClinicOS</h1>
      </div>
      
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">Doctor Login</CardTitle>
          <CardDescription className="text-center text-slate-500">
            Enter your credentials to access your command center
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="bg-white"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white" disabled={isPending}>
              {isPending ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Demo Account: doctor@clinic.com / demo1234</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
