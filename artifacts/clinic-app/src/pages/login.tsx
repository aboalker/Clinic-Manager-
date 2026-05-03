import { useState } from "react";
import { useLogin, getGetMeQueryKey } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Stethoscope, Mail, Lock, Sparkles, ShieldCheck, CalendarHeart } from "lucide-react";
import { t } from "@/lib/i18n";

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: login, isPending } = useLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data);
        toast.success(t.auth.welcomeBack);
        setLocation("/dashboard");
      },
      onError: () => toast.error(t.auth.invalidCreds),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ data: { email, password } });
  };

  return (
    <div className="min-h-screen flex items-stretch">
      {/* Right (RTL primary) — Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Stethoscope size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">{t.appName}</h1>
            <p className="text-sm text-white/80">{t.tagline}</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-extrabold leading-tight">
            عيادتك بين يديك،<br />
            بكل بساطة وأمان.
          </h2>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            نظام متكامل لإدارة المواعيد والمرضى والملفات الطبية، مصمم خصيصاً للأطباء العرب.
          </p>
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <CalendarHeart size={18} />
              </div>
              <span>إدارة المواعيد بضغطة زر</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <span>بياناتك مشفّرة وآمنة بالكامل</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <span>واجهة عربية أنيقة وسريعة</span>
            </div>
          </div>
        </div>

        <div className="relative text-white/60 text-sm">© {new Date().getFullYear()} {t.appName}</div>
      </div>

      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center text-white shadow-lg">
              <Stethoscope size={26} />
            </div>
            <h1 className="text-2xl font-extrabold text-gradient-brand">{t.appName}</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight">{t.auth.welcome}</h2>
            <p className="text-muted-foreground mt-2">{t.auth.welcomeSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">{t.auth.email}</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="email" type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required dir="ltr"
                  className="pr-10 h-12 text-base"
                  placeholder={t.auth.emailPlaceholder}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-semibold">{t.auth.password}</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  id="password" type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required dir="ltr"
                  className="pr-10 h-12 text-base"
                  placeholder={t.auth.passwordPlaceholder}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 text-base font-bold gradient-brand hover:opacity-90 text-white border-0 shadow-lg shadow-primary/20"
            >
              {isPending ? t.auth.signingIn : t.auth.signIn}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t.auth.noAccount}{" "}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              {t.auth.signup}
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
