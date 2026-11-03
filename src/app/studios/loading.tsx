import { StudioCardSkeleton } from "@/components/studio-card";

export default function StudiosLoading() {
  return (
    <>
      <section className="mx-auto w-full max-w-[1400px] px-5 pt-16 pb-12 sm:px-8 sm:pt-20">
        <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
        <div className="mt-5 h-14 w-full max-w-[16ch] animate-pulse rounded bg-muted" />
        <div className="mt-6 h-4 w-full max-w-[52ch] animate-pulse rounded bg-muted" />
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-6 sm:px-8">
          <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <StudioCardSkeleton key={index} />
          ))}
        </div>
      </section>
    </>
  );
}
