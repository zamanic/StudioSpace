"use client";

import { HeartIcon, Share2Icon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";

import { Button } from "@/components/ui/button";
import { useWishlist } from "@/components/wishlist-provider";

/**
 * The two header actions on a studio page. Share uses the native share sheet
 * where the browser has one and falls back to copying the link, while the
 * wishlist button reads the same context the card hearts use, so a space saved
 * from the catalogue already reads as filled here.
 */
export function StudioActions({
  studioId,
  title,
}: {
  studioId: string;
  title: string;
}) {
  const { isSaved, toggle, pendingId } = useWishlist();
  const saved = isSaved(studioId);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied", {
        description: "Paste it anywhere to share this studio.",
      });
    } catch {
      // Dismissing the native share sheet is not a failure worth reporting.
    }
  };

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="outline"
        size="lg"
        className="h-11"
        onClick={() => void share()}
      >
        <Share2Icon />
        Share
      </Button>
      <Button
        variant="outline"
        size="lg"
        className={cn(
          "h-11",
          saved &&
            "border-brand bg-brand text-brand-foreground hover:bg-brand",
        )}
        aria-pressed={saved}
        disabled={pendingId === studioId}
        onClick={() => void toggle(studioId, title)}
      >
        <HeartIcon className={cn(saved && "fill-current")} />
        {saved ? "Saved" : "Wishlist"}
      </Button>
    </div>
  );
}
