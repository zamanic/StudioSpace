"use client";

import { HeartIcon } from "lucide-react";
import { cn } from "cn";

import { useWishlist } from "@/components/wishlist-provider";

/**
 * The wishlist heart that sits in the top-right corner of every catalogue
 * image. Rendered as a real <button> rather than a link, so it never nests
 * inside the card's anchor and never navigates when it is clicked.
 */
export function WishlistButton({
  studioId,
  title,
  className,
}: {
  studioId: string;
  title: string;
  className?: string;
}) {
  const { isSaved, toggle, pendingId } = useWishlist();
  const saved = isSaved(studioId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={
        saved
          ? `Remove ${title} from your saved studios`
          : `Save ${title} to your saved studios`
      }
      disabled={pendingId === studioId}
      onClick={() => void toggle(studioId, title)}
      className={cn(
        "absolute top-3 right-3 z-10 inline-flex size-9 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-0 focus-visible:outline-none disabled:cursor-wait",
        saved &&
          "border-transparent bg-brand text-brand-foreground hover:bg-brand",
        className,
      )}
    >
      <HeartIcon
        className={cn(
          "size-4 transition-transform duration-300",
          saved && "scale-110 fill-current",
        )}
      />
    </button>
  );
}
