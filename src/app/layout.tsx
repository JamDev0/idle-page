import type { Metadata } from "next";
import "./globals.css";
import { DesignVariantProvider } from "@/components/DesignVariantProvider";

export const metadata: Metadata = {
  title: "Idle Page",
  description: "Desktop-first idle companion: media rotation and TODO checklist.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" data-variant="void-minimal">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--fg)] antialiased">
        <DesignVariantProvider>{children}</DesignVariantProvider>
      </body>
    </html>
  );
}
