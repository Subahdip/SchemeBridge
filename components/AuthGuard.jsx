"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "../src/firebase";

export function AuthGuard({ children }) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = isAuthenticated();
    if (user && user.isLoggedIn) {
      setIsAuth(true);
      setLoading(false);
    } else {
      setIsAuth(false);
      setLoading(false);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="text-white text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuth) {
    return null;
  }

  return children;
}

export default AuthGuard;
