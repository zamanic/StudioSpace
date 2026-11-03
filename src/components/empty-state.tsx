import Link from "next/link";
import { cn } from "cn";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

/** Every empty state in the app: one sentence, one way forward, plenty of air. */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-20 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-6 text-muted-foreground [&_svg]:size-7">{icon}</div>
      ) : null}
      <h2 className="font-heading text-2xl">{title}</h2>
      <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <Button
          className="mt-8"
          size="lg"
          render={<Link href={actionHref} />}
          nativeButton={false}
        >
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
