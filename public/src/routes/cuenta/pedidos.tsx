import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { pedidos, productos } from "@/mock";
import type { Pedido } from "@/types";

export const Route = createFileRoute("/cuenta/pedidos")({
  head: () => ({
    meta: [
      { title: "Mis pedidos — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Consulta el estado de tus compras en la tienda solidaria de Bigotes y Colitas y su seguimiento de envío.",
      },
      { property: "og:title", content: "Mis pedidos — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Seguimiento de compras que financian el cuidado de los rescatados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const moneda = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const etapas = ["Pendiente", "Preparando", "Enviado", "Entregado"];

function Pagina() {
  const [detalle, setDetalle] = useState<Pedido | null>(null);
  const mios = pedidos;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Mis pedidos</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Cada compra en la tienda solidaria financia alimento y atención veterinaria.
        </p>
      </div>

      {mios.length === 0 ? (
        <EmptyState
          icono={ShoppingBag}
          titulo="Aún no tienes pedidos"
          descripcion="Visita la tienda solidaria y apoya la causa con tu compra."
          accion={
            <Button asChild>
              <Link to="/tienda">Ir a la tienda</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {mios.map((p) => (
            <Card key={p.id} className="border-border/80 shadow-none">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-display text-base font-semibold">Pedido #{p.id}</p>
                    <EstadoBadge estado={p.estado} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.fecha} · {p.articulos} artículo(s) · {moneda.format(p.total)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDetalle(p)}>
                    Ver detalle
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => toast.success("Factura descargada (simulado)")}
                  >
                    Factura
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={detalle !== null} onOpenChange={(o) => !o && setDetalle(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pedido #{detalle?.id}</DialogTitle>
            <DialogDescription>
              Realizado el {detalle?.fecha} · Total {detalle ? moneda.format(detalle.total) : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {productos.slice(0, detalle?.articulos ?? 1).map((pr) => (
              <div key={pr.id} className="flex items-center gap-3">
                <img
                  src={pr.imagen}
                  alt={pr.nombre}
                  className="size-12 rounded-xl object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-medium">{pr.nombre}</p>
                  <p className="text-xs text-muted-foreground">{pr.categoria}</p>
                </div>
                <span className="ml-auto text-sm">{moneda.format(pr.precio)}</span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <p className="mb-3 text-sm font-medium">Seguimiento</p>
            <ol className="grid gap-2 text-xs sm:grid-cols-4">
              {etapas.map((e, i) => {
                const alcanzada =
                  detalle?.estado === "Cancelado"
                    ? false
                    : i <= etapas.indexOf(detalle?.estado ?? "Pendiente");
                return (
                  <li
                    key={e}
                    className={alcanzada ? "font-medium text-foreground" : "text-muted-foreground"}
                  >
                    {i + 1}. {e}
                  </li>
                );
              })}
            </ol>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
