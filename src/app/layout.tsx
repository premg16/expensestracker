import type { Metadata, Viewport } from "next";
import { Fraunces, JetBrains_Mono, Manrope } from "next/font/google";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const displayFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-float-display",
  display: "swap",
});

const sansFont = Manrope({
  subsets: ["latin"],
  variable: "--font-float-sans",
  display: "swap",
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-float-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Float",
  description:
    "Float shows exactly what you can spend today after rent, cards, goals, and every quiet renewal that's already claimed your balance.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Float",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#101214",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${sansFont.variable} ${displayFont.variable} ${monoFont.variable}`}
    >
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
