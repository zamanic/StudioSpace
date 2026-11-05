import type { Studio, StudioLocation } from "./types";

/** $12.00 style price from the store's USD values. */
export function currency(value: number | undefined | null) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits:
      value !== undefined && value !== null && value % 1 !== 0 ? 2 : 0,
  }).format(Number(value ?? 0));
}

/** 3 Aug 2026 - short, unambiguous, no locale surprises. */
export function shortDate(value: string | Date | undefined | null) {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** "14:30" -> "2:30 PM" */
export function clockTime(value: string | undefined | null) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return "-";
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${String(minute).padStart(2, "0")} ${suffix}`;
}

/** Hours between two HH:MM strings, e.g. 4.5 */
export function hoursBetween(start: string, end: string) {
  const toMinutes = (value: string) => {
    const [hour, minute] = value.split(":").map(Number);
    return hour * 60 + minute;
  };
  const diff = toMinutes(end) - toMinutes(start);
  return diff > 0 ? diff / 60 : 0;
}

export function titleCase(value: string) {
  return value.replace(
    /\w\S*/g,
    (word) => word[0].toUpperCase() + word.slice(1).toLowerCase(),
  );
}

/** "450 Production Way, Dhaka, Dhaka Division" - reads like a postal address. */
export function addressLine(location: StudioLocation | undefined) {
  return [location?.address, location?.city, location?.state]
    .filter(Boolean)
    .join(", ");
}

export function primaryImage(studio: Pick<Studio, "images">) {
  const primary = studio.images?.find((image) => image.isPrimary);
  return (
    primary?.url || studio.images?.[0]?.url || "/studios/photo-studio-cyc.png"
  );
}

/** Turns a long description into 2 lines of teaser for the grid cards. */
export function excerpt(value: string, length = 110) {
  const text = String(value ?? "").trim();
  return text.length > length ? `${text.slice(0, length).trimEnd()}...` : text;
}

/**
 * The cheapest way to render an external URL as a Next/Image source: local
 * `/studios/*` files pass straight through, remote images are served as-is
 * because the bucket hosts are not known ahead of time.
 */
export function imageProps(url: string) {
  const isLocal = url.startsWith("/");
  return isLocal ? { src: url } : { src: url, unoptimized: true };
}
