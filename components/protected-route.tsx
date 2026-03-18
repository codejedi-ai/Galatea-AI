"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { CircleLoader } from "@/components/loading-screen";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push("/sign-in");
      } else {
        setShowLoader(false);
      }
    }
  }, [currentUser, loading, router]);

  if (loading || showLoader) {
    return <CircleLoader />;
  }

  return currentUser ? <>{children}</> : null;
}
