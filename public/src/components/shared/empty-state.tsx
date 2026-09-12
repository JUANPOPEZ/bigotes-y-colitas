import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { PawPrint } from "lucide-react";

export function EmptyState({
  icono: Icono = PawPrint,
  titulo,
  descripcion,
  accion,
}: {
  icono?: LucideIcon;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-cream/60 px-6 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Icono className="size-7" aria-hidden="true" />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold">{titulo}</h3>
      {descripcion && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{descripcion}</p>
      )}
      {accion && <div className="mt-6">{accion}</div>}
    </div>
  );
}
