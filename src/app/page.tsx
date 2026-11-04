import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheckIcon,
  HeadphonesIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from "lucide-react";

import { HeroCarousel } from "@/components/home/hero-carousel";
import { EmptyState } from "@/components/empty-state";
import { StudioCard, StudioCardSkeleton } from "@/components/studio-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { imageProps } from "@/lib/format";
import type { Studio } from "@/lib/types";

// Every section reads live catalogue data, so the page is rendered per request.
export const dynamic = "force-dynamic";

const categories = [
  { label: "Photo Studio", image: "/studios/photo-studio-cyc.png" },
  { label: "Sound Stage", image: "/studios/film-stage-crew.jpg" },
  { label: "Film Stage", image: "/studios/film-stage-exterior.jpg" },
  { label: "Podcast Lounge", image: "/studios/podcast-lounge-wcwc.jpg" },
  { label: "Music Suite", image: "/studios/music-suite-desk.jpg" },
  { label: "Workshop", image: "/studios/workshop-pottery.jpg" },
];

const steps = [
  {
    number: "01",
    title: "Discover Spaces",
    body: "Search the catalogue by city, category, capacity and hourly rate until one room fits the shoot.",
  },
  {
    number: "02",
    title: "Select Shoot Hours",
    body: "Choose the date and the hours you need. Times that clash with a confirmed booking are refused.",
  },
  {
    number: "03",
    title: "Book Instantly",
    body: "Your request is saved as pending the moment you send it, and you can cancel it yourself while it waits.",
  },
  {
    number: "04",
    title: "Create & Produce",
    body: "Turn up, set up and shoot. The dimensions, power and included gear are already on the listing.",
  },
];

async function FeaturedStudios() {
  let studios: Studio[] = [];
  let reachable = true;

  try {
    studios = await api.getFeaturedStudios();
  } catch {
    reachable = false;
  }

  if (!reachable) {
    return (
      <p className="rounded-lg border border-dashed border-border px-6 py-14 text-center text-sm text-muted-foreground">
        The catalogue could not be reached. Start the StudioSpace API on port
        8000 and reload.
      </p>
    );
  }

  if (studios.length === 0) {
    return (
      <EmptyState
        title="No studios listed yet"
        description="The catalogue is empty. Seed the database, or be the first host to list a room."
        actionLabel="List your studio"
        actionHref="/add-studio"
      />
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {studios.map((studio) => (
        <StudioCard key={studio._id} studio={studio} />
      ))}
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <StudioCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <HeroCarousel />

      {/* ---------------------------------------------------------- category */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="display max-w-[18ch] text-[clamp(2rem,3.6vw,3.25rem)]">
            Browse by studio category
          </h2>
          <p className="max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
            Every listing is sorted into a category so you know what you are
            walking into before you pay a deposit.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.label}
              href={`/studios?category=${encodeURIComponent(category.label)}`}
              className="group relative isolate block aspect-[3/4] overflow-hidden rounded-lg bg-muted"
            >
              <Image
                {...imageProps(category.image)}
                alt={category.label}
                fill
                sizes="(min-width:1024px) 19vw, 45vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-4 font-heading text-lg text-white">
                {category.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
        <div className="rule" />
      </div>

      {/* ---------------------------------------------------------- featured */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
              Selected spaces
            </p>
            <h2 className="display mt-4 text-[clamp(2rem,3.6vw,3.25rem)]">
              Featured this month
            </h2>
          </div>
          <Button
            variant="outline"
            size="lg"
            render={<Link href="/studios" />}
            nativeButton={false}
          >
            Browse all studios
          </Button>
        </div>

        <div className="mt-12">
          <Suspense fallback={<FeaturedSkeleton />}>
            <FeaturedStudios />
          </Suspense>
        </div>
      </section>

      {/* ------------------------------------------------------- how it works */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
          <h2 className="display max-w-[20ch] text-[clamp(2rem,3.6vw,3.25rem)]">
            How booking works
          </h2>

          <ol className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <li key={step.number} className="flex flex-col">
                <span className="display text-[clamp(2.5rem,4vw,3.5rem)] text-muted-foreground/60">
                  {step.number}
                </span>
                <span className="rule mt-5" />
                <h3 className="mt-5 font-heading text-xl">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-14">
            <Button
              size="lg"
              render={<Link href="/how-it-works" />}
              nativeButton={false}
            >
              Read the full process
            </Button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- guarantee */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            <Image
              {...imageProps("/studios/podcast-lounge-podcave.jpg")}
              alt="A podcast lounge set up and ready to record"
              fill
              sizes="(min-width:1024px) 46vw, 92vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
              Host guarantee and creator support
            </p>
            <h2 className="display mt-4 max-w-[20ch] text-[clamp(2rem,3.4vw,3rem)]">
              Built for both sides of the booking
            </h2>

            <ul className="mt-10 flex flex-col gap-7">
              <li className="flex gap-4">
                <ShieldCheckIcon className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <h3 className="font-heading text-lg">Liability protection</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Every confirmed booking is covered against accidental damage
                    to the space, so a shoot day never turns into a repair bill.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <BadgeCheckIcon className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <h3 className="font-heading text-lg">Verified profiles</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Hosts and creators sign in through a verified account, and
                    only the host who listed a space can edit or remove it.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <WrenchIcon className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <h3 className="font-heading text-lg">Equipment safety</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Included gear is listed on every space and the deposit is
                    held with the booking, then released once the session ends.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <HeadphonesIcon className="mt-0.5 size-5 shrink-0 text-brand" />
                <div>
                  <h3 className="font-heading text-lg">24/7 host support</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    A real person reads every booking note around the clock, so
                    a question at midnight still gets an answer.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- cta */}
      <section className="bg-brand text-brand-foreground">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-5 py-20 sm:px-8 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="display max-w-[22ch] text-[clamp(2.25rem,4.4vw,3.75rem)]">
              Your next shoot is a room away
            </h2>
            <p className="mt-6 max-w-[46ch] text-[0.95rem] leading-relaxed opacity-90">
              Browse the catalogue as a guest. Sign in only when you are ready
              to hold a date or list a space of your own.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              variant="secondary"
              className="h-11 px-6"
              render={<Link href="/studios" />}
              nativeButton={false}
            >
              Explore Studios
            </Button>
            <Link
              href="/add-studio"
              className="text-sm underline decoration-current/40 underline-offset-4 transition-opacity hover:opacity-80"
            >
              Host Your Space
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
