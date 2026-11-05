import type {
  AvailabilitySlot,
  Booking,
  BookingPayload,
  CatalogueStats,
  Review,
  Studio,
  StudioPayload,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Every failure from the Express API arrives as `{ code, message }`. Throwing
 * a typed error keeps the components free of `res.ok` plumbing and lets them
 * branch on `code` (e.g. DOUBLE_BOOKING) instead of parsing strings.
 */
export class ApiError extends Error {
  code: string;
  status: number;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string | null;
  cache?: RequestCache;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, token, cache } = options;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: cache ?? "no-store",
  });

  const text = await response.text();
  const payload = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const detail = payload as { code?: string; message?: string } | null;
    throw new ApiError(
      response.status,
      detail?.code ?? "REQUEST_FAILED",
      detail?.message ?? "Something went wrong. Please try again.",
    );
  }

  return payload as T;
}

function toQuery(params: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === null) return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export type StudioFilters = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
  limit?: number;
};

export const api = {
  getStudios: (filters: StudioFilters = {}) =>
    request<Studio[]>(`/studios${toQuery(filters)}`),

  getFeaturedStudios: () => request<Studio[]>("/featured-studios"),

  getStudio: (id: string) => request<Studio>(`/studios/${id}`),

  getReviews: (studioId: string) =>
    request<Review[]>(`/studios/${studioId}/reviews`),

  getStats: () => request<CatalogueStats>("/stats"),

  getAvailability: (studioId: string) =>
    request<AvailabilitySlot[]>(`/bookings/studio/${studioId}`),

  createStudio: (payload: StudioPayload, token: string) =>
    request<Studio>("/add-studio", { method: "POST", body: payload, token }),

  getMyListings: (token: string) =>
    request<Studio[]>("/my-listings", { token }),

  updateStudio: (id: string, payload: StudioPayload, token: string) =>
    request<{ modifiedCount: number; studio: Studio }>(`/studios/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    }),

  deleteStudio: (id: string, token: string) =>
    request<{ deletedCount: number }>(`/studios/${id}`, {
      method: "DELETE",
      token,
    }),

  createBooking: (payload: BookingPayload, token: string) =>
    request<Booking>("/bookings", { method: "POST", body: payload, token }),

  getMyBookings: (token: string) =>
    request<Booking[]>("/my-bookings", { token }),

  cancelBooking: (id: string, token: string) =>
    request<{ modifiedCount: number; status: string }>(
      `/bookings/${id}/cancel`,
      { method: "PATCH", token },
    ),

  getWishlistIds: (token: string) =>
    request<string[]>("/my-wishlist/ids", { token }),

  getMyWishlist: (token: string) => request<Studio[]>("/my-wishlist", { token }),

  saveToWishlist: (studioId: string, token: string) =>
    request<{ saved: boolean; studioId: string }>(`/wishlist/${studioId}`, {
      method: "POST",
      token,
    }),

  removeFromWishlist: (studioId: string, token: string) =>
    request<{ saved: boolean; removed: number }>(`/wishlist/${studioId}`, {
      method: "DELETE",
      token,
    }),
};
