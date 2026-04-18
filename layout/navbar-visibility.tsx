"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type NavbarVisibilityContextValue = {
  isNavbarHidden: boolean;
  hideNavbar: (sourceId?: string) => void;
  showNavbar: (sourceId?: string) => void;
  setNavbarHidden: (hidden: boolean, sourceId?: string) => void;
};

const DEFAULT_SOURCE_ID = "manual";

const NavbarVisibilityContext =
  createContext<NavbarVisibilityContextValue | null>(null);

export function NavbarVisibilityProvider({ children }: { children: ReactNode }) {
  const [hiddenSourceIds, setHiddenSourceIds] = useState<Set<string>>(
    () => new Set(),
  );

  const hideNavbar = useCallback((sourceId = DEFAULT_SOURCE_ID) => {
    setHiddenSourceIds((current) => {
      if (current.has(sourceId)) {
        return current;
      }

      const next = new Set(current);
      next.add(sourceId);
      return next;
    });
  }, []);

  const showNavbar = useCallback((sourceId = DEFAULT_SOURCE_ID) => {
    setHiddenSourceIds((current) => {
      if (!current.has(sourceId)) {
        return current;
      }

      const next = new Set(current);
      next.delete(sourceId);
      return next;
    });
  }, []);

  const setNavbarHidden = useCallback(
    (hidden: boolean, sourceId = DEFAULT_SOURCE_ID) => {
      if (hidden) {
        hideNavbar(sourceId);
      } else {
        showNavbar(sourceId);
      }
    },
    [hideNavbar, showNavbar],
  );

  const value = useMemo(
    () => ({
      isNavbarHidden: hiddenSourceIds.size > 0,
      hideNavbar,
      showNavbar,
      setNavbarHidden,
    }),
    [hiddenSourceIds.size, hideNavbar, showNavbar, setNavbarHidden],
  );

  return (
    <NavbarVisibilityContext.Provider value={value}>
      {children}
    </NavbarVisibilityContext.Provider>
  );
}

export function useNavbarVisibility() {
  const context = useContext(NavbarVisibilityContext);

  if (!context) {
    throw new Error(
      "useNavbarVisibility must be used inside NavbarVisibilityProvider.",
    );
  }

  return context;
}
