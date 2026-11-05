import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRightIcon,
  AudioWaveformIcon,
  BadgeCheckIcon,
  CameraIcon,
  CalendarClockIcon,
  ClapperboardIcon,
  CreditCardIcon,
  Disc3Icon,
  HeadphonesIcon,
  MicIcon,
  PaintbrushIcon,
  SearchIcon,
  ShieldCheckIcon,
  WrenchIcon,
} from "lucide-react";

import { HeroCarousel } from "@/components/home/hero-carousel";
import { EmptyState } from "@/components/empty-state";
import { StudioCard, StudioCardSkeleton } from "@/components/studio-card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { imageProps } from "@/lib/format";
import type { CatalogueStats, Studio } from "@/lib/types";

// Every section reads live catalogue data, so the page is rendered per request.
export const dynamic = "force-dynamic";

/** The anchor pattern shared by every section eyebrow. */
const tagClass =
  "text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase";

const categories = [
  {
    label: "Photo Studio",
    image: "/studios/photo-studio-cyc.png",
    icon: CameraIcon,
    description:
      "Cyc walls, seamless backdrops and lighting rigs already set up to shoot.",
  },
  {
    label: "Sound Stage",
    image: "/studios/film-stage-crew.jpg",
    icon: AudioWaveformIcon,
    description:
      "Acoustically treated stage floors big enough for set, crew and camera.",
  },
  {
    label: "Film Stage",
    image: "/studios/film-stage-exterior.jpg",
    icon: ClapperboardIcon,
    description:
      "Large-format stages with load-in access and three-phase grid power.",
  },
  {
    label: "Podcast Lounge",
    image: "/studios/podcast-lounge-wcwc.jpg",
    icon: MicIcon,
    description:
      "Treated rooms with mics, mixers and a multi-camera set-up ready to record.",
  },
  {
    label: "Music Suite",
    image: "/studios/music-suite-desk.jpg",
    icon: Disc3Icon,
    description:
      "Control rooms and live rooms wired for tracking, mixing and mastering.",
  },
  {
    label: "Workshop",
    image: "/studios/workshop-pottery.jpg",
    icon: PaintbrushIcon,
    description:
      "Making spaces with solid benches, extraction and secure tool storage.",
  },
];

const steps = [
  {
    number: "01",
    title: "Discover Spaces",
    icon: SearchIcon,
    body: "Search the catalogue by city, category, capacity and hourly rate until one room fits the shoot.",
  },
  {
    number: "02",
    title: "Select Shoot Hours",
    icon: CalendarClockIcon,
    body: "Choose the date and the hours you need. Times that clash with a confirmed booking are refused.",
  },
  {
    number: "03",
    title: "Book Instantly",
    icon: CreditCardIcon,
    body: "Your request is saved as pending the moment you send it, and you can cancel it yourself while it waits.",
  },
  {
    number: "04",
    title: "Create & Produce",
    icon: ClapperboardIcon,
    body: "Turn up, set up and shoot. The dimensions, power and included gear are already on the listing.",
  },
];

const guaranteePillars = [
  {
    icon: ShieldCheckIcon,
    title: "Host liability protection",
    body: "Every confirmed booking is covered against accidental damage to the space, up to $1,000,000 in host liability protection.",
  },
  {
    icon: BadgeCheckIcon,
    title: "Identity & professional verification",
    body: "Hosts and creators sign in through a verified account, and only the host who listed a space can edit or remove it.",
  },
  {
    icon: WrenchIcon,
    title: "Production equipment safeguard",
    body: "Included gear is listed on every space, and the deposit is held with the booking then released once the session ends.",
  },
  {
    icon: HeadphonesIcon,
    title: "24/7 dedicated production concierge",
    body: "A real person reads every booking note around the clock, so a question at midnight still gets an answer.",
  },
];

async function CategoryGrid() {
  let stats: CatalogueStats | null = null;
  try {
    stats = await api.getStats();
  } catch {
    stats = null;
  }

  const counts = new Map<string, number>();
  stats?.byCategory.forEach((row) => counts.set(row.category, row.count));

  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const count = counts.get(category.label);
        const Icon = category.icon;

        return (
          <Link
            key={category.label}
            href={`/studios?category=${encodeURIComponent(category.label)}`}
            className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-foreground/35"
          >
            <span className="relative block aspect-[16/9] overflow-hidden bg-muted">
              <Image
                {...imageProps(category.image)}
                alt={category.label}
                fill
                sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className="absolute top-3 left-3 inline-flex items-center rounded-full bg-black/60 px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.12em] text-white uppercase backdrop-blur-sm">
                {count === undefined
                  ? "New spaces"
                  : `${count} ${count === 1 ? "Space" : "Spaces"}`}
              </span>
            </span>

            <span className="flex flex-1 flex-col gap-3 p-5">
              <span className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
                  <Icon className="size-[1.05rem]" />
                </span>
                <span className="font-heading text-lg transition-colors duration-300 group-hover:text-brand">
                  {category.label}
                </span>
              </span>

              <span className="text-sm leading-relaxed text-muted-foreground">
                {category.description}
              </span>

              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[0.68rem] font-medium tracking-[0.16em] text-brand uppercase">
                Explore
                <ArrowRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card"
        >
          <div className="aspect-[16/9] animate-pulse bg-muted" />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div className="h-9 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

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
          <div>
            <p className={tagClass}>Curated production categories</p>
            <h2 className="display mt-4 max-w-[18ch] text-[clamp(2rem,3.6vw,3.25rem)]">
              Browse by studio category
            </h2>
          </div>
          <Link
            href="/studios"
            className="group inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-brand"
          >
            Explore All Workspaces
            <ArrowRightIcon className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>

        <p className="mt-6 max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
          Every listing is sorted into a category so you know exactly what you
          are walking into before you pay a deposit.
        </p>

        <Suspense fallback={<CategorySkeleton />}>
          <CategoryGrid />
        </Suspense>
      </section>

      <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
        <div className="rule" />
      </div>

      {/* ---------------------------------------------------------- featured */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className={tagClass}>Curated selection (MongoDB .limit(6))</p>
            <h2 className="display mt-4 max-w-[20ch] text-[clamp(2rem,3.6vw,3.25rem)]">
              Featured Creative Workspaces
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

        <p className="mt-6 max-w-[62ch] text-sm leading-relaxed text-muted-foreground">
          Six rooms pulled straight from the catalogue in one MongoDB query —
          the best-rated spaces across every discipline, with the hourly rate
          and the security deposit on the card.
        </p>

        <div className="mt-12">
          <Suspense fallback={<FeaturedSkeleton />}>
            <FeaturedStudios />
          </Suspense>
        </div>
      </section>

      {/* ------------------------------------------------------- how it works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-y border-border bg-card"
      >
        <div className="mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24">
          <p className={tagClass}>Frictionless booking</p>
          <h2 className="display mt-4 max-w-[20ch] text-[clamp(2rem,3.6vw,3.25rem)]">
            How StudioSpace Works
          </h2>
          <p className="mt-6 max-w-[58ch] text-sm leading-relaxed text-muted-foreground">
            Four moves and no guesswork: find the room, hold the hours, book it
            instantly, then get on with the shoot.
          </p>

          <ol className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Connector: only the gaps between the cards show this hairline,
                so the four steps read as one sequence. */}
            <span
              aria-hidden="true"
              className="absolute top-[2.9rem] right-10 left-10 hidden h-px bg-border lg:block"
            />
            {steps.map((step) => (
              <li key={step.number} className="relative z-10 h-full">
                <Link
                  href="/how-it-works"
                  className="group flex h-full flex-col rounded-lg border border-border bg-background p-6 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/35"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-11 items-center justify-center rounded-md bg-brand/10 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
                      <step.icon className="size-5" />
                    </span>
                    <span className="display text-[clamp(1.9rem,3vw,2.4rem)] text-muted-foreground/45">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-6 font-heading text-lg transition-colors duration-300 group-hover:text-brand">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[0.68rem] font-medium tracking-[0.16em] text-brand uppercase">
                    Read the step
                    <ArrowRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <div className="mt-12">
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
      <section
        id="about"
        className="scroll-mt-20 mx-auto w-full max-w-[1400px] px-5 py-20 sm:px-8 sm:py-24"
      >
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
            <Image
              {...imageProps("/studios/music-suite-console.jpg")}
              alt="A large analogue mixing console inside a production suite"
              fill
              sizes="(min-width:1024px) 46vw, 92vw"
              className="object-cover"
            />
          </div>

          <div>
            <p className={tagClass}>Trust, safety &amp; peace of mind</p>
            <h2 className="display mt-4 max-w-[22ch] text-[clamp(2rem,3.4vw,3rem)]">
              Built on uncompromising protection for both hosts &amp; creators
            </h2>
            <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
              A shoot day is expensive to get wrong. Every booking on
              StudioSpace carries the same cover, the same verified accounts and
              the same promise that a question will be answered.
            </p>

            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {guaranteePillars.map((pillar) => (
                <li key={pillar.title} className="h-full">
                  <Link
                    href="/about"
                    className="group flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors duration-300 hover:border-foreground/35"
                  >
                    <span className="flex size-9 items-center justify-center rounded-md bg-brand/10 text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
                      <pillar.icon className="size-[1.05rem]" />
                    </span>
                    <h3 className="font-heading text-base leading-snug transition-colors duration-300 group-hover:text-brand">
                      {pillar.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {pillar.body}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="h-11 px-5"
                render={<Link href="/add-studio" />}
                nativeButton={false}
              >
                Become a Verified Host
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-5"
                render={<Link href="/studios" />}
                nativeButton={false}
              >
                Browse Protected Spaces
              </Button>
            </div>
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
