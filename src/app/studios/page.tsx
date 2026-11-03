import { Suspense } from "react";

import { EmptyState } from "@/components/empty-state";
import { StudioCard, StudioCardSkeleton } from "@/components/studio-card";
import {
  StudioFilterBar,
  StudioFilterBarSkeleton,
} from "@/components/studios/filter-bar";
import { api, type StudioFilters } from "@/lib/api";
import type { Studio } from "@/lib/types";

// Results depend on the query string, so the grid is rendered per request.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Explore studios",
  description:
    "Search every room on StudioSpace by city, category, capacity and hourly rate.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

function toFilters(
  params: Record<string, string | string[] | undefined>,
): StudioFilters {
  const filters: StudioFilters = {};

  const search = first(params.search);
  const category = first(params.category);
  const sort = first(params.sort);
  const minPrice = Number(first(params.minPrice));
  const maxPrice = Number(first(params.maxPrice));
  const minCapacity = Number(first(params.minCapacity));

  if (search) filters.search = search;
  if (category && category !== "all") filters.category = category;
  if (Number.isFinite(minPrice) && minPrice > 0) filters.minPrice = minPrice;
  if (Number.isFinite(maxPrice) && maxPrice > 0) filters.maxPrice = maxPrice;
  if (Number.isFinite(minCapacity) && minCapacity > 0)
    filters.minCapacity = minCapacity;
  if (
    sort === "newest" ||
    sort === "price-asc" ||
    sort === "price-desc" ||
    sort === "rating"
  ) {
    filters.sort = sort;
  }

  return filters;
}

async function StudioResults({
  filters,
  isFiltered,
}: {
  filters: StudioFilters;
  isFiltered: boolean;
}) {
  let studios: Studio[] = [];
  let reachable = true;

  try {
    studios = await api.getStudios(filters);
  } catch {
    reachable = false;
  }

  if (!reachable) {
    return (
      <p className="rounded-lg border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
        The catalogue could not be reached. Start the StudioSpace API on port
        8000 and reload.
      </p>
    );
  }

  if (studios.length === 0) {
    return isFiltered ? (
      <EmptyState
        title="No spaces match those filters"
        description="Try a wider price range, another category, or clear the filters and start again."
        actionLabel="Clear all filters"
        actionHref="/studios"
      />
    ) : (
      <EmptyState
        title="The catalogue is empty"
        description="Nothing has been listed yet. Be the first host to put a room on StudioSpace."
        actionLabel="List your studio"
        actionHref="/add-studio"
      />
    );
  }

  return (
    <>
      <p className="mb-8 text-sm text-muted-foreground">
        {studios.length} {studios.length === 1 ? "space" : "spaces"} available
      </p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {studios.map((studio) => (
          <StudioCard key={studio._id} studio={studio} />
        ))}
      </div>
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <StudioCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default async function StudiosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const filters = toFilters(params);
  const isFiltered = Object.keys(filters).length > 0;

  return (
    <>
      <section className="mx-auto w-full max-w-[1400px] px-5 pt-16 pb-12 sm:px-8 sm:pt-20">
        <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          Catalogue
        </p>
        <h1 className="display rise mt-5 max-w-[22ch] text-[clamp(2.5rem,5.4vw,4.5rem)]">
          Every room, priced and ready
        </h1>
        <p className="rise-2 mt-6 max-w-[52ch] text-[0.95rem] leading-relaxed text-muted-foreground">
          Filter by what the shoot actually needs - city, category, headcount
          and hourly rate. Nothing here is stock copy; every listing was written
          by the host who owns the space.
        </p>
      </section>

      <Suspense fallback={<StudioFilterBarSkeleton />}>
        <StudioFilterBar />
      </Suspense>

      <section className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
        <Suspense
          key={JSON.stringify(filters)}
          fallback={<ResultsSkeleton />}
        >
          <StudioResults filters={filters} isFiltered={isFiltered} />
        </Suspense>
      </section>
    </>
  );
}
