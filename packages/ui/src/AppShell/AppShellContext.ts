"use client";

import { createContext, useContext } from "react";

interface AppShellContextValue {
  pageActionsOccluded: boolean;
}

const AppShellContext = createContext<AppShellContextValue>({
  pageActionsOccluded: false,
});

export const AppShellProvider = AppShellContext.Provider;

export function useAppShell() {
  return useContext(AppShellContext);
}
