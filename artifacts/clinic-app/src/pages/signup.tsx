import { useState } from "react";
import { useSignup, getGetMeQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Stethoscope, User, Building2, Mail, Lock } from "lucide-react";
import { t } from "@/lib/i18n";

export default function Signup() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: signup, isPending } = useSignup({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data);
        toast.success(t.auth.accountCreated);
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        const status = err?.response?.status;
        if (status === 409) toast.error(t.auth.emailInUse);
        else toast.error("تعذّر إنشاء الحساب، حاول مرة أخرى");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("كلمة المرور يجب أن تكون ٦ أحرف على الأقل");
      return;
    }
    signup({ data: { name, clinicName, email, password } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-5xl bg-card rounded-3xl shadow-2xl overflow-hidden grid lg:grid-cols-2 border border-border">
        {/* Right — Brand */}
        <div className="hidden lg:flex gradient-brand text-white p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Stethoscope size={26} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">{t.appName}</h1>
              <p className="text-xs text-white/80">{t.tagline}</p>
            </div>
          </div>

          <div className="relative space-y-4">
            <h2 className="text-3xl font-extrabold leading-tight">
              ابدأ رحلتك<br />في إدارة عيادتك بشكل أذكى
            </h2>
            <p className="text-white/85 leading-relaxed">
              انضم لمئات الأطباء الذين يستخدمون {t.appName} يومياً لتنظيم مواعيدهم، حفظ ملفات مرضاهم، وتوفير وقتهم.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-6">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-2xl font-extrabold">+٥٠٠</div>
                <div className="text-xs text-white/75 mt-1">طبيب</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-2xl font-extrabold">+٢٠ك</div>
                <div className="text-xs text-white/75 mt-1">موعد</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                <div className="text-2xl font-extrabold">٩٩٪</div>
                <div className="text-xs text-white/75 mt-1">رضا</div>
              </div>
            </div>
          </div>

          <div className="relative text-white/60 text-xs">© {new Date().getFullYear()} {t.appName}</div>
        </div>

        {/* Left — Form */}
        <div className="p-8 md:p-10">
          <div className="lg:hidden flex items-center gap-3 mb-6 justify-center">
            <div className="w-11 h-11 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-lg">
              <Stethoscope size={22} />
            </div>
            <h1 className="text-xl font-extrabold text-gradient-brand">{t.appName}</h1>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">{t.auth.createAccount}</h2>
            <p className="text-muted-foreground mt-2 text-sm">{t.auth.createAccountSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">{t.auth.name}</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
                  required minLength={2} className="pr-10 h-11" placeholder={t.auth.namePlaceholder} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinicName" className="font-semibold">{t.auth.clinicName}</Label>
              <div className="relative">
                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input id="clinicName" value={clinicName} onChange={(e) => setClinicName(e.target.value)}
                  required minLength={2} className="pr-10 h-11" placeholder={t.auth.clinicNamePlaceholder} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">{t.auth.email}</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  required dir="ltr" className="pr-10 h-11" placeholder={t.auth.emailPlaceholder} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold">{t.auth.password}</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={6} dir="ltr" className="pr-10 h-11" placeholder={t.auth.passwordPlaceholder} />
              </div>
            </div>

            <Button type="submit" disabled={isPending}
              className="w-full h-12 text-base font-bold gradient-brand hover:opacity-90 text-white border-0 shadow-lg shadow-primary/20 mt-2">
              {isPending ? t.auth.registering : t.auth.register}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.auth.haveAccount}{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              {t.auth.login}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
