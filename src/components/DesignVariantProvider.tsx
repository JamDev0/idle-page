"use client";

/**
 * Legacy provider kept for backwards compatibility. No longer applies design variants
 * since variants are now route-based (/1 through /7).
 */
export function DesignVariantProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
