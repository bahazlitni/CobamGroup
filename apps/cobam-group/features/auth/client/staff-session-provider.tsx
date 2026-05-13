"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useStaffSession } from "./use-staff-session";
import type { UseStaffSessionResult } from "@/features/auth/types";

const StaffSessionContext = createContext<UseStaffSessionResult | null>(null);

export function StaffSessionProvider({ children }: { children: ReactNode }) {
  const value = useStaffSession();

  return (
    <StaffSessionContext.Provider value={value}>
      {children}
    </StaffSessionContext.Provider>
  );
}

export function useStaffSessionContext() {
  const value = useContext(StaffSessionContext);

  if (!value) {
    throw new Error(
      "useStaffSessionContext must be used within a StaffSessionProvider",
    );
  }

  return value;
}
