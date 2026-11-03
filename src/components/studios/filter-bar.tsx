"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchIcon, XIcon } from "lucide-react";

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
import { CATEGORIES } from "@/lib/types";

const ALL = "all";

const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "rating", label: "Top rated" },
];

const filterKeys = ["search", "category", "sort", "minPrice", "maxPrice", "minCapacity"];

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
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const push = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(queryString);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === ALL) params.delete(key);
      else params.set(key, value);
    });
    const next = params.toString();
    if (next === queryString) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const pushRef = useRef(push);
  pushRef.current = push;

  // Mirror an external URL change (browser back, a category card from the
  // home page) back into the text box without fighting the user's typing.
  useEffect(() => {
    const urlSearch = searchParams.get("search") ?? "";
    setSearch((previous) => (previous === urlSearch ? previous : urlSearch));
  }, [searchParams]);

  // Debounced search: one request 350ms after the last keystroke.
  useEffect(() => {
    const timer = setTimeout(() => pushRef.current({ search }), 350);
    return () => clearTimeout(timer);
  }, [search]);

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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
          <div className="flex flex-col gap-2 sm:col-span-2 lg:col-span-4">
            <Label htmlFor="studio-search" className={fieldLabel}>
              Search
            </Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="studio-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Title, city or amenity"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:col-span-2">
            <span className={fieldLabel}>Category</span>
            <Select
              value={searchParams.get("category") ?? ALL}
              onValueChange={(value) => push({ category: String(value) })}
            >
              <SelectTrigger className="w-full" aria-label="Filter by category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 lg:col-span-2">
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

          <div className="flex flex-col gap-2 lg:col-span-1">
            <span className={fieldLabel}>Min $</span>
            {numberField("minPrice", "0", "Minimum hourly rate")}
          </div>

          <div className="flex flex-col gap-2 lg:col-span-1">
            <span className={fieldLabel}>Max $</span>
            {numberField("maxPrice", "Any", "Maximum hourly rate")}
          </div>

          <div className="flex flex-col gap-2 lg:col-span-1">
            <span className={fieldLabel}>People</span>
            {numberField("minCapacity", "Any", "Minimum capacity")}
          </div>

          <div className="flex lg:col-span-1 lg:justify-end">
            {hasFilters ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full lg:w-auto"
                onClick={() =>
                  router.replace(pathname, { scroll: false })
                }
              >
                <XIcon />
                Clear
              </Button>
            ) : (
              <span className="hidden text-xs text-muted-foreground lg:block">
                {CATEGORIES.length} categories
              </span>
            )}
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className={
                index === 0
                  ? "h-8 animate-pulse rounded-lg bg-muted sm:col-span-2 lg:col-span-4"
                  : "h-8 animate-pulse rounded-lg bg-muted lg:col-span-2"
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
