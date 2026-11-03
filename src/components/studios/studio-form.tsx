"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  CircleDollarSignIcon,
  ImageIcon,
  ListChecksIcon,
  MapPinIcon,
  PlusIcon,
  RulerIcon,
  Trash2Icon,
  UserIcon,
} from "lucide-react";

import { TagInput } from "@/components/studios/tag-input";
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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api } from "@/lib/api";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import { CATEGORIES, type Studio, type StudioPayload } from "@/lib/types";

type FormState = {
  title: string;
  category: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  hourlyRate: string;
  dailyRate: string;
  securityDeposit: string;
  cleaningFee: string;
  minimumHours: string;
  squareFeet: string;
  ceilingHeightFt: string;
  maxCapacity: string;
  powerCapacity: string;
  soundproofRating: string;
  images: { url: string; caption: string }[];
  amenities: string[];
  includedGear: string[];
  rules: string[];
};

const amenityPresets = [
  "High-Speed Wi-Fi",
  "Climate Control",
  "Green Room",
  "Loading Dock",
  "Parking",
  "Kitchenette",
];

function toFormState(studio?: Studio): FormState {
  return {
    title: studio?.title ?? "",
    category: String(studio?.category ?? ""),
    tagline: studio?.tagline ?? "",
    description: studio?.description ?? "",
    address: studio?.location?.address ?? "",
    city: studio?.location?.city ?? "",
    state: studio?.location?.state ?? "",
    zipCode: studio?.location?.zipCode ?? "",
    country: studio?.location?.country ?? "Bangladesh",
    hourlyRate: studio?.pricing?.hourlyRate ? String(studio.pricing.hourlyRate) : "",
    dailyRate: studio?.pricing?.dailyRate ? String(studio.pricing.dailyRate) : "",
    securityDeposit:
      studio?.pricing?.securityDeposit !== undefined
        ? String(studio.pricing.securityDeposit)
        : "",
    cleaningFee:
      studio?.pricing?.cleaningFee !== undefined
        ? String(studio.pricing.cleaningFee)
        : "",
    minimumHours: studio?.pricing?.minimumHours
      ? String(studio.pricing.minimumHours)
      : "1",
    squareFeet: studio?.specs?.squareFeet ? String(studio.specs.squareFeet) : "",
    ceilingHeightFt: studio?.specs?.ceilingHeightFt
      ? String(studio.specs.ceilingHeightFt)
      : "",
    maxCapacity: studio?.specs?.maxCapacity
      ? String(studio.specs.maxCapacity)
      : "",
    powerCapacity: studio?.specs?.powerCapacity ?? "",
    soundproofRating: studio?.specs?.soundproofRating ?? "",
    images:
      studio?.images?.map((image) => ({
        url: image.url,
        caption: image.caption ?? "",
      })) ?? [{ url: "", caption: "" }],
    amenities: studio?.amenities ?? [],
    includedGear: studio?.includedGear ?? [],
    rules: studio?.rules ?? [],
  };
}

const sectionCard = "rounded-lg border border-border bg-card p-6 sm:p-8";

const sectionTitle =
  "flex items-center gap-2.5 font-heading text-xl";

export function StudioForm({
  mode,
  studio,
  host,
}: {
  mode: "create" | "edit";
  studio?: Studio;
  host: { name: string; email: string };
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(studio));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((previous) => ({ ...previous, [key]: value }));

  const setImage = (index: number, key: "url" | "caption", value: string) =>
    setForm((previous) => ({
      ...previous,
      images: previous.images.map((image, position) =>
        position === index ? { ...image, [key]: value } : image,
      ),
    }));

  const addImage = () =>
    setForm((previous) => ({
      ...previous,
      images: [...previous.images, { url: "", caption: "" }],
    }));

  const removeImage = (index: number) =>
    setForm((previous) => ({
      ...previous,
      images:
        previous.images.length > 1
          ? previous.images.filter((_, position) => position !== index)
          : previous.images,
    }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.title.trim().length < 4) {
      next.title = "Title must be at least 4 characters.";
    }
    if (!CATEGORIES.includes(form.category as (typeof CATEGORIES)[number])) {
      next.category = "Pick one of the five categories.";
    }
    if (form.description.trim().length < 30) {
      next.description = "Detailed overview must be at least 30 characters.";
    }
    if (!form.city.trim()) next.city = "City is required.";
    if (!form.address.trim()) next.address = "Address is required.";
    if (!(Number(form.hourlyRate) > 0)) {
      next.hourlyRate = "Hourly rate must be greater than 0.";
    }
    if (!(Number(form.maxCapacity) >= 1)) {
      next.maxCapacity = "Max capacity must be at least 1.";
    }
    if (!/^https?:\/\/.+/i.test(form.images[0]?.url?.trim() ?? "")) {
      next.images = "The primary image must be a direct http(s) link.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      toast.error("Check the highlighted fields before saving.");
      return;
    }

    const payload: StudioPayload = {
      title: form.title.trim(),
      category: form.category,
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      location: {
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        zipCode: form.zipCode.trim(),
        country: form.country.trim() || "Bangladesh",
      },
      pricing: {
        hourlyRate: Number(form.hourlyRate) || 0,
        dailyRate: Number(form.dailyRate) || (Number(form.hourlyRate) || 0) * 8,
        securityDeposit: Number(form.securityDeposit) || 0,
        cleaningFee: Number(form.cleaningFee) || 0,
        minimumHours: Math.max(1, Number(form.minimumHours) || 1),
      },
      specs: {
        squareFeet: Number(form.squareFeet) || 0,
        ceilingHeightFt: Number(form.ceilingHeightFt) || 0,
        maxCapacity: Number(form.maxCapacity) || 1,
        powerCapacity: form.powerCapacity.trim(),
        soundproofRating: form.soundproofRating.trim(),
      },
      images: form.images
        .filter((image) => image.url.trim().length > 0)
        .map((image, index) => ({
          url: image.url.trim(),
          caption: image.caption.trim() || form.title.trim(),
          isPrimary: index === 0,
        })),
      amenities: form.amenities,
      includedGear: form.includedGear.filter((item) => item.trim().length > 0),
      rules: form.rules.filter((item) => item.trim().length > 0),
    };

    setSubmitting(true);
    const token = await getTokenFromClient();
    if (!token) {
      setSubmitting(false);
      toast.error("Your session expired. Please sign in again.");
      router.push(
        `/login?redirect=${mode === "edit" ? `/studios/edit/${studio?._id}` : "/add-studio"}`,
      );
      return;
    }

    try {
      if (mode === "edit" && studio) {
        await api.updateStudio(studio._id, payload, token);
        toast.success("Listing updated");
        router.push("/my-listings");
      } else {
        await api.createStudio(payload, token);
        toast.success("Studio listed", {
          description: "Your space is now live on the catalogue.",
        });
        router.push("/my-listings");
      }
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const error = (key: string) =>
    errors[key] ? (
      <p className="text-xs text-destructive">{errors[key]}</p>
    ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12"
    >
      <div className="flex flex-col gap-8">
        {/* ------------------------------------------------------------ basics */}
        <section className={sectionCard}>
          <h2 className={sectionTitle}>
            <ListChecksIcon className="size-5 text-brand" />
            The basics
          </h2>
          <div className="mt-7 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                aria-invalid={Boolean(errors.title)}
                placeholder="e.g. Riverside Daylight Photo Studio"
                onChange={(event) => set("title", event.target.value)}
              />
              {error("title")}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <span className="text-sm leading-none font-medium">
                  Category
                </span>
                <Select
                  value={form.category}
                  onValueChange={(value) => set("category", String(value))}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-label="Category"
                    aria-invalid={Boolean(errors.category)}
                  >
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {error("category")}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={form.tagline}
                  placeholder="One line that sells the room"
                  onChange={(event) => set("tagline", event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Detailed overview</Label>
              <Textarea
                id="description"
                rows={6}
                value={form.description}
                aria-invalid={Boolean(errors.description)}
                placeholder="Dimensions, layout, what it is best suited for, and anything a crew should know before arriving."
                onChange={(event) => set("description", event.target.value)}
              />
              {error("description")}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------- location */}
        <section className={sectionCard}>
          <h2 className={sectionTitle}>
            <MapPinIcon className="size-5 text-brand" />
            Location
          </h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="address">Street address</Label>
              <Input
                id="address"
                value={form.address}
                aria-invalid={Boolean(errors.address)}
                placeholder="450 Production Way, Suite 100"
                onChange={(event) => set("address", event.target.value)}
              />
              {error("address")}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                aria-invalid={Boolean(errors.city)}
                placeholder="Dhaka"
                onChange={(event) => set("city", event.target.value)}
              />
              {error("city")}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="state">State / division</Label>
              <Input
                id="state"
                value={form.state}
                placeholder="Dhaka Division"
                onChange={(event) => set("state", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="zip">Postal code</Label>
              <Input
                id="zip"
                value={form.zipCode}
                placeholder="1208"
                onChange={(event) => set("zipCode", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                placeholder="Bangladesh"
                onChange={(event) => set("country", event.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------------- pricing */}
        <section className={sectionCard}>
          <h2 className={sectionTitle}>
            <CircleDollarSignIcon className="size-5 text-brand" />
            Pricing
          </h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="hourlyRate">Hourly rate (USD)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min={1}
                value={form.hourlyRate}
                aria-invalid={Boolean(errors.hourlyRate)}
                placeholder="120"
                onChange={(event) => set("hourlyRate", event.target.value)}
              />
              {error("hourlyRate")}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dailyRate">Daily rate (USD)</Label>
              <Input
                id="dailyRate"
                type="number"
                min={0}
                value={form.dailyRate}
                placeholder="Default: 8 × hourly"
                onChange={(event) => set("dailyRate", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="minimumHours">Minimum hours</Label>
              <Input
                id="minimumHours"
                type="number"
                min={1}
                value={form.minimumHours}
                onChange={(event) => set("minimumHours", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="securityDeposit">Security deposit (USD)</Label>
              <Input
                id="securityDeposit"
                type="number"
                min={0}
                value={form.securityDeposit}
                placeholder="500"
                onChange={(event) => set("securityDeposit", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cleaningFee">Cleaning fee (USD)</Label>
              <Input
                id="cleaningFee"
                type="number"
                min={0}
                value={form.cleaningFee}
                placeholder="75"
                onChange={(event) => set("cleaningFee", event.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- specs */}
        <section className={sectionCard}>
          <h2 className={sectionTitle}>
            <RulerIcon className="size-5 text-brand" />
            Specifications
          </h2>
          <div className="mt-7 grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="squareFeet">Floor area (sq ft)</Label>
              <Input
                id="squareFeet"
                type="number"
                min={0}
                value={form.squareFeet}
                placeholder="4000"
                onChange={(event) => set("squareFeet", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ceiling">Ceiling height (ft)</Label>
              <Input
                id="ceiling"
                type="number"
                min={0}
                value={form.ceilingHeightFt}
                placeholder="24"
                onChange={(event) => set("ceilingHeightFt", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="capacity">Max capacity</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                value={form.maxCapacity}
                aria-invalid={Boolean(errors.maxCapacity)}
                placeholder="50"
                onChange={(event) => set("maxCapacity", event.target.value)}
              />
              {error("maxCapacity")}
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <Label htmlFor="power">Power capacity</Label>
              <Input
                id="power"
                value={form.powerCapacity}
                placeholder="3-Phase 200A"
                onChange={(event) => set("powerCapacity", event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sound">Sound rating</Label>
              <Input
                id="sound"
                value={form.soundproofRating}
                placeholder="STC 60"
                onChange={(event) => set("soundproofRating", event.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ images */}
        <section className={sectionCard}>
          <h2 className={sectionTitle}>
            <ImageIcon className="size-5 text-brand" />
            Images
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Paste direct image links (imgbb, Cloudinary or Unsplash). The first
            image is the cover shown in the catalogue, so it must be a full
            http(s) link.
          </p>
          {error("images")}

          <div className="mt-6 flex flex-col gap-5">
            {form.images.map((image, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start"
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`image-url-${index}`}>
                    {index === 0 ? "Cover image URL" : `Image ${index + 1} URL`}
                  </Label>
                  <Input
                    id={`image-url-${index}`}
                    value={image.url}
                    placeholder="https://..."
                    aria-invalid={index === 0 && Boolean(errors.images)}
                    onChange={(event) =>
                      setImage(index, "url", event.target.value)
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={`image-caption-${index}`}>Caption</Label>
                  <Input
                    id={`image-caption-${index}`}
                    value={image.caption}
                    placeholder="Main cyclorama wall"
                    onChange={(event) =>
                      setImage(index, "caption", event.target.value)
                    }
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="sm:mt-6"
                  aria-label={`Remove image ${index + 1}`}
                  disabled={form.images.length === 1}
                  onClick={() => removeImage(index)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={addImage}
          >
            <PlusIcon />
            Add another image
          </Button>
        </section>

        {/* ------------------------------------------------------- descriptions */}
        <section className={sectionCard}>
          <h2 className={sectionTitle}>
            <ListChecksIcon className="size-5 text-brand" />
            Amenities, gear and rules
          </h2>
          <div className="mt-7 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <Label>Amenities</Label>
              {form.amenities.length === 0 ? (
                <div className="flex flex-wrap gap-2">
                  {amenityPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() =>
                        set("amenities", [...form.amenities, preset])
                      }
                      className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              ) : null}
              <TagInput
                values={form.amenities}
                onChange={(values) => set("amenities", values)}
                placeholder="Add an amenity"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label>Gear included</Label>
              <TagInput
                values={form.includedGear}
                onChange={(values) => set("includedGear", values)}
                placeholder="Add a piece of gear"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label>House rules</Label>
              <TagInput
                values={form.rules}
                onChange={(values) => set("rules", values)}
                placeholder="Add a rule"
              />
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------------------- aside */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="flex items-center gap-2.5 font-heading text-lg">
            <UserIcon className="size-4 text-brand" />
            Hosted by
          </h2>
          <dl className="mt-5 flex flex-col gap-3 text-sm">
            <div className="flex flex-col gap-1">
              <dt className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Name
              </dt>
              <dd>{host.name}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Email
              </dt>
              <dd className="break-all">{host.email}</dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Taken from your signed-in account and shown to visitors on the
            listing. It cannot be edited here.
          </p>

          <Button type="submit" size="lg" className="mt-6 h-11 w-full" disabled={submitting}>
            {submitting ? <Spinner /> : null}
            {mode === "edit" ? "Save changes" : "Publish listing"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full"
            render={<Link href="/my-listings" />}
            nativeButton={false}
          >
            Discard
          </Button>
        </div>
      </aside>
    </form>
  );
}
