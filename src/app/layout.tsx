import type { Metadata } from "next";
import SessionProvider from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "OHé Diag — Diagnostic d'orthographe",
  description: "Plateforme de diagnostic d'orthographe et de français pour les organisations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
