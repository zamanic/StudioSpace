"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Slider from "react-slick";
import type { Settings } from "react-slick";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "cn";

import "slick-carousel/slick/slick.css";

import { imageProps } from "@/lib/format";
import type { StudioImage } from "@/lib/types";

const FALLBACK: StudioImage = { url: "/studios/photo-studio-cyc.png" };

function GalleryArrow({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick?: () => void;
  label: string;
}) {
  const Icon = direction === "prev" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70",
        direction === "prev" ? "left-4" : "right-4",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}

/**
 * Studio photo gallery driven by react-slick. A single frame slides between
 * photographs with custom arrows and dots, and the thumbnail strip below
 * jumps straight to a picture. The opening clip-path is the app's signature
 * "shutter" motion, used once on this page.
 */
export function StudioGallery({
  images,
  title,
}: {
  images: StudioImage[];
  title: string;
}) {
  const list = images && images.length > 0 ? images : [FALLBACK];
  const [active, setActive] = useState(0);
  const sliderRef = useRef<Slider>(null);
  const multiple = list.length > 1;

  const settings: Settings = {
    dots: multiple,
    arrows: multiple,
    infinite: multiple,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    dotsClass: "slick-dots space-gallery-dots",
    prevArrow: <GalleryArrow direction="prev" label="Previous photograph" />,
    nextArrow: <GalleryArrow direction="next" label="Next photograph" />,
    beforeChange: (_current, next) => setActive(next),
  };

  return (
    <div className="space-gallery flex flex-col gap-3">
      <div className="animate-shutter relative aspect-[16/10] overflow-hidden rounded-lg bg-muted">
        <Slider ref={sliderRef} {...settings}>
          {list.map((image, index) => (
            <div key={`${image.url}-${index}`} className="h-full w-full">
              <div className="relative h-full w-full">
                <Image
                  {...imageProps(image.url)}
                  alt={image.caption || `${title} photograph ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 62vw, 92vw"
                  className="object-cover"
                />
              </div>
            </div>
          ))}
        </Slider>

        {multiple ? (
          <p className="absolute bottom-4 left-4 z-10 rounded-full bg-black/55 px-2.5 py-1 text-[0.68rem] font-medium tracking-[0.14em] text-white/90 uppercase backdrop-blur-sm">
            {active + 1} / {list.length}
          </p>
        ) : null}
      </div>

      {multiple ? (
        <div className="grid grid-cols-4 gap-3">
          {list.map((image, index) => (
            <button
              key={`thumb-${image.url}-${index}`}
              type="button"
              onClick={() => sliderRef.current?.slickGoTo(index)}
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
