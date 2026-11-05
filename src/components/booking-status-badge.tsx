import { cn } from "cn";

import type { BookingStatus } from "@/lib/types";

/**
 * One colour language for the four booking states, used on /my-bookings and
 * the studio detail page:
 *   Pending   - waiting on the host (amber, the only cancellable state)
 *   Confirmed - the slot is held (teal, the app's one accent)
 *   Completed - the session happened (quiet, filled)
 *   Cancelled - no longer active (struck through, muted)
 *
 * The stored status stays the short machine value ("Pending"); only the label
 * a creator reads is expanded, so the server contract never changes.
 */
const labels: Record<BookingStatus, string> = {
  Pending: "Pending Host Approval",
  Confirmed: "Confirmed",
  Completed: "Completed",
  Cancelled: "Cancelled",
};

const styles: Record<BookingStatus, string> = {
  Pending: "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Confirmed: "border-transparent bg-brand text-brand-foreground",
  Completed: "border-transparent bg-primary text-primary-foreground",
  Cancelled: "border-border text-muted-foreground line-through",
};

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-[0.7rem] font-medium tracking-[0.08em] uppercase",
        styles[status] ?? styles.Pending,
        className,
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
