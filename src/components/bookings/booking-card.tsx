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
  UsersIcon,
  XCircleIcon,
} from "lucide-react";

import { BookingStatusBadge } from "@/components/booking-status-badge";
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
import { clockTime, currency, imageProps, shortDate } from "@/lib/format";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import type { Booking } from "@/lib/types";

export function BookingCard({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const canCancel = booking.status === "Pending";

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
        <div className="flex flex-wrap items-start justify-between gap-3">
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
          <BookingStatusBadge status={booking.status} />
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
            <MapPinIcon className="size-3.5" />
            {booking.studioCategory}
          </span>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
          <span className="font-heading text-lg">
            {currency(booking.pricingSummary?.totalAmount)}
            <span className="ml-1.5 font-sans text-xs text-muted-foreground">
              total
            </span>
          </span>

          {canCancel ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setOpen(true)}
            >
              <XCircleIcon />
              Cancel booking
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              {booking.status === "Cancelled"
                ? "This booking was cancelled."
                : `A ${booking.status.toLowerCase()} booking can no longer be cancelled.`}
            </span>
          )}
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
