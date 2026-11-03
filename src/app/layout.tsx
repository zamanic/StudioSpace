import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bodoni_Moda, Jost } from "next/font/google";

import "./globals.css";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Providers } from "@/components/providers";

// Bodoni Moda carries the display type (studio names, statements); Jost runs
// every label and paragraph. Both are self-hosted by next/font, so no
// stylesheet request and no layout shift.
const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "StudioSpace — Book creative studios by the hour",
    template: "%s · StudioSpace",
  },
  description:
    "StudioSpace is a peer-to-peer marketplace for photo studios, film stages, podcast lounges, music suites and workshops. Find the room, check the gear, book it by the hour.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodoni.variable} ${jost.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
