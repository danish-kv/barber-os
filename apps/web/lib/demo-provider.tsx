"use client";

import {
  createContext,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import { useDemoStore } from "@/lib/store";

// Gates rendering of store-dependent UI until zustand rehydrates from
// localStorage, so server and first client render never disagree.
const HydrationContext = createContext(false);

const emptySubscribe = () => () => {};

export function DemoProvider({ children }: { children: React.ReactNode }) {
  // false during SSR + first client paint, true after — no setState-in-effect.
  const hydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  useEffect(() => {
    // persist middleware rehydrates synchronously from localStorage on mount;
    // markHydrated also reseeds stale data.
    const st = useDemoStore.getState();
    if (!st.hydrated) st.markHydrated();
  }, []);

  return (
    <HydrationContext.Provider value={hydrated}>
      {children}
    </HydrationContext.Provider>
  );
}

export function useHydrated() {
  return useContext(HydrationContext);
}
