"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { ApiError, api } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { getTokenFromClient } from "@/lib/getTokenFromClient";

const NO_IDS: string[] = [];

type WishlistValue = {
  /** True when this studio is in the signed-in creator's saved list. */
  isSaved: (studioId: string) => boolean;
  /** Saves or unsaves optimistically, rolling back if the API refuses. */
  toggle: (studioId: string, title: string) => Promise<void>;
  /** The studio currently mid-request, so its heart can disable itself. */
  pendingId: string | null;
};

const WishlistContext = createContext<WishlistValue | null>(null);

/**
 * One request per session resolves the saved ids; every card's heart then reads
 * them from here instead of each firing its own lookup.
 */
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id ?? null;

  // The ids are stored beside the account they belong to, so signing out or
  // switching accounts can never leave another account's hearts filled - a
  // mismatch just reads as "nothing saved yet" without an extra render pass.
  const [entry, setEntry] = useState<{ account: string | null; ids: string[] }>(
    { account: null, ids: NO_IDS },
  );
  const [pendingId, setPendingId] = useState<string | null>(null);

  const savedIds = entry.account === userId ? entry.ids : NO_IDS;

  useEffect(() => {
    if (!userId) return;

    let active = true;
    (async () => {
      const token = await getTokenFromClient();
      if (!token) return;
      try {
        const ids = await api.getWishlistIds(token);
        if (active) setEntry({ account: userId, ids });
      } catch {
        // Offline or an expired session - the hearts simply start empty.
      }
    })();

    return () => {
      active = false;
    };
  }, [userId]);

  const isSaved = useCallback(
    (studioId: string) => savedIds.includes(studioId),
    [savedIds],
  );

  const toggle = useCallback(
    async (studioId: string, title: string) => {
      if (!userId) {
        toast.error("Sign in to save studios", {
          description: "Your wishlist is tied to your account.",
        });
        const back = `${window.location.pathname}${window.location.search}`;
        router.push(`/login?redirect=${encodeURIComponent(back)}`);
        return;
      }

      if (pendingId) return;

      const wasSaved = savedIds.includes(studioId);
      const commit = (ids: string[]) => setEntry({ account: userId, ids });

      // Paint the new state first, then confirm it with the API.
      commit(
        wasSaved
          ? savedIds.filter((id) => id !== studioId)
          : [studioId, ...savedIds],
      );
      setPendingId(studioId);

      const token = await getTokenFromClient();
      if (!token) {
        commit(savedIds);
        setPendingId(null);
        toast.error("Your session expired. Please sign in again.");
        router.push("/login?redirect=/my-wishlist");
        return;
      }

      try {
        if (wasSaved) {
          await api.removeFromWishlist(studioId, token);
          toast.success("Removed from saved studios", {
            description: `${title} is no longer in your wishlist.`,
          });
        } else {
          await api.saveToWishlist(studioId, token);
          toast.success("Saved to your wishlist", {
            description: `${title} was added to Saved Studios.`,
          });
        }
        // Only the saved page renders from the list, so only it needs a refetch.
        if (pathname === "/my-wishlist") router.refresh();
      } catch (error) {
        commit(savedIds);
        toast.error(
          error instanceof ApiError
            ? error.message
            : "Could not reach the server. Please try again.",
        );
      } finally {
        setPendingId(null);
      }
    },
    [pathname, pendingId, router, savedIds, userId],
  );

  const value = useMemo(
    () => ({ isSaved, toggle, pendingId }),
    [isSaved, toggle, pendingId],
  );

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used inside a WishlistProvider.");
  }
  return context;
}
