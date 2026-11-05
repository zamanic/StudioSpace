"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
  UsersIcon,
  XCircleIcon,
} from "lucide-react";

import { BookingStatusBadge } from "@/components/booking-status-badge";
import { ReceiptButton } from "@/components/bookings/receipt-button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiError, api } from "@/lib/api";
import { addressLine, clockTime, currency, imageProps, shortDate } from "@/lib/format";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import type { Booking } from "@/lib/types";

/** The one line of state a creator needs at a glance, under the actions. */
const statusNotes: Record<string, string> = {
  Pending: "Waiting on the host to confirm your slot.",
  Confirmed: "Confirmed by the host. Deposit held until the session completes.",
  Completed: "Session complete. Deposit released.",
  Cancelled: "This booking was cancelled and its slot was released.",
};

export function BookingCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const canCancel = booking.status === "Pending";
  // A cancelled reservation has no valid receipt, so the button disappears
  // with it rather than sitting there and opening a void invoice.
  const canReceipt = booking.status !== "Cancelled";
  const paid =
    String(booking.payment?.paymentStatus ?? "").toLowerCase() === "paid";
  const address = addressLine(booking.studioLocation);

  const handleCancel = async () => {
    setCancelling(true);
    const token = await getTokenFromClient();
    if (!token) {
      setCancelling(false);
      toast.error("Your session expired. Please sign in again.");
      router.push("/login?redirect=/my-bookings");
      return;
    }

    try {
      await api.cancelBooking(booking._id, token);
      toast.success("Booking cancelled", {
        description: `${booking.bookingNumber} was released.`,
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("Could not reach the server. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <article className="flex flex-col gap-5 rounded-lg border border-border bg-card p-5 sm:flex-row">
      <Link
        href={`/studios/${booking.studioId}`}
        className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-44"
      >
        <Image
          {...imageProps(booking.studioImage || "/studios/photo-studio-cyc.png")}
          alt={booking.studioTitle}
          fill
          sizes="(min-width:640px) 11rem, 92vw"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
          <div className="min-w-0">
            <p className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {booking.bookingNumber}
            </p>
            <h2 className="mt-1.5 font-heading text-lg leading-snug">
              <Link
                href={`/studios/${booking.studioId}`}
                className="hover:opacity-70"
              >
                {booking.studioTitle}
              </Link>
            </h2>
          </div>

          {/* Status and money read as one right-hand column, so the eye lands
              on "what state is this in" and "what did it cost" together. */}
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <BookingStatusBadge status={booking.status} />
            <div className="sm:text-right">
              <p className="text-[0.62rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                {paid ? "Total charged" : "Due"}
              </p>
              <p className="font-heading text-xl leading-tight">
                {currency(booking.pricingSummary?.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {booking.projectDetails?.projectTitle}
        </p>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDaysIcon className="size-3.5" />
            {shortDate(booking.schedule?.bookingDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ClockIcon className="size-3.5" />
            {clockTime(booking.schedule?.startTime)} -{" "}
            {clockTime(booking.schedule?.endTime)} ·{" "}
            {booking.schedule?.totalHours}h
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="size-3.5" />
            {booking.projectDetails?.crewSize} crew
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TagIcon className="size-3.5" />
            {booking.studioCategory}
          </span>
        </div>

        {/* Where the space actually is, right under the session time. Falls
            back to the category when the listing has since been removed. */}
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <MapPinIcon className="mt-0.5 size-3.5 shrink-0" />
          <span className="min-w-0 truncate">
            {address || booking.studioCategory}
          </span>
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            {statusNotes[booking.status] ?? ""}
          </p>

          <div className="flex items-center gap-2">
            {canReceipt ? <ReceiptButton booking={booking} /> : null}
            {canCancel ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setOpen(true)}
              >
                <XCircleIcon />
                Cancel booking
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <XCircleIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {booking.studioTitle} on{" "}
              {shortDate(booking.schedule?.bookingDate)} at{" "}
              {clockTime(booking.schedule?.startTime)} will be released back to
              the host.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep it</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={cancelling}
              onClick={handleCancel}
            >
              {cancelling ? <Spinner /> : null}
              Cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
