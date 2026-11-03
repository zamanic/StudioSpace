"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "cn";
import {
  CalendarCheckIcon,
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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/studios", label: "Explore Studios" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About Us" },
];

const accountLinks = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/add-studio", label: "Add New Studio", icon: PlusIcon },
  { href: "/my-listings", label: "My Studio Listings", icon: LayoutGridIcon },
  { href: "/my-bookings", label: "My Bookings", icon: CalendarCheckIcon },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session?.user;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

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

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="display text-lg tracking-tight transition-opacity hover:opacity-70 sm:text-xl"
        >
          StudioSpace
        </Link>

        <ul className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "text-[0.9rem] tracking-[0.01em] transition-colors",
                  isActive(link.href)
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
                className="rounded-full ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar className="size-8">
                  <AvatarImage
                    src={user.image as string}
                    referrerPolicy="no-referrer"
                    alt=""
                  />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
                    className={cn(
                      "rounded-md px-3 py-3 text-base transition-colors",
                      isActive(link.href)
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </DialogClose>
                ))}
              </nav>

              <div className="mt-4 border-t border-border px-3 pt-4">
                {user ? (
                  <>
                    <div className="px-3 pb-3">
                      <p className="truncate text-sm font-medium">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    {accountLinks.map((item) => (
                      <DialogClose
                        key={item.href}
                        render={<Link href={item.href} />}
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
