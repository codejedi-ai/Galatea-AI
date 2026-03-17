"use client";

import type React from "react";

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/simple-auth-context"
import { LoadingSpinner } from "@/components/loading-spinner"

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

  if (loading) {
    return <LoadingSpinner size="medium" fullScreen />
  }

  return currentUser ? <>{children}</> : null;
}
