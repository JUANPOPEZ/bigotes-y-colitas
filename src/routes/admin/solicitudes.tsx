import { createFileRoute } from "@tanstack/react-router";

import { CrudModule } from "@/components/shared/crud-module";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { solicitudes } from "@/mock";
import { ciudades } from "@/mock/mascotas";
import type { Solicitud } from "@/types";

export const Route = createFileRoute("/admin/solicitudes")({
  head: () => ({
    meta: [
      { title: "Solicitudes de adopción — Bigotes y Colitas" },
      { name: "description", content: "Revisa, filtra y actualiza el estado de las solicitudes de adopción." },
      { property: "og:title", content: "Solicitudes de adopción — Bigotes y Colitas" },
      { property: "og:description", content: "Seguimiento del proceso de adopción: revisión, entrevista, visita y aprobación." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const estados = ["Pendiente", "En revisión", "Entrevista", "Visita", "Aprobada", "Entregado", "Rechazada"];

function Pagina() {
  return (
    <CrudModule<Solicitud>
      titulo="Solicitudes de adopción"
      descripcion="Gestiona el flujo completo: revisión de documentos, entrevista, visita domiciliaria y decisión final."
      datos={solicitudes}
      etiquetaNuevo="Registrar solicitud"
      buscarEn={(s) => `${s.solicitante} ${s.mascota} ${s.correo} ${s.ciudad}`}
      filtros={[
        { key: "estado", label: "Estado", opciones: estados },
        { key: "ciudad", label: "Ciudad", opciones: ciudades },
      ]}
      valorFiltro={(s, key) => String(s[key as keyof Solicitud] ?? "")}
      columnas={[
        { key: "id", header: "Folio", valor: (s) => s.id, ordenable: true },
        { key: "solicitante", header: "Solicitante", valor: (s) => s.solicitante, ordenable: true },
        { key: "mascota", header: "Mascota", valor: (s) => s.mascota, ordenable: true },
        { key: "ciudad", header: "Ciudad", valor: (s) => s.ciudad },
        { key: "fecha", header: "Fecha", valor: (s) => s.fecha, ordenable: true },
        {
          key: "estado",
          header: "Estado",
          valor: (s) => s.estado,
          ordenable: true,
          render: (s) => <EstadoBadge estado={s.estado} />,
        },
      ]}
      campos={[
        { name: "solicitante", label: "Solicitante", ancho: "medio" },
        { name: "correo", label: "Correo", ancho: "medio" },
        { name: "mascota", label: "Mascota", ancho: "medio" },
        { name: "ciudad", label: "Ciudad", tipo: "select", opciones: ciudades, ancho: "medio" },
        { name: "fecha", label: "Fecha de solicitud", tipo: "fecha", ancho: "medio" },
        { name: "estado", label: "Estado", tipo: "select", opciones: estados, ancho: "medio" },
        { name: "observaciones", label: "Observaciones internas", tipo: "textarea" },
      ]}
      detalle={(s) => (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-xl font-semibold">{s.solicitante}</p>
            <EstadoBadge estado={s.estado} />
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Folio", s.id],
              ["Mascota", s.mascota],
              ["Correo", s.correo],
              ["Ciudad", s.ciudad],
              ["Fecha", s.fecha],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-cream/60 p-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="text-sm font-semibold">Cronología del proceso</p>
            <ol className="mt-3 space-y-4 border-l border-border pl-5">
              {s.cronologia.map((c) => (
                <li key={`${c.fecha}-${c.titulo}`} className="relative">
                  <span
                    className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-background bg-secondary"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium">{c.titulo}</p>
                  <p className="text-xs text-muted-foreground">{c.fecha}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.detalle}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    />
  );
}
