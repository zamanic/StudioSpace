"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "cn";
import {
  ApertureIcon,
  CalendarCheckIcon,
  ChevronDownIcon,
  HeartIcon,
  HomeIcon,
  LayoutGridIcon,
  LogOutIcon,
  MenuIcon,
  PlusIcon,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * "How It Works" and "About Us" land on the matching home-page sections
 * (`#how-it-works`, `#about`) so the nav jumps straight to the explanation,
 * per the difference spec. The fuller `/how-it-works` and `/about` routes stay
 * reachable from the footer and from the section CTAs.
 */
const links = [
  { href: "/", label: "Home", path: "/" },
  { href: "/studios", label: "Explore Studios", path: "/studios" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/#about", label: "About Us" },
];

const accountLinks = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/add-studio", label: "Add New Studio", icon: PlusIcon },
  { href: "/my-listings", label: "My Studio Listings", icon: LayoutGridIcon },
  { href: "/my-bookings", label: "My Bookings", icon: CalendarCheckIcon },
  { href: "/my-wishlist", label: "Saved Studios", icon: HeartIcon },
];

/**
 * Jumps to the section a "#hash" nav link points at and draws a one-shot ring
 * on it.
 *
 * Two behaviours are handled by hand rather than left to the browser:
 * 1. The router updates the URL with pushState, which never recomputes `:target`,
 *    so the highlight class is applied manually once the target has mounted.
 * 2. Next's own hash scroll runs before the Suspense-wrapped grid above the
 *    section has settled, which leaves the page a few hundred pixels short on a
 *    cross-route jump. Re-scrolling to the element once the layout has settled
 *    makes the landing position identical from every route.
 */
function flashSection(href: string) {
  const id = href.split("#")[1];
  if (!id) return;

  let attempts = 0;
  const reveal = () => {
    const section = document.getElementById(id);
    if (!section) {
      if (attempts++ < 25) window.setTimeout(reveal, 60);
      return;
    }

    const settle = () =>
      section.scrollIntoView({ behavior: "smooth", block: "start" });

    settle();
    window.setTimeout(settle, 450);

    section.classList.remove("section-flash");
    void section.offsetWidth; // restart the animation on a repeat click
    section.classList.add("section-flash");
    window.setTimeout(() => section.classList.remove("section-flash"), 1800);
  };

  window.setTimeout(reveal, 60);
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session?.user;

  const isActive = (path?: string) =>
    path === "/" ? pathname === "/" : path ? pathname.startsWith(path) : false;

  const handleSignOut = async () => {
    await authClient.signOut();
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const initials =
    user?.name?.trim()?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    "S";

  const displayName = user?.name?.trim() || user?.email || "Account";

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-md"
          aria-label="StudioSpace home"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground">
            <ApertureIcon className="size-5" />
          </span>
          <span className="flex flex-col">
            <span className="display text-lg leading-none tracking-tight sm:text-xl">
              StudioSpace
            </span>
            <span className="mt-1 hidden text-[0.58rem] font-medium tracking-[0.2em] text-muted-foreground uppercase sm:block">
              Production spaces, by the hour
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.path) ? "page" : undefined}
                onClick={() => flashSection(link.href)}
                className={cn(
                  "text-[0.9rem] tracking-[0.01em] transition-colors",
                  isActive(link.path)
                    ? "text-foreground underline decoration-foreground/40 decoration-1 underline-offset-[6px]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Account menu"
                className="flex items-center gap-2 rounded-full border border-border bg-background/60 py-1 pr-2.5 pl-1 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Avatar className="size-7">
                  <AvatarImage
                    src={user.image as string}
                    referrerPolicy="no-referrer"
                    alt=""
                  />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:inline">
                  {displayName}
                </span>
                <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Base UI's group label may only be rendered inside a group,
                    so the identity block and the account links share one. */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="truncate font-medium text-foreground">
                      {user.name}
                    </span>
                    <span className="truncate text-xs font-normal">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accountLinks.map((item) => (
                    <DropdownMenuItem
                      key={item.href}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                  <LogOutIcon />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/login" />}
                nativeButton={false}
              >
                Login
              </Button>
              <Button
                size="sm"
                render={<Link href="/register" />}
                nativeButton={false}
              >
                Register
              </Button>
            </div>
          )}

          <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
            <DialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="lg:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <MenuIcon />
            </DialogTrigger>
            <DialogContent
              showCloseButton={false}
              className="top-0 left-auto right-0 inset-y-0 h-full max-h-none w-[84%] max-w-xs translate-x-0 translate-y-0 content-start gap-0 rounded-none border-l border-border bg-popover p-0 data-open:slide-in-from-right data-closed:slide-out-to-right"
            >
              <DialogTitle className="px-6 pt-7 pb-4 text-[0.7rem] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Menu
              </DialogTitle>

              <nav className="flex flex-col px-3">
                {links.map((link) => (
                  <DialogClose
                    key={link.href}
                    render={<Link href={link.href} />}
                    nativeButton={false}
                    className={cn(
                      "rounded-md px-3 py-3 text-base transition-colors",
                      isActive(link.path)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    onClick={() => {
                      setMenuOpen(false);
                      flashSection(link.href);
                    }}
                  >
                    {link.label}
                  </DialogClose>
                ))}
              </nav>

              <div className="mt-4 border-t border-border px-3 pt-4">
                {user ? (
                  <>
                    <div className="px-3 pb-3">
                      <p className="truncate text-sm font-medium">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    {accountLinks.map((item) => (
                      <DialogClose
                        key={item.href}
                        render={<Link href={item.href} />}
                        nativeButton={false}
                        className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => setMenuOpen(false)}
                      >
                        <item.icon className="size-4" />
                        {item.label}
                      </DialogClose>
                    ))}
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                    >
                      <LogOutIcon className="size-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1 pt-1">
                    <Button
                      variant="outline"
                      render={<Link href="/login" />}
                      nativeButton={false}
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Button>
                    <Button
                      render={<Link href="/register" />}
                      nativeButton={false}
                      onClick={() => setMenuOpen(false)}
                    >
                      Register
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </nav>
    </header>
  );
}
