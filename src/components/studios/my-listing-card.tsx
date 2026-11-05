"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BadgeDollarSignIcon,
  EyeIcon,
  PencilIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ApiError, api } from "@/lib/api";
import { currency, excerpt, imageProps, primaryImage } from "@/lib/format";
import { getTokenFromClient } from "@/lib/getTokenFromClient";
import type { Studio } from "@/lib/types";

export function MyListingCard({ studio }: { studio: Studio }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const token = await getTokenFromClient();
    if (!token) {
      setDeleting(false);
      toast.error("Your session expired. Please sign in again.");
      router.push("/login?redirect=/my-listings");
      return;
    }

    try {
      await api.deleteStudio(studio._id, token);
      toast.success("Listing removed", {
        description: `${studio.title} is no longer on the catalogue.`,
      });
      setOpen(false);
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) toast.error(error.message);
      else toast.error("Could not reach the server. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Link
          href={`/studios/${studio._id}`}
          className="absolute inset-0"
          aria-label={`View ${studio.title}`}
        >
          <Image
            {...imageProps(primaryImage(studio))}
            alt={studio.title}
            fill
            sizes="(min-width:1024px) 30vw, 92vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04]"
          />
        </Link>

        {/* The same two corner badges the catalogue card uses, so a host
            recognises their own listing in either place. */}
        <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center rounded-full bg-black/65 px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.12em] text-white uppercase backdrop-blur-sm">
          {studio.category}
        </span>

        <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-baseline gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {currency(studio.pricing?.hourlyRate)}
          <span className="text-[0.65rem] font-normal text-white/75">/ hr</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h2 className="font-heading text-lg leading-snug">
          <Link href={`/studios/${studio._id}`} className="hover:opacity-70">
            {studio.title}
          </Link>
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {excerpt(studio.tagline || studio.description, 84)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <UsersIcon className="size-3.5 shrink-0" />
            Up to {studio.specs?.maxCapacity} creators
          </span>
          <span className="inline-flex items-center gap-1.5">
            <BadgeDollarSignIcon className="size-3.5 shrink-0" />
            Deposit: {currency(studio.pricing?.securityDeposit)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/studios/edit/${studio._id}`} />}
            nativeButton={false}
          >
            <PencilIcon />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href={`/studios/${studio._id}`} />}
            nativeButton={false}
          >
            <EyeIcon />
            View
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto"
            onClick={() => setOpen(true)}
          >
            <Trash2Icon />
            Delete
          </Button>
        </div>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              {studio.title} will be removed from the catalogue for every
              visitor. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Keep it</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={handleDelete}
            >
              {deleting ? <Spinner /> : null}
              Delete listing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
