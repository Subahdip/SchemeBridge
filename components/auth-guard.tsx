"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { isAuthenticated, UserSessionData } from "@/lib/firebase";
import { ShieldCheck } from "lucide-react";
import { BrandIcon } from "@/components/brand-icon";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const user: UserSessionData | null = isAuthenticated();
    if (user && user.isLoggedIn) {
      setIsAuth(true);
      setLoading(false);
    } else {
      setIsAuth(false);
      setLoading(false);
      router.push("/login");
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4 bg-background text-foreground transition-colors">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-16 w-16 rounded-2xl bg-aurora-500/20 blur-xl animate-pulse" />
          <BrandIcon className="relative h-14 w-auto animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-semibold bg-gradient-to-r from-aurora-400 to-teal-400 bg-clip-text text-transparent">
            {t("Verifying Authentication...")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("Ensuring secure access to SchemeBridge features")}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}

export default AuthGuard;
