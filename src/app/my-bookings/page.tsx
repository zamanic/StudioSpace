import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarCheckIcon } from "lucide-react";

import { BookingCard } from "@/components/bookings/booking-card";
import { EmptyState } from "@/components/empty-state";
import { api } from "@/lib/api";
import { auth } from "@/lib/auth";
import { getTokenFromServer } from "@/lib/getTokenFromServer";
import type { Booking } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My bookings",
};

const statusOrder = ["Pending", "Confirmed", "Completed", "Cancelled"];

export default async function MyBookingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?redirect=/my-bookings");

  const token = await getTokenFromServer();
  if (!token) redirect("/login?redirect=/my-bookings");

  let bookings: Booking[] = [];
  let reachable = true;
  try {
    bookings = await api.getMyBookings(token);
  } catch {
    reachable = false;
  }

  const sorted = [...bookings].sort(
    (a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status),
  );

  const pendingCount = bookings.filter((b) => b.status === "Pending").length;

  return (
    <div className="mx-auto w-full max-w-[1100px] px-5 py-14 sm:px-8 sm:py-20">
      <header className="max-w-[44rem]">
        <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          Creator tools
        </p>
        <h1 className="display rise mt-5 text-[clamp(2.25rem,4.6vw,3.75rem)]">
          My bookings
        </h1>
        <p className="rise-2 mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
          {pendingCount > 0
            ? `${pendingCount} ${pendingCount === 1 ? "request is" : "requests are"} still waiting on a host. Anything pending can be cancelled from here.`
            : "Every session you have held on StudioSpace, with its current status."}
        </p>
      </header>

      <div className="mt-14">
        {!reachable ? (
          <p className="rounded-lg border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
            Your bookings could not be loaded. Start the StudioSpace API on port
            8000 and reload.
          </p>
        ) : sorted.length === 0 ? (
          <EmptyState
            icon={<CalendarCheckIcon />}
            title="No bookings yet"
            description="Find a room, pick a slot and your requests will collect here with their status."
            actionLabel="Explore studios"
            actionHref="/studios"
          />
        ) : (
          <div className="flex flex-col gap-5">
            {sorted.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))}
          </div>
        )}

        {sorted.length > 0 ? (
          <div className="mt-10">
            <Link
              href="/studios"
              className="text-sm underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Book another space
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
