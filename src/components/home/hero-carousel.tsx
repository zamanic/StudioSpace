"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, EffectFade, Pagination } from "swiper/modules";
import { ApertureIcon } from "lucide-react";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

import { Button } from "@/components/ui/button";
import { imageProps } from "@/lib/format";

const slides = [
  {
    image: "/studios/film-stage-crew.jpg",
    alt: "A film crew working on a lit sound stage",
    caption: "Sound Stage · Dhaka",
  },
  {
    image: "/studios/photo-studio-cyc.png",
    alt: "A white cyclorama wall inside a photography studio",
    caption: "Photo Studio · Chattogram",
  },
  {
    image: "/studios/music-suite-console.jpg",
    alt: "A large analogue mixing console in a music suite",
    caption: "Music Suite · Sylhet",
  },
];

/**
 * Home hero. Three photographs crossfade behind a headline that sits in the
 * empty upper zone, with one action and nothing else. The wrapper opens from
 * the left edge once on load - the "shutter image" motion - and the first
 * picture settles from 1.12 to rest behind it.
 */
export function HeroCarousel() {
  return (
    <section className="relative isolate h-[100svh] max-h-[920px] min-h-[620px] w-full overflow-hidden bg-foreground">
      <div className="animate-shutter h-full w-full">
        <Swiper
          className="h-full w-full"
          modules={[Autoplay, EffectFade, Pagination, A11y]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          speed={1400}
          loop
          autoplay={{ delay: 6500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          a11y={{
            containerMessage: "Featured studio spaces",
            paginationBulletMessage: "Go to slide {{index}}",
          }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={slide.image}>
              <div className="relative h-full w-full">
                <Image
                  {...imageProps(slide.image)}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className={`object-cover ${index === 0 ? "animate-settle" : ""}`}
                />
                {/* Scrim sits only where text lives - the lower half of the
                    photograph stays untouched, but the top is dark enough that
                    white type holds contrast on every slide. */}
                <div className="absolute inset-x-0 top-0 h-[72%] bg-gradient-to-b from-black/75 via-black/35 to-transparent" />
                <p className="absolute right-5 bottom-6 text-[0.7rem] tracking-[0.18em] text-white/70 uppercase sm:right-8">
                  {slide.caption}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Static overlay: the type never moves, the photographs do. */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="mx-auto flex h-full w-full max-w-[1400px] flex-col px-5 pt-[16svh] sm:px-8">
          <span className="rise inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-[0.62rem] font-medium tracking-[0.22em] text-white uppercase backdrop-blur-md">
            <ApertureIcon className="size-3.5" />
            Next-Gen Creative Studios
          </span>

          <h1 className="rise-2 display mt-6 max-w-[16ch] text-[clamp(2.75rem,7.6vw,6.5rem)] text-white">
            Find the room
            <br />
            the work deserves
          </h1>

          {/* The sentence breaks at the horizon so the photograph shows
              through the gap between the two halves. */}
          <p className="rise-3 mt-8 hidden max-w-[1300px] grid-cols-12 gap-0 text-[1.05rem] leading-relaxed text-white/85 lg:grid">
            <span className="col-span-5 text-right">
              Photo studios, sound stages and podcast rooms,
            </span>
            <span className="col-span-2" aria-hidden="true" />
            <span className="col-span-5">
              each one listed by the person who built it.
            </span>
          </p>
          <p className="rise-3 mt-6 max-w-[36ch] text-[1.05rem] leading-relaxed text-white/85 lg:hidden">
            Photo studios, sound stages and podcast rooms, each one listed by
            the person who built it.
          </p>

          <div className="rise-3 pointer-events-auto mt-auto flex flex-wrap items-center gap-5 pb-14 lg:pb-16">
            <Button
              size="lg"
              variant="secondary"
              className="h-11 px-6 text-sm"
              render={<Link href="/studios" />}
              nativeButton={false}
            >
              Explore Studios
            </Button>
            <Link
              href="/add-studio"
              className="text-sm text-white/85 underline decoration-white/35 underline-offset-4 transition-colors hover:decoration-white"
            >
              Host Your Space
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
