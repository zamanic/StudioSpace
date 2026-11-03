import { cn } from "cn";

import type { BookingStatus } from "@/lib/types";

/**
 * One colour language for the four booking states, used on /my-bookings and
 * the studio detail page:
 *   Pending   - waiting on the host (neutral, the only cancellable state)
 *   Confirmed - the slot is held (teal, the app's one accent)
 *   Completed - the session happened (quiet, filled)
 *   Cancelled - no longer active (struck through, muted)
 */
const styles: Record<BookingStatus, string> = {
  Pending: "border-border text-foreground",
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
      {status}
    </span>
  );
}
