"use client";

import { Suspense } from "react";
import WelcomePage from "@/components/welcome/WelcomePage";
import { useAuth } from "@/hooks/useAuth";

function WelcomePageSuspense() {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
          <div className="w-full max-w-md">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <WelcomePage isAuthenticated={isAuthenticated} isSuperAdmin={isSuperAdmin} />
    </Suspense>
  );
}

export default function Home() {
  return <WelcomePageSuspense />;
}