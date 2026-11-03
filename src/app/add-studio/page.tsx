import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { StudioForm } from "@/components/studios/studio-form";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add a studio",
  description: "List a creative workspace on StudioSpace.",
};

export default async function AddStudioPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/login?redirect=/add-studio");

  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
      <header className="max-w-[44rem]">
        <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
          Host tools
        </p>
        <h1 className="display rise mt-5 text-[clamp(2.25rem,4.6vw,3.75rem)]">
          List a space
        </h1>
        <p className="rise-2 mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">
          Write it the way you would describe it to a crew on the phone. The
          details that save a reshoot - ceiling height, power, load-in - are the
          ones worth getting right.
        </p>
      </header>

      <div className="mt-14">
        <StudioForm
          mode="create"
          host={{ name: session.user.name, email: session.user.email }}
        />
      </div>
    </div>
  );
}
