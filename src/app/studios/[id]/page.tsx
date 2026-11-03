import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  BadgeCheckIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  MapPinIcon,
  RulerIcon,
  SparklesIcon,
  StarIcon,
  UsersIcon,
  Volume2Icon,
  WrenchIcon,
  ZapIcon,
} from "lucide-react";

import { BookingPanel } from "@/components/studios/booking-panel";
import { StudioGallery } from "@/components/studios/studio-gallery";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ApiError, api } from "@/lib/api";
import { auth } from "@/lib/auth";
import type { AvailabilitySlot, Studio } from "@/lib/types";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  try {
    const studio = await api.getStudio(id);
    return {
      title: studio.title,
      description: studio.tagline ?? studio.description.slice(0, 150),
    };
  } catch {
    return { title: "Studio not found" };
  }
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-t border-border pt-4">
      <dt className="flex items-center gap-2 text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {icon}
        {label}
      </dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

export default async function StudioDetailPage({ params }: { params: Params }) {
  const { id } = await params;

  let studio: Studio | null = null;
  let reachable = true;

  try {
    studio = await api.getStudio(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    reachable = false;
  }

  if (!reachable || !studio) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-5 py-32 sm:px-8">
        <p className="mx-auto max-w-[46ch] rounded-lg border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          This space could not be loaded. Start the StudioSpace API on port 8000
          and reload.
        </p>
      </div>
    );
  }

  let availability: AvailabilitySlot[] = [];
  try {
    availability = await api.getAvailability(id);
  } catch {
    availability = [];
  }

  const session = await auth.api.getSession({ headers: await headers() });
  const viewerEmail = String(session?.user?.email ?? "").toLowerCase();
  const isAuthenticated = Boolean(session?.user);
  const isOwner =
    Boolean(viewerEmail) &&
    viewerEmail === String(studio.host?.email ?? "").toLowerCase();

  const specs = studio.specs ?? {};
  const rating = Number(studio.rating ?? 0);

  return (
    <article className="mx-auto w-full max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
      >
        <Link
          href="/studios"
          className="transition-colors hover:text-foreground"
        >
          Explore studios
        </Link>
        <ChevronRightIcon className="size-3.5" />
        <span>{studio.category}</span>
      </nav>

      <header className="mt-6 max-w-[52rem]">
        <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          {studio.category}
        </p>
        <h1 className="display rise mt-4 text-[clamp(2rem,4.4vw,3.6rem)]">
          {studio.title}
        </h1>
        {studio.tagline ? (
          <p className="rise-2 mt-5 text-[1.02rem] leading-relaxed text-muted-foreground">
            {studio.tagline}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPinIcon className="size-4" />
            {studio.location?.city}
            {studio.location?.state ? `, ${studio.location.state}` : ""}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="size-4" />
            Up to {specs.maxCapacity ?? "-"} people
          </span>
          {rating > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <StarIcon className="size-4 fill-current text-brand" />
              {rating.toFixed(1)}
              {studio.reviewCount ? ` (${studio.reviewCount})` : ""}
            </span>
          ) : null}
        </div>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div className="flex flex-col gap-14">
          <StudioGallery images={studio.images} title={studio.title} />

          <section>
            <h2 className="font-heading text-2xl">The space</h2>
            <div className="rule mt-5" />
            <p className="mt-6 text-[0.95rem] leading-relaxed whitespace-pre-line text-muted-foreground">
              {studio.description}
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl">Specifications</h2>
            <div className="rule mt-5" />
            <dl className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              <Spec
                icon={<RulerIcon className="size-3.5" />}
                label="Floor area"
                value={
                  specs.squareFeet
                    ? `${specs.squareFeet.toLocaleString()} sq ft`
                    : "-"
                }
              />
              <Spec
                icon={<RulerIcon className="size-3.5" />}
                label="Ceiling"
                value={
                  specs.ceilingHeightFt ? `${specs.ceilingHeightFt} ft` : "-"
                }
              />
              <Spec
                icon={<UsersIcon className="size-3.5" />}
                label="Capacity"
                value={`${specs.maxCapacity ?? "-"} people`}
              />
              <Spec
                icon={<ZapIcon className="size-3.5" />}
                label="Power"
                value={specs.powerCapacity || "-"}
              />
              <Spec
                icon={<Volume2Icon className="size-3.5" />}
                label="Sound"
                value={specs.soundproofRating || "-"}
              />
              <Spec
                icon={<MapPinIcon className="size-3.5" />}
                label="Address"
                value={
                  <span>
                    {studio.location?.address}
                    {studio.location?.zipCode
                      ? `, ${studio.location.zipCode}`
                      : ""}
                  </span>
                }
              />
            </dl>
          </section>

          {studio.amenities?.length > 0 ? (
            <section>
              <h2 className="font-heading text-2xl">Amenities</h2>
              <div className="rule mt-5" />
              <ul className="mt-6 flex flex-wrap gap-2">
                {studio.amenities.map((amenity) => (
                  <li
                    key={amenity}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm"
                  >
                    <SparklesIcon className="size-3.5 text-brand" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {(studio.includedGear?.length ?? 0) > 0 ? (
            <section>
              <h2 className="font-heading text-2xl">Gear included</h2>
              <div className="rule mt-5" />
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {studio.includedGear?.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm">
                    <WrenchIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {(studio.rules?.length ?? 0) > 0 ? (
            <section>
              <h2 className="font-heading text-2xl">House rules</h2>
              <div className="rule mt-5" />
              <ul className="mt-6 flex flex-col gap-3">
                {studio.rules?.map((rule) => (
                  <li key={rule} className="flex items-start gap-2.5 text-sm">
                    <ClipboardListIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-lg border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-12">
                  <AvatarImage
                    src={studio.host?.avatar}
                    referrerPolicy="no-referrer"
                    alt=""
                  />
                  <AvatarFallback>
                    {studio.host?.name?.charAt(0)?.toUpperCase() ?? "H"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="flex items-center gap-1.5 font-heading text-lg">
                    {studio.host?.name}
                    {studio.host?.isSuperhost ? (
                      <BadgeCheckIcon className="size-4 text-brand" />
                    ) : null}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {studio.host?.responseTime || "Replies within a day"}
                  </p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">
                    {studio.host?.responseRatePercent ?? 90}%
                  </span>{" "}
                  response rate
                </p>
                {studio.host?.phone ? <p>{studio.host.phone}</p> : null}
              </div>
            </div>
          </section>
        </div>

        <aside>
          <BookingPanel
            studio={studio}
            availability={availability}
            isAuthenticated={isAuthenticated}
            isOwner={isOwner}
          />
        </aside>
      </div>
    </article>
  );
}
