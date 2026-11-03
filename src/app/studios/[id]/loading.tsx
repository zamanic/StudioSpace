export default function StudioDetailLoading() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
      <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
      <div className="mt-6 h-3 w-24 animate-pulse rounded-full bg-muted" />
      <div className="mt-5 h-14 w-full max-w-[20ch] animate-pulse rounded bg-muted" />
      <div className="mt-6 h-4 w-full max-w-[52ch] animate-pulse rounded bg-muted" />

      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-14">
        <div className="flex flex-col gap-14">
          <div className="flex flex-col gap-3">
            <div className="aspect-[16/10] animate-pulse rounded-lg bg-muted" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/3] animate-pulse rounded-md bg-muted"
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="h-7 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>

        <div className="h-72 animate-pulse rounded-lg bg-muted" />
      </div>
    </div>
  );
}
