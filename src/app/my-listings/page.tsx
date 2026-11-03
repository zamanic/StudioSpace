import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { MyListingCard } from "@/components/studios/my-listing-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { getTokenFromServer } from "@/lib/getTokenFromServer";
import type { Studio } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My studio listings",
};

export default async function MyListingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?redirect=/my-listings");

  const token = await getTokenFromServer();
  if (!token) redirect("/login?redirect=/my-listings");

  let listings: Studio[] = [];
  let reachable = true;
  try {
    listings = await api.getMyListings(token);
  } catch {
    reachable = false;
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-[44rem]">
          <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
            Host tools
          </p>
          <h1 className="display rise mt-5 text-[clamp(2.25rem,4.6vw,3.75rem)]">
            My studio listings
          </h1>
          <p className="rise-2 mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
            Every space you host, in one place. Edit the terms, revise the copy
            or retire a room when it is booked out.
          </p>
        </div>
        <Button
          size="lg"
          className="h-11"
          render={<Link href="/add-studio" />}
          nativeButton={false}
        >
          <PlusIcon />
          Add new studio
        </Button>
      </header>

      <div className="mt-14">
        {!reachable ? (
          <p className="rounded-lg border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
            The catalogue could not be reached. Start the StudioSpace API on
            port 8000 and reload.
          </p>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={<PlusIcon />}
            title="You have not listed a space yet"
            description="Add your first room and it appears on the catalogue straight away, ready for creators to book."
            actionLabel="List your first studio"
            actionHref="/add-studio"
          />
        ) : (
          <>
            <p className="mb-8 text-sm text-muted-foreground">
              {listings.length}{" "}
              {listings.length === 1 ? "listing" : "listings"} published
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((studio) => (
                <MyListingCard key={studio._id} studio={studio} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
