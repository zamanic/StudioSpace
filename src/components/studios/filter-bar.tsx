"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_FILTER_OPTIONS, normalizeCategoryFilter } from "@/lib/types";

const ALL = "all";

const sortOptions = [
  { value: "newest", label: "Newest listings" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "rating", label: "Top rated" },
];

const filterKeys = [
  "search",
  "category",
  "sort",
  "minPrice",
  "maxPrice",
  "minCapacity",
];

const fieldLabel =
  "text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase";

/**
 * The whole explore page is driven by the URL, so a filtered view can be
 * shared or reloaded without losing state. Selects apply immediately, the
 * text box waits for a pause in typing, and the number fields wait for blur.
 */
export function StudioFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryString = searchParams.toString();
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeCategory =
    normalizeCategoryFilter(searchParams.get("category")) ?? ALL;

  const push = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(queryString);
      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === ALL) params.delete(key);
        else params.set(key, value);
      });
      const next = params.toString();
      if (next === queryString) return;
      router.replace(next ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    },
    [pathname, queryString, router],
  );

  useEffect(
    () => () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    },
    [],
  );

  const hasFilters = filterKeys.some((key) => searchParams.has(key));

  const numberField = (key: string, placeholder: string, aria: string) => (
    <Input
      key={`${key}-${queryString}`}
      type="number"
      inputMode="numeric"
      min={0}
      placeholder={placeholder}
      aria-label={aria}
      defaultValue={searchParams.get(key) ?? ""}
      onBlur={(event) => push({ [key]: event.target.value })}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          push({ [key]: event.currentTarget.value });
        }
      }}
    />
  );

  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-6 sm:px-8">
        <div className="rounded-[1.25rem] border border-border bg-background/70 p-4 shadow-sm shadow-black/5 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_220px] lg:items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="studio-search" className={fieldLabel}>
                Search
              </Label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="studio-search"
                  key={`search-${queryString}`}
                  defaultValue={searchParams.get("search") ?? ""}
                  onChange={(event) => {
                    if (searchTimer.current) clearTimeout(searchTimer.current);
                    const value = event.target.value;
                    searchTimer.current = setTimeout(() => {
                      push({ search: value });
                    }, 350);
                  }}
                  placeholder="Search studios by title, equipment, city..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className={fieldLabel}>Sort</span>
              <Select
                value={searchParams.get("sort") ?? "newest"}
                onValueChange={(value) => push({ sort: String(value) })}
              >
                <SelectTrigger className="w-full" aria-label="Sort results">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-border pt-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="inline-flex items-center gap-2 text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  <SlidersHorizontalIcon className="size-3.5" />
                  Category
                </span>
                <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1">
                  {CATEGORY_FILTER_OPTIONS.map((category) => {
                    const active = activeCategory === category.value;
                    return (
                      <button
                        key={category.label}
                        type="button"
                        onClick={() =>
                          push({
                            category:
                              category.value === ALL
                                ? undefined
                                : category.value,
                          })
                        }
                        aria-pressed={active}
                        className={[
                          "inline-flex h-9 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          active
                            ? "border-brand bg-brand text-brand-foreground"
                            : "border-border bg-card text-foreground hover:border-foreground/25 hover:bg-muted",
                        ].join(" ")}
                      >
                        {category.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:w-[480px]">
                <div className="flex flex-col gap-2">
                  <span className={fieldLabel}>Min $</span>
                  {numberField("minPrice", "Min $", "Minimum hourly rate")}
                </div>

                <div className="flex flex-col gap-2">
                  <span className={fieldLabel}>Max $</span>
                  {numberField("maxPrice", "Max $", "Maximum hourly rate")}
                </div>

                <div className="flex flex-col gap-2">
                  <span className={fieldLabel}>People</span>
                  {numberField("minCapacity", "Any", "Minimum capacity")}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs leading-relaxed text-muted-foreground">
                Category pills stay in sync with direct links like{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-[0.7rem]">
                  ?category=Film%20Stage
                </code>{" "}
                and with the category cards on the home page.
              </p>

              {hasFilters ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => router.replace(pathname, { scroll: false })}
                >
                  <XIcon />
                  Clear all
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudioFilterBarSkeleton() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-6 sm:px-8">
        <div className="rounded-[1.25rem] border border-border bg-background/70 p-4 sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_220px]">
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
          </div>
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="h-9 w-28 animate-pulse rounded-full bg-muted"
                />
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`field-${index}`}
                  className="h-10 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          </div>
          <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </section>
  );
}
