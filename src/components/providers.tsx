"use client";

import { ThemeProvider } from "next-themes";

import { Toaster } from "@/components/ui/sonner";
import { WishlistProvider } from "@/components/wishlist-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {/* The saved-studio ids are resolved once here, then every card heart
          reads them from context instead of running its own lookup. */}
      <WishlistProvider>
        {children}
        <Toaster />
      </WishlistProvider>
    </ThemeProvider>
  );
}
