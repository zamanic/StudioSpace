"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CalendarCheckIcon,
  CalendarClockIcon,
  ClockIcon,
  PencilIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api } from "@/lib/api";
import {
  clockTime,
  currency,
  hoursBetween,
  primaryImage,
  shortDate,
} from "@/lib/format";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import type { AvailabilitySlot, Studio } from "@/lib/types";

const PLATFORM_FEE_RATE = 0.05;

const todayIso = () => new Date().toISOString().slice(0, 10);

function overlaps(
  slot: AvailabilitySlot,
  bookingDate: string,
  startTime: string,
  endTime: string,
) {
  return (
    slot.bookingDate === bookingDate &&
    startTime < slot.endTime &&
    endTime > slot.startTime
  );
}

export function BookingPanel({
  studio,
  availability,
  isAuthenticated,
  isOwner,
}: {
  studio: Studio;
  availability: AvailabilitySlot[];
  isAuthenticated: boolean;
  isOwner: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    bookingDate: "",
    startTime: "",
    endTime: "",
    projectTitle: "",
    crewSize: "2",
    specialRequirements: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hourlyRate = Number(studio.pricing?.hourlyRate ?? 0);
  const securityDeposit = Number(studio.pricing?.securityDeposit ?? 0);
  const cleaningFee = Number(studio.pricing?.cleaningFee ?? 0);
  const minimumHours = Number(studio.pricing?.minimumHours ?? 1);

  const totalHours = hoursBetween(form.startTime, form.endTime);

  const pricing = useMemo(() => {
    const subtotal = Number((hourlyRate * totalHours).toFixed(2));
    const platformFee = Number((subtotal * PLATFORM_FEE_RATE).toFixed(2));
    return {
      hourlyRate,
      subtotal,
      securityDeposit,
      cleaningFee,
      platformFee,
      totalAmount: Number(
        (subtotal + securityDeposit + cleaningFee + platformFee).toFixed(2),
      ),
    };
  }, [hourlyRate, totalHours, securityDeposit, cleaningFee]);

  const clashes = form.bookingDate
    ? availability.filter((slot) =>
        overlaps(
          slot,
          form.bookingDate,
          form.startTime || "00:00",
          form.endTime || "23:59",
        ),
      )
    : [];

  const set = (key: keyof typeof form) => (value: string) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.bookingDate) next.bookingDate = "Pick a date for the session.";
    if (!form.startTime) next.startTime = "Choose a start time.";
    if (!form.endTime) next.endTime = "Choose an end time.";
    if (form.startTime && form.endTime && totalHours <= 0) {
      next.endTime = "The end time must be later than the start time.";
    } else if (totalHours > 0 && totalHours < minimumHours) {
      next.endTime = `This studio has a ${minimumHours}h minimum booking.`;
    }
    if (form.projectTitle.trim().length < 3) {
      next.projectTitle = "Give the project a name of at least 3 characters.";
    }
    if (form.bookingDate && totalHours > 0 && clashes.length > 0) {
      next.endTime = `That slot clashes with a confirmed booking (${clockTime(clashes[0].startTime)} - ${clockTime(clashes[0].endTime)}).`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const token = await getTokenFromClient();
    if (!token) {
      setSubmitting(false);
      toast.error("Your session expired. Please sign in again.");
      router.push(`/login?redirect=/studios/${studio._id}`);
      return;
    }

    try {
      await api.createBooking(
        {
          studioId: studio._id,
          studioTitle: studio.title,
          studioCategory: String(studio.category),
          studioImage: primaryImage(studio),
          schedule: {
            bookingDate: form.bookingDate,
            startTime: form.startTime,
            endTime: form.endTime,
            timezone: "Asia/Dhaka",
          },
          projectDetails: {
            projectTitle: form.projectTitle.trim(),
            crewSize: Number(form.crewSize) || 1,
            specialRequirements: form.specialRequirements.trim(),
          },
          pricingSummary: pricing,
        },
        token,
      );

      toast.success("Booking requested", {
        description: `${shortDate(form.bookingDate)} · ${clockTime(form.startTime)} - ${clockTime(form.endTime)}`,
      });
      setOpen(false);
      setForm({
        bookingDate: "",
        startTime: "",
        endTime: "",
        projectTitle: "",
        crewSize: "2",
        specialRequirements: "",
      });
      router.push("/my-bookings");
    } catch (error) {
      if (error instanceof ApiError && error.code === "DOUBLE_BOOKING") {
        toast.error("That slot is already taken", {
          description: error.message,
        });
        setErrors((previous) => ({ ...previous, endTime: error.message }));
      } else if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error("Could not reach the server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openDialog = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/studios/${studio._id}`);
      return;
    }
    setErrors({});
    setOpen(true);
  };

  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-baseline gap-2">
          <span className="display text-[2rem]">{currency(hourlyRate)}</span>
          <span className="text-sm text-muted-foreground">per hour</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {minimumHours}h minimum · {currency(securityDeposit)} refundable
          deposit
        </p>

        <dl className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Cleaning fee</dt>
            <dd>{cleaningFee > 0 ? currency(cleaningFee) : "Included"}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Service fee</dt>
            <dd>{PLATFORM_FEE_RATE * 100}% of subtotal</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Capacity</dt>
            <dd>Up to {studio.specs?.maxCapacity}</dd>
          </div>
        </dl>

        {isOwner ? (
          <div className="mt-6 flex flex-col gap-3">
            <p className="rounded-md border border-dashed border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              You host this space, so you cannot book it yourself.
            </p>
            <Button
              variant="outline"
              size="lg"
              className="h-11 w-full"
              render={<Link href={`/studios/edit/${studio._id}`} />}
              nativeButton={false}
            >
              <PencilIcon />
              Edit this listing
            </Button>
          </div>
        ) : (
          <Button
            size="lg"
            className="mt-6 h-11 w-full"
            onClick={openDialog}
            aria-haspopup="dialog"
          >
            <CalendarCheckIcon />
            {isAuthenticated ? "Book workspace now" : "Sign in to book"}
          </Button>
        )}

        <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0 text-brand" />
          Deposits are held against the booking and released once the host marks
          the session complete.
        </p>
      </div>

      {availability.length > 0 ? (
        <div className="mt-4 rounded-lg border border-border bg-card p-6">
          <h2 className="flex items-center gap-2 font-heading text-base">
            <CalendarClockIcon className="size-4 text-brand" />
            Already held
          </h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {availability.slice(0, 6).map((slot, index) => (
              <li
                key={`${slot.bookingDate}-${slot.startTime}-${index}`}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-muted-foreground">
                  {shortDate(slot.bookingDate)}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <ClockIcon className="size-3.5 text-muted-foreground" />
                  {clockTime(slot.startTime)} - {clockTime(slot.endTime)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request a booking</DialogTitle>
            <DialogDescription>
              {studio.title} · you will not be charged until the host confirms.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="booking-date">Date</Label>
              <Input
                id="booking-date"
                type="date"
                min={todayIso()}
                value={form.bookingDate}
                aria-invalid={Boolean(errors.bookingDate)}
                onChange={(event) => set("bookingDate")(event.target.value)}
              />
              {errors.bookingDate ? (
                <p className="text-xs text-destructive">{errors.bookingDate}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-start">Start time</Label>
                <Input
                  id="booking-start"
                  type="time"
                  value={form.startTime}
                  aria-invalid={Boolean(errors.startTime)}
                  onChange={(event) => set("startTime")(event.target.value)}
                />
                {errors.startTime ? (
                  <p className="text-xs text-destructive">{errors.startTime}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="booking-end">End time</Label>
                <Input
                  id="booking-end"
                  type="time"
                  value={form.endTime}
                  aria-invalid={Boolean(errors.endTime)}
                  onChange={(event) => set("endTime")(event.target.value)}
                />
                {errors.endTime ? (
                  <p className="text-xs text-destructive">{errors.endTime}</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="booking-project">Project title</Label>
              <Input
                id="booking-project"
                value={form.projectTitle}
                placeholder="e.g. Autumn lookbook shoot"
                aria-invalid={Boolean(errors.projectTitle)}
                onChange={(event) => set("projectTitle")(event.target.value)}
              />
              {errors.projectTitle ? (
                <p className="text-xs text-destructive">
                  {errors.projectTitle}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="booking-crew">Crew size</Label>
              <Input
                id="booking-crew"
                type="number"
                min={1}
                max={studio.specs?.maxCapacity ?? 999}
                value={form.crewSize}
                onChange={(event) => set("crewSize")(event.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="booking-notes">
                Anything the host should know
              </Label>
              <Textarea
                id="booking-notes"
                rows={3}
                value={form.specialRequirements}
                placeholder="Load-in access, power needs, equipment drop-off..."
                onChange={(event) =>
                  set("specialRequirements")(event.target.value)
                }
              />
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {currency(hourlyRate)} × {totalHours || 0}h
                </span>
                <span>{currency(pricing.subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Security deposit</span>
                <span>{currency(pricing.securityDeposit)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Cleaning fee</span>
                <span>{currency(pricing.cleaningFee)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Service fee</span>
                <span>{currency(pricing.platformFee)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 font-medium">
                <span>Total</span>
                <span className="display text-lg">
                  {currency(pricing.totalAmount)}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Spinner /> : null}
                Request booking
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
