import Link from "next/link";
import Image from "next/image";
import {
  ArrowRightIcon,
  BadgeDollarSignIcon,
  MapPinIcon,
  StarIcon,
  UsersIcon,
} from "lucide-react";

import { WishlistButton } from "@/components/wishlist-button";
import { currency, excerpt, imageProps, primaryImage } from "@/lib/format";
import type { Studio } from "@/lib/types";

/** "450 Production Way, Dhaka, Dhaka Division" - reads like a postal address. */
function addressLine(studio: Studio) {
  return [studio.location?.address, studio.location?.city, studio.location?.state]
    .filter(Boolean)
    .join(", ");
}

/**
 * Equal-height catalogue card. The image carries the four corner facts - the
 * category, the saved-studio heart, the hourly rate and the rating - so the
 * text block below is free to hold only what a decision needs: where it is,
 * what it is, and how much space and deposit it takes.
 */
export function StudioCard({ studio }: { studio: Studio }) {
  const href = `/studios/${studio._id}`;
  const rating = Number(studio.rating ?? 0);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-foreground/35">
      {/* ------------------------------------------------------------- image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Link
          href={href}
          className="absolute inset-0"
          aria-label={`View ${studio.title}`}
        >
          <Image
            {...imageProps(primaryImage(studio))}
            alt={studio.title}
            fill
            sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        </Link>

        {/* The decorative badges let clicks fall through to the image link
            underneath; only the heart is interactive. */}
        <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center rounded-full bg-black/65 px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.12em] text-white uppercase backdrop-blur-sm">
          {studio.category}
        </span>

        <WishlistButton studioId={studio._id} title={studio.title} />

        <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-baseline gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {currency(studio.pricing?.hourlyRate)}
          <span className="text-[0.65rem] font-normal text-white/75">
            / hr
          </span>
        </span>

        {rating > 0 ? (
          <span className="pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <StarIcon className="size-3.5 fill-current text-amber-400" />
            {rating.toFixed(1)}
            {studio.reviewCount ? (
              <span className="text-white/70">({studio.reviewCount})</span>
            ) : null}
          </span>
        ) : null}
      </div>

      {/* ----------------------------------------------------------- content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPinIcon className="size-3.5 shrink-0" />
          <span className="truncate">{addressLine(studio)}</span>
        </p>

        <h3 className="font-heading text-xl leading-snug">
          <Link
            href={href}
            className="transition-colors duration-300 hover:text-brand"
          >
            {studio.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {excerpt(studio.tagline || studio.description, 96)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="size-3.5 shrink-0" />
            Up to {studio.specs?.maxCapacity} creators
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BadgeDollarSignIcon className="size-3.5 shrink-0" />
            Deposit: {currency(studio.pricing?.securityDeposit)}
          </span>
        </div>

        <Link
          href={href}
          className="group/cta mt-1 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-border text-xs font-medium tracking-[0.08em] uppercase transition-colors duration-300 hover:border-foreground/40 hover:bg-muted"
        >
          View Details
          <ArrowRightIcon className="size-3.5 transition-transform duration-300 group-hover/cta:translate-x-1" />
        </Link>
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
        <div className="mt-auto h-3 w-40 animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
      </div>
    </div>
  );
}
