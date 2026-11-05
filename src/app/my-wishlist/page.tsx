import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HeartIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { StudioCard, StudioCardSkeleton } from "@/components/studio-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { getTokenFromServer } from "@/lib/getTokenFromServer";
import type { Studio } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saved studios",
  description:
    "Every studio you saved with the wishlist heart, in one place and tied to your account.",
};

async function SavedStudios() {
  const token = await getTokenFromServer();
  if (!token) redirect("/login?redirect=/my-wishlist");

  let studios: Studio[] = [];
  let reachable = true;
  try {
    studios = await api.getMyWishlist(token);
  } catch {
    reachable = false;
  }

  if (!reachable) {
    return (
      <p className="rounded-lg border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
        The catalogue could not be reached. Start the StudioSpace API on port
        8000 and reload.
      </p>
    );
  }

  if (studios.length === 0) {
    return (
      <EmptyState
        icon={<HeartIcon />}
        title="Nothing saved yet"
        description="Tap the heart on any space to keep it here. Saved studios follow your account, so they are waiting whenever you sign back in."
        actionLabel="Explore studios"
        actionHref="/studios"
      />
    );
  }

  return (
    <>
      <p className="mb-8 text-sm text-muted-foreground">
        {studios.length} {studios.length === 1 ? "space" : "spaces"} saved
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {studios.map((studio) => (
          <StudioCard key={studio._id} studio={studio} />
        ))}
      </div>
    </>
  );
}

function SavedSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <StudioCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default async function MyWishlistPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?redirect=/my-wishlist");

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-[44rem]">
          <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
            Your shortlist
          </p>
          <h1 className="display rise mt-5 text-[clamp(2.25rem,4.6vw,3.75rem)]">
            Saved studios
          </h1>
          <p className="rise-2 mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
            The rooms you flagged while browsing, kept together so a shortlist
            outlives the tab you closed.
          </p>
        </div>
        <Button
          size="lg"
          className="h-11"
          render={<Link href="/studios" />}
          nativeButton={false}
        >
          Explore more studios
        </Button>
      </header>

      <div className="mt-14">
        <Suspense fallback={<SavedSkeleton />}>
          <SavedStudios />
        </Suspense>
      </div>
    </div>
  );
}
