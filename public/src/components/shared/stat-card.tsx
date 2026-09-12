import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  icono: Icono,
  valor,
  etiqueta,
  detalle,
}: {
  icono: LucideIcon;
  valor: string;
  etiqueta: string;
  detalle?: string;
}) {
  return (
    <Card className="border-border/80 shadow-none">
      <CardContent className="flex items-start gap-4 p-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <Icono className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-display text-2xl font-semibold leading-none">{valor}</p>
          <p className="mt-1.5 text-sm font-medium text-foreground">{etiqueta}</p>
          {detalle && <p className="mt-1 text-xs text-muted-foreground">{detalle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
