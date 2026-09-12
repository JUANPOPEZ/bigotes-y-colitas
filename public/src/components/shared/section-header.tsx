import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SectionHeader({
  eyebrow,
  titulo,
  descripcion,
  accion,
  className,
  center,
}: {
  eyebrow?: string;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
  className?: string;
  center?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        center && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", center && "mx-auto")}>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">{titulo}</h2>
        {descripcion && (
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{descripcion}</p>
        )}
      </div>
      {accion}
    </div>
  );
}
