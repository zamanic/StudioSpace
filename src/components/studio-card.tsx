import Link from "next/link";
import Image from "next/image";
import { MapPinIcon, StarIcon, UsersIcon } from "lucide-react";

import { currency, excerpt, imageProps, primaryImage } from "@/lib/format";
import type { Studio } from "@/lib/types";

/**
 * Equal-height catalogue card. The image sits at a fixed ratio and the text
 * block grows, so a grid of these always lines up along the bottom edge.
 */
export function StudioCard({ studio }: { studio: Studio }) {
  const image = primaryImage(studio);
  const rating = Number(studio.rating ?? 0);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-foreground/35">
      <Link
        href={`/studios/${studio._id}`}
        className="relative block aspect-[4/3] overflow-hidden bg-muted"
        aria-label={`View ${studio.title}`}
      >
        <Image
          {...imageProps(image)}
          alt={studio.title}
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw"
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
        />

        {rating > 0 ? (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <StarIcon className="size-3.5 fill-current text-amber-400" />
            {rating.toFixed(1)}
            {studio.reviewCount ? (
              <span className="text-white/70">({studio.reviewCount})</span>
            ) : null}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-[0.68rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          {studio.category}
        </p>

        <h3 className="font-heading text-xl leading-snug">
          <Link
            href={`/studios/${studio._id}`}
            className="transition-opacity hover:opacity-70"
          >
            {studio.title}
          </Link>
        </h3>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {excerpt(studio.tagline || studio.description, 96)}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPinIcon className="size-3.5" />
            {studio.location?.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="size-3.5" />
            Up to {studio.specs?.maxCapacity}
          </span>
        </div>

        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <span className="font-heading text-lg">
            {currency(studio.pricing?.hourlyRate)}
            <span className="ml-1 font-sans text-xs text-muted-foreground">
              / hour
            </span>
          </span>
          <Link
            href={`/studios/${studio._id}`}
            className="text-xs font-medium tracking-[0.06em] uppercase underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export function StudioCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-2.5 w-24 animate-pulse rounded-full bg-muted" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-auto h-5 w-28 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
