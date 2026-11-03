import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70svh] w-full max-w-[1400px] flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
      <p className="text-[0.7rem] font-medium tracking-[0.24em] text-muted-foreground uppercase">
        Error 404
      </p>
      <h1 className="display mt-6 text-[clamp(3rem,9vw,7rem)]">
        This room is empty
      </h1>
      <p className="mt-6 max-w-[46ch] text-[0.95rem] leading-relaxed text-muted-foreground">
        The page you asked for has been struck off the schedule. The studios
        are all still where you left them.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" render={<Link href="/" />} nativeButton={false}>
          Return to Home
        </Button>
        <Button
          size="lg"
          variant="outline"
          render={<Link href="/studios" />}
          nativeButton={false}
        >
          Explore Studios
        </Button>
      </div>
    </section>
  );
}
