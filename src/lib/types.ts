/**
 * The document shapes come straight from the official seed JSON in the
 * assignment root folder (studios.json / bookings.json). The Express server
 * stores exactly this shape, so this file is the single source of truth for
 * both the form payloads and the UI.
 */

export const CATEGORIES = [
  "Photo Studio",
  "Film Stage",
  "Sound Stage",
  "Podcast Lounge",
  "Music Suite",
  "Workshop",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_FILTER_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Photo Studio", value: "Photo Studio" },
  { label: "Film Stage", value: "Film Stage" },
  { label: "Sound Stage", value: "Sound Stage" },
  { label: "Podcast Room", value: "Podcast Lounge" },
  { label: "Music Suite", value: "Music Suite" },
  { label: "Art Workshop", value: "Workshop" },
] as const;

export function normalizeCategoryFilter(value: string | undefined | null) {
  if (!value) return undefined;
  if (value === "Podcast Room") return "Podcast Lounge";
  if (value === "Art Workshop") return "Workshop";
  return value;
}

export const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type StudioImage = {
  url: string;
  caption?: string;
  isPrimary?: boolean;
};

export type StudioLocation = {
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country?: string;
  coordinates?: { lat: number; lng: number };
};

export type StudioPricing = {
  hourlyRate: number;
  dailyRate?: number;
  securityDeposit: number;
  cleaningFee?: number;
  minimumHours?: number;
  currency?: string;
};

export type StudioSpecs = {
  squareFeet?: number;
  ceilingHeightFt?: number;
  maxCapacity: number;
  powerCapacity?: string;
  soundproofRating?: string;
};

export type StudioHost = {
  hostId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isSuperhost?: boolean;
  responseRatePercent?: number;
  responseTime?: string;
};

export type Studio = {
  _id: string;
  title: string;
  slug?: string;
  category: Category | string;
  tagline?: string;
  description: string;
  location: StudioLocation;
  pricing: StudioPricing;
  specs: StudioSpecs;
  images: StudioImage[];
  amenities: string[];
  includedGear?: string[];
  host: StudioHost;
  rules?: string[];
  rating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** What the add/edit form actually sends. */
export type StudioPayload = {
  title: string;
  category: string;
  tagline: string;
  description: string;
  rating: number;
  reviewCount: number;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  pricing: {
    hourlyRate: number;
    dailyRate: number;
    securityDeposit: number;
    cleaningFee: number;
    minimumHours: number;
  };
  specs: {
    squareFeet: number;
    ceilingHeightFt: number;
    maxCapacity: number;
    powerCapacity: string;
    soundproofRating: string;
  };
  images: StudioImage[];
  amenities: string[];
  includedGear: string[];
  rules: string[];
};

export type BookingCreator = {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  company?: string;
};

export type Booking = {
  _id: string;
  bookingNumber: string;
  studioId: string;
  studioTitle: string;
  studioCategory: string;
  studioImage: string;
  /**
   * Joined in by GET /my-bookings ($lookup against the studios collection) so
   * the card and its receipt can show where the space actually is. Absent if
   * the listing has since been deleted.
   */
  studioLocation?: StudioLocation;
  creator: BookingCreator;
  hostEmail: string;
  schedule: {
    bookingDate: string;
    startTime: string;
    endTime: string;
    totalHours: number;
    timezone?: string;
  };
  pricingSummary: {
    hourlyRate: number;
    subtotal: number;
    securityDeposit: number;
    cleaningFee: number;
    platformFee: number;
    totalAmount: number;
    currency?: string;
  };
  projectDetails: {
    projectTitle: string;
    crewSize: number;
    specialRequirements?: string;
  };
  status: BookingStatus;
  /** Present on the seeded reservations; a fresh booking starts Unpaid. */
  payment?: {
    paymentStatus?: string;
    paymentMethod?: string;
    transactionId?: string;
    paidAt?: string;
  };
  invoice?: {
    pdfUrl?: string;
    generatedAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
};

export type BookingPayload = {
  studioId: string;
  studioTitle: string;
  studioCategory: string;
  studioImage: string;
  schedule: {
    bookingDate: string;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  projectDetails: {
    projectTitle: string;
    crewSize: number;
    specialRequirements: string;
  };
  pricingSummary: {
    hourlyRate: number;
    subtotal: number;
    securityDeposit: number;
    cleaningFee: number;
    platformFee: number;
    totalAmount: number;
  };
};

export type CatalogueStats = {
  byCategory: { category: string; count: number }[];
  pricing: {
    averageHourlyRate: number;
    cheapest: number;
    priciest: number;
    listings: number;
  };
};

export type AvailabilitySlot = {
  bookingDate: string;
  startTime: string;
  endTime: string;
};

/** A creator review attached to one studio (seed-extra.json → "reviews"). */
export type Review = {
  _id: string;
  studioId: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
};
