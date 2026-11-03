"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "cn";

import { imageProps } from "@/lib/format";
import type { StudioImage } from "@/lib/types";

/**
 * One large frame with a thumbnail strip. The opening clip-path is the app's
 * signature "shutter" motion, used once on this page.
 */
export function StudioGallery({
  images,
  title,
}: {
  images: StudioImage[];
  title: string;
}) {
  const list =
    images && images.length > 0
      ? images
      : [{ url: "/studios/photo-studio-cyc.png", caption: title }];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="flex flex-col gap-3">
      <div className="animate-shutter relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
        <Image
          {...imageProps(current.url)}
          alt={current.caption || title}
          fill
          priority
          sizes="(min-width: 1024px) 62vw, 92vw"
          className="object-cover"
        />
      </div>

      {list.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {list.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={image.caption || `View image ${index + 1}`}
              aria-current={index === active}
              className={cn(
                "relative aspect-[4/3] overflow-hidden rounded-md bg-muted ring-1 transition-colors",
                index === active
                  ? "ring-2 ring-brand"
                  : "ring-border hover:ring-foreground/40",
              )}
            >
              <Image
                {...imageProps(image.url)}
                alt=""
                fill
                sizes="15vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
