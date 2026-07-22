import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Curso BO105 CBS4",
  description: "Entrenamiento teórico interactivo para pilotos de helicóptero BO105",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0f172a",
};

import { ThemeProvider } from '@/context/ThemeContext';
import { ProgressProvider } from '@/context/ProgressContext';
import { AuthProvider } from '@/context/AuthContext';
import Sidebar from "@/components/Sidebar";
import CommandPalette from '@/components/CommandPalette';

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>
}>) {
  const { locale } = await params;
  
  const validLocale = routing.locales.includes(locale as any) ? locale : routing.defaultLocale;

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages({ locale: validLocale });

  return (
    <html
      lang={validLocale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col md:flex-row bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <AuthProvider>
              <ProgressProvider>
                <div className="flex flex-col md:flex-row min-h-screen w-full">
                  <CommandPalette />
                  <Sidebar />
                  <main className="flex-1 w-full relative lg:ml-64 pt-16 lg:pt-0">
                    {children}
                  </main>
                </div>
              </ProgressProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
