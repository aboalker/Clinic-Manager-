import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CompassIcon } from "lucide-react";
import { t } from "@/lib/i18n";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-3xl gradient-brand text-white flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/30">
          <CompassIcon size={36} />
        </div>
        <h1 className="text-6xl font-extrabold text-gradient-brand">404</h1>
        <h2 className="text-2xl font-bold mt-3">{t.notFound.title}</h2>
        <p className="text-muted-foreground mt-2">{t.notFound.subtitle}</p>
        <Link href="/dashboard">
          <Button className="mt-6 gradient-brand text-white border-0 shadow-lg shadow-primary/20 font-bold">
            {t.notFound.home}
          </Button>
        </Link>
      </div>
    </div>
  );
}
