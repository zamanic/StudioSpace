"use client";

import { useMemo } from "react";

import { StudioCard } from "@/components/studio-card";
import { useWishlist } from "@/components/wishlist-provider";
import type { Studio } from "@/lib/types";

/**
 * Saved studios stay inside the current filtered result set, but float to the
 * top for signed-in creators so the spaces they favour are easier to revisit.
 */
export function StudiosGrid({ studios }: { studios: Studio[] }) {
  const { isSaved } = useWishlist();

  const ordered = useMemo(() => {
    return [...studios].sort((left, right) => {
      const leftSaved = isSaved(left._id) ? 1 : 0;
      const rightSaved = isSaved(right._id) ? 1 : 0;
      return rightSaved - leftSaved;
    });
  }, [isSaved, studios]);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {ordered.map((studio) => (
        <StudioCard key={studio._id} studio={studio} />
      ))}
    </div>
  );
}
