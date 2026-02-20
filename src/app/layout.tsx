import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
