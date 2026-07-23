import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Modena Air Service • EFB BO105 CBS-4 HEMS",
  manifest: "/manifest.json",
  description: "Electronic Flight Bag oficial de aviación para operaciones HEMS de helicóptero MBB Bölkow BO 105 CBS-4 Stretched (LQ-HEMS). Calculadora de peso y balanceo, performance HOGE/HIGE, plan de vuelo OACI EANA y manuales.",
  applicationName: "Modena BO105 EFB",
  authors: [{ name: "Modena Air Service Operational Flight Department" }],
  generator: "Next.js",
  keywords: ["EFB", "BO105", "Helicopter", "HEMS", "Modena Air Service", "ANAC", "EANA", "Peso y Balanceo", "Calculadora Aeronautica"],
  referrer: "origin-when-cross-origin",
  creator: "Modena Air Service",
  publisher: "Modena Air Service",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://efbbo105.vercel.app"),
  openGraph: {
    title: "Modena Air Service • EFB BO105 CBS-4 HEMS",
    description: "Electronic Flight Bag oficial para helicóptero Bölkow BO 105 CBS-4 Stretched (LQ-HEMS)",
    url: "https://efbbo105.vercel.app",
    siteName: "Modena BO105 EFB",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
