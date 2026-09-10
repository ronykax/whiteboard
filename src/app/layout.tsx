import { cn } from "cn";
import type { Metadata } from "next";
import { Domine, Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const serif = Domine({
  subsets: ["latin"],
  variable: "--font-domine",
});

export const metadata: Metadata = {
  description: "An infinite canvas for all your thoughts, feelings, and ideas.",
  title: "Whiteboard",
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html
    lang="en"
    className={cn("antialiased", sans.variable, mono.variable, serif.variable)}
  >
    <body className="font-sans">{children}</body>
  </html>
);

export default RootLayout;
