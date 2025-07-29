import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/components/providers/queryProvider";

import "./globals.css";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "TripGuru",
  description:
    "Descubre estaciones de servicio y puntos de recarga en tu camino. Planifica tu viaje con confianza."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <Suspense>{children}</Suspense>
        </QueryProvider>
      </body>
    </html>
  );
}
