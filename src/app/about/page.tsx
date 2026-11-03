import Image from "next/image";
import Link from "next/link";
import { CompassIcon, HandshakeIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { currency, imageProps } from "@/lib/format";
import type { CatalogueStats } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About us",
  description:
    "Why StudioSpace exists and how the catalogue is put together.",
};

async function CatalogueNumbers() {
  let stats: CatalogueStats | null = null;
  try {
    stats = await api.getStats();
  } catch {
    stats = null;
  }

  if (!stats) {
    return (
      <p className="rounded-lg border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
        Live catalogue numbers are unavailable while the API on port 8000 is
        offline.
      </p>
    );
  }

  const maxCount = Math.max(1, ...stats.byCategory.map((row) => row.count));

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-10">
        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <dt className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Spaces listed
          </dt>
          <dd className="display text-[clamp(2rem,3.6vw,3rem)]">
            {stats.pricing.listings}
          </dd>
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <dt className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Average hourly
          </dt>
          <dd className="display text-[clamp(2rem,3.6vw,3rem)]">
            {currency(stats.pricing.averageHourlyRate)}
          </dd>
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <dt className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Cheapest room
          </dt>
          <dd className="text-lg">{currency(stats.pricing.cheapest)}/hr</dd>
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-5">
          <dt className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Priciest room
          </dt>
          <dd className="text-lg">{currency(stats.pricing.priciest)}/hr</dd>
        </div>
      </dl>

      <div>
        <h3 className="font-heading text-xl">What the catalogue holds</h3>
        <ul className="mt-6 flex flex-col gap-5">
          {stats.byCategory.map((row) => (
            <li key={row.category} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span>{row.category}</span>
                <span className="text-muted-foreground">{row.count}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${(row.count / maxCount) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1400px] px-5 pt-16 pb-16 sm:px-8 sm:pt-24">
        <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          About us
        </p>
        <h1 className="display rise mt-5 max-w-[20ch] text-[clamp(2.5rem,5.4vw,4.5rem)]">
          Rooms worth the trip
        </h1>
        <p className="rise-2 mt-6 max-w-[56ch] text-[0.95rem] leading-relaxed text-muted-foreground">
          StudioSpace is a peer-to-peer marketplace for creative workspaces.
          Photographers with a spare cyc wall list it by the hour; producers
          looking for a sound stage three streets away find it the same
          afternoon. The platform stays out of the way and keeps the details
          honest.
        </p>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
          <h2 className="display max-w-[20ch] text-[clamp(1.8rem,3.4vw,2.75rem)]">
            The catalogue, in numbers
          </h2>
          <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
            Pulled live from the database: one aggregation over the whole
            collection, counting each category and pricing the range.
          </p>
          <div className="mt-14">
            <CatalogueNumbers />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-[1400px] items-center gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          <Image
            {...imageProps("/studios/film-stage-crew.jpg")}
            alt="A crew setting up lighting on a film stage"
            fill
            sizes="(min-width:1024px) 46vw, 92vw"
            className="object-cover"
          />
        </div>

        <div>
          <h2 className="display max-w-[18ch] text-[clamp(1.8rem,3.4vw,2.75rem)]">
            Three things we refuse to compromise on
          </h2>
          <ul className="mt-10 flex flex-col gap-7">
            <li className="flex gap-4">
              <HandshakeIcon className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <h3 className="font-heading text-lg">Honest listings</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  The host writes the copy. Real dimensions, real power supply,
                  real access notes - the things that decide a shoot.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <CompassIcon className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <h3 className="font-heading text-lg">Fair discovery</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Small rooms sit next to big stages. Sorting is by price,
                  freshness or rating, never by who paid the most.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <SparklesIcon className="mt-0.5 size-5 shrink-0 text-brand" />
              <div>
                <h3 className="font-heading text-lg">Clear money</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  Hourly rate, deposit, cleaning and service fee are itemised
                  before you request a slot. No surprise at checkout.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      <section className="bg-brand text-brand-foreground">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 py-20 sm:px-8 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="display max-w-[22ch] text-[clamp(2.25rem,4.4vw,3.75rem)]">
            Put your room on the map
          </h2>
          <Button
            size="lg"
            variant="secondary"
            className="h-11"
            render={<Link href="/add-studio" />}
            nativeButton={false}
          >
            List a studio
          </Button>
        </div>
      </section>
    </>
  );
}
