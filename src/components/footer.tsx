import Link from "next/link";

import { NewsletterForm } from "@/components/newsletter-form";
import { CATEGORIES } from "@/lib/types";

const quickLinks = [
  { href: "/studios", label: "Explore Studios" },
  { href: "/add-studio", label: "List Your Studio" },
  { href: "/my-bookings", label: "My Bookings" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About Us" },
];

function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="/" className="display text-2xl">
              StudioSpace
            </Link>
            <p className="mt-4 max-w-[38ch] text-[0.95rem] leading-relaxed text-muted-foreground">
              We help photographers, filmmakers and podcasters find a room that
              is right for the work — booked by the hour, from the people who
              built it.
            </p>

            <div className="mt-8">
              <p className="text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                New rooms, once a month
              </p>
              <div className="mt-3">
                <NewsletterForm />
              </div>
            </div>
          </div>

          <nav aria-labelledby="footer-quick-links">
            <h2
              id="footer-quick-links"
              className="text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase"
            >
              Quick links
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.95rem] text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-categories">
            <h2
              id="footer-categories"
              className="text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase"
            >
              Popular categories
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    href={`/studios?category=${encodeURIComponent(category)}`}
                    className="text-[0.95rem] text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col-reverse gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StudioSpace. Photographs from Wikimedia
            Commons and rawpixel, used under their respective licences.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="StudioSpace on X"
              className="rounded-full border border-border p-2 text-foreground transition-colors hover:bg-muted"
            >
              <XLogo className="size-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="StudioSpace on Instagram"
              className="rounded-full border border-border p-2 text-foreground transition-colors hover:bg-muted"
            >
              <InstagramLogo className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
