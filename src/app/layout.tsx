import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
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
  title: "VectorBase - Developer-Friendly AI Knowledgebase",
  description: "Build powerful AI-powered knowledge bases with vector embeddings. Perfect for chatbots, search, and n8n integrations.",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster position="top-right" theme="dark" />
        </ThemeProvider>
        <Script
          defer
          src="https://analytics.codext.de/script.js"
          data-website-id="16bc9d34-91fd-4cb3-9505-e241192a8600"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
