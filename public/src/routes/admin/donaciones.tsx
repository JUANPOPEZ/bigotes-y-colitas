import { createFileRoute } from "@tanstack/react-router";

import { CrudModule } from "@/components/shared/crud-module";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { campanas, donaciones } from "@/mock";
import type { Donacion } from "@/types";

export const Route = createFileRoute("/admin/donaciones")({
  head: () => ({
    meta: [
      { title: "Donaciones y campañas — Bigotes y Colitas" },
      { name: "description", content: "Registro de donaciones monetarias y en especie, y avance de las campañas activas." },
      { property: "og:title", content: "Donaciones y campañas — Bigotes y Colitas" },
      { property: "og:description", content: "Control de aportes recibidos y campañas de recaudación." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

function Pagina() {
  return (
    <CrudModule<Donacion>
      titulo="Donaciones y campañas"
      descripcion="Registra los aportes recibidos, valida su estado y controla el avance de cada campaña."
      datos={donaciones}
      etiquetaNuevo="Registrar donación"
      buscarEn={(d) => `${d.donante} ${d.tipo} ${d.detalle}`}
      filtros={[
        { key: "tipo", label: "Tipo", opciones: ["Dinero", "Alimentos", "Medicamentos", "Juguetes", "Cobijas", "Accesorios"] },
        { key: "estado", label: "Estado", opciones: ["Recibida", "Pendiente", "En tránsito"] },
      ]}
      valorFiltro={(d, key) => String(d[key as keyof Donacion] ?? "")}
      columnas={[
        { key: "donante", header: "Donante", valor: (d) => d.donante, ordenable: true },
        { key: "tipo", header: "Tipo", valor: (d) => d.tipo, ordenable: true },
        { key: "detalle", header: "Detalle", valor: (d) => d.detalle },
        {
          key: "monto",
          header: "Monto",
          valor: (d) => d.monto ?? 0,
          ordenable: true,
          render: (d) => (d.monto ? cop.format(d.monto) : "En especie"),
        },
        { key: "fecha", header: "Fecha", valor: (d) => d.fecha, ordenable: true },
        {
          key: "estado",
          header: "Estado",
          valor: (d) => d.estado,
          render: (d) => <EstadoBadge estado={d.estado} />,
        },
      ]}
      campos={[
        { name: "donante", label: "Donante", ancho: "medio" },
        {
          name: "tipo",
          label: "Tipo de donación",
          tipo: "select",
          opciones: ["Dinero", "Alimentos", "Medicamentos", "Juguetes", "Cobijas", "Accesorios"],
          ancho: "medio",
        },
        { name: "monto", label: "Monto (COP)", tipo: "numero", ancho: "medio" },
        { name: "fecha", label: "Fecha", tipo: "fecha", ancho: "medio" },
        { name: "estado", label: "Estado", tipo: "select", opciones: ["Recibida", "Pendiente", "En tránsito"], ancho: "medio" },
        { name: "detalle", label: "Detalle", tipo: "textarea" },
      ]}
      extra={
        <div className="grid gap-4 sm:grid-cols-3">
          {campanas.map((c) => {
            const pct = Math.round((c.recaudado / c.meta) * 100);
            return (
              <Card key={c.id} className="border-border/80 shadow-none">
                <CardContent className="p-5">
                  <p className="text-sm font-semibold">{c.titulo}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Cierre: {c.cierre}</p>
                  <Progress value={pct} className="mt-3" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    {cop.format(c.recaudado)} de {cop.format(c.meta)} · {pct}%
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      }
    />
  );
}
