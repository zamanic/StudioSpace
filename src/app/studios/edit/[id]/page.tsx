import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { EmptyState } from "@/components/empty-state";
import { StudioForm } from "@/components/studios/studio-form";
import { ApiError, api } from "@/lib/api";
import { auth } from "@/lib/auth";
import type { Studio } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit a listing",
};

type Params = Promise<{ id: string }>;

export default async function EditStudioPage({ params }: { params: Params }) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(`/login?redirect=/studios/edit/${id}`);

  let studio: Studio | null = null;
  try {
    studio = await api.getStudio(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    return (
      <div className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8">
        <EmptyState
          title="The listing could not be loaded"
          description="Start the StudioSpace API on port 8000 and reload the page."
          actionLabel="Back to my listings"
          actionHref="/my-listings"
        />
      </div>
    );
  }

  const isOwner =
    String(studio.host?.email ?? "").toLowerCase() ===
    String(session.user.email).toLowerCase();

  if (!isOwner) {
    return (
      <div className="mx-auto w-full max-w-[1400px] px-5 py-24 sm:px-8">
        <EmptyState
          title="This listing is not yours to edit"
          description="Only the host who published a space can change it. Your own listings live on the My Studio Listings page."
          actionLabel="Go to my listings"
          actionHref="/my-listings"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <header className="max-w-[44rem]">
        <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          Editing
        </p>
        <h1 className="display rise mt-5 text-[clamp(2.25rem,4.6vw,3.75rem)]">
          {studio.title}
        </h1>
        <p className="rise-2 mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
          Save your changes and the catalogue updates the moment you publish.
          Bookings already placed keep the terms they were made under.
        </p>
      </header>

      <div className="mt-14">
        <StudioForm
          mode="edit"
          studio={studio}
          host={{ name: session.user.name, email: session.user.email }}
        />
      </div>
    </div>
  );
}
