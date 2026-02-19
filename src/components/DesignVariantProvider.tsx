"use client";

import { useEffect } from "react";
import { loadSettings, SETTINGS_CHANGED_EVENT } from "@/lib/settings-storage";
import type { DesignVariant } from "@/types/settings";

function applyVariant() {
  const settings = loadSettings();
  const variant: DesignVariant = settings.designVariant ?? "void-minimal";
  document.documentElement.setAttribute("data-variant", variant);
}

/**
 * Applies design variant from localStorage to document root for token overrides (spec §13, §6).
 * Re-applies when settings are saved (e.g. from Settings page).
 */
export function DesignVariantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    applyVariant();
    const handler = () => applyVariant();
    window.addEventListener(SETTINGS_CHANGED_EVENT, handler);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, handler);
  }, []);

  return <>{children}</>;
}
