import Link from "next/link";
import {
  CalendarClockIcon,
  ClapperboardIcon,
  CreditCardIcon,
  SearchIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How it works",
  description:
    "How StudioSpace takes a shoot from searching for a room to a confirmed booking.",
};

const steps = [
  {
    number: "01",
    title: "Discover Spaces",
    icon: SearchIcon,
    body: "Filter the catalogue by city, category, headcount and hourly rate. Every listing is written by the host who owns the space, so the dimensions and the power supply are real.",
    detail:
      "Categories cover the six kinds of workspace on the platform: photo studios, sound stages, film stages, podcast lounges, music suites and workshops.",
  },
  {
    number: "02",
    title: "Select Shoot Hours",
    icon: CalendarClockIcon,
    body: "Ceiling height, floor area, sound rating, load-in access and the gear that comes included. The details that decide whether a production day runs smoothly are on the listing, not buried in a message thread.",
    detail:
      "Confirmed sessions are shown on the listing, so you can see which slots are already held before you ask for one.",
  },
  {
    number: "03",
    title: "Book Instantly",
    icon: CreditCardIcon,
    body: "Choose the date and the hours. The API checks the request against every confirmed booking on that space and refuses a clash with a clear message rather than a silent double-booking.",
    detail:
      "Each studio sets its own minimum booking length, shown on the price panel before you commit.",
  },
  {
    number: "04",
    title: "Create & Produce",
    icon: ClapperboardIcon,
    body: "Your request is saved as pending and the host is notified. While it is pending you can cancel it yourself; once it is confirmed the terms are locked in for both sides.",
    detail:
      "The security deposit is recorded with the booking and released once the host marks the session complete.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1400px] px-5 pt-16 pb-14 sm:px-8 sm:pt-24">
        <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          The process
        </p>
        <h1 className="display rise mt-5 max-w-[20ch] text-[clamp(2.5rem,5.4vw,4.5rem)]">
          From a search to a set, in four moves
        </h1>
        <p className="rise-2 mt-6 max-w-[54ch] text-[0.95rem] leading-relaxed text-muted-foreground">
          StudioSpace is deliberately plain about this: you find a room, you
          check the facts, you hold a slot, you shoot. No back-and-forth for
          information that should already be public.
        </p>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-5 pb-20 sm:px-8 sm:pb-28">
        <ol className="flex flex-col">
          {steps.map((step) => (
            <li
              key={step.number}
              className="grid gap-6 border-t border-border py-12 lg:grid-cols-[120px_minmax(0,1fr)_minmax(0,22rem)] lg:gap-12"
            >
              <div className="flex items-baseline gap-4 lg:flex-col lg:gap-5">
                <span className="display text-[clamp(2.5rem,4vw,3.5rem)] text-muted-foreground/50">
                  {step.number}
                </span>
                <step.icon className="size-5 text-brand" />
              </div>

              <div>
                <h2 className="font-heading text-2xl">{step.title}</h2>
                <p className="mt-4 max-w-[52ch] text-[0.95rem] leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>

              <p className="text-sm leading-relaxed text-muted-foreground lg:border-l lg:border-border lg:pl-8">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <div>
            <ShieldCheckIcon className="size-6 text-brand" />
            <h2 className="display mt-6 max-w-[18ch] text-[clamp(1.8rem,3.2vw,2.75rem)]">
              What protects both sides
            </h2>
            <p className="mt-5 max-w-[46ch] text-[0.95rem] leading-relaxed text-muted-foreground">
              Ownership is checked on the server, not in the browser. A listing
              can only be edited or removed by the account that published it,
              and a booking only by the creator who made it.
            </p>
          </div>

          <ul className="flex flex-col gap-6">
            <li className="border-t border-border pt-5">
              <h3 className="font-heading text-lg">Signed requests</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Every write carries a signed token issued when you sign in. The
                API verifies it before a single document is touched.
              </p>
            </li>
            <li className="border-t border-border pt-5">
              <h3 className="font-heading text-lg">No double bookings</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Overlapping a confirmed session returns a conflict, not a
                broken promise. The room is never sold twice for the same hour.
              </p>
            </li>
            <li className="border-t border-border pt-5">
              <h3 className="font-heading text-lg">You stay in control</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Pending requests can be cancelled from your own dashboard. Hosts
                keep their calendar, creators keep their options.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-5 py-20 sm:px-8 sm:py-24">
        <h2 className="display max-w-[18ch] text-[clamp(1.8rem,3.4vw,2.75rem)]">
          Ready to see what is available?
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            className="h-11"
            render={<Link href="/studios" />}
            nativeButton={false}
          >
            Explore studios
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11"
            render={<Link href="/add-studio" />}
            nativeButton={false}
          >
            List your own space
          </Button>
        </div>
      </section>
    </>
  );
}
