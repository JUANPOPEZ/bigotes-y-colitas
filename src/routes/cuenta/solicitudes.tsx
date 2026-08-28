import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { solicitudes } from "@/mock";
import { MAX_SOLICITUDES_ACTIVAS, esEnTramite, puedeCrearSolicitud } from "@/lib/reglas-solicitudes";
import { usuarioDemo } from "@/lib/mock-session";
import type { Solicitud } from "@/types";

export const Route = createFileRoute("/cuenta/solicitudes")({
  head: () => ({
    meta: [
      { title: "Mis solicitudes de adopción — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Consulta el estado y la cronología de cada una de tus solicitudes de adopción en Bigotes y Colitas.",
      },
      { property: "og:title", content: "Mis solicitudes de adopción — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Seguimiento paso a paso de tus procesos de adopción.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const grupos = ["Todas", "En curso", "Aprobadas", "Entregadas", "Rechazadas"] as const;

function Pagina() {
  const [grupo, setGrupo] = useState<(typeof grupos)[number]>("Todas");
  const [detalle, setDetalle] = useState<Solicitud | null>(null);
  const { activas, restantes, permitido } = puedeCrearSolicitud(usuarioDemo.correo);

  const lista = solicitudes.filter((s) => {
    if (grupo === "Aprobadas") return s.estado === "Aprobada";
    if (grupo === "Entregadas") return s.estado === "Entregado";
    if (grupo === "Rechazadas") return s.estado === "Rechazada";
    if (grupo === "En curso") return esEnTramite(s.estado);
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Mis solicitudes</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Revisa el avance de cada proceso y la próxima acción esperada.
        </p>
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-sm ${
          permitido ? "border-border bg-cream/60" : "border-destructive/30 bg-destructive/10 text-destructive"
        }`}
      >
        <p>
          Tienes <span className="font-semibold">{activas}</span> de {MAX_SOLICITUDES_ACTIVAS} solicitudes
          en proceso.{" "}
          {permitido
            ? `Puedes enviar ${restantes} solicitud${restantes === 1 ? "" : "es"} más. Al aprobarse una solicitud se libera un cupo.`
            : "Debes esperar la resolución de un proceso en curso antes de enviar otra solicitud."}
        </p>
        {permitido && (
          <Button asChild size="sm" variant="outline">
            <Link to="/adopta">Nueva solicitud</Link>
          </Button>
        )}
      </div>



      <Tabs value={grupo} onValueChange={(v) => setGrupo(v as (typeof grupos)[number])}>
        <TabsList>
          {grupos.map((g) => (
            <TabsTrigger key={g} value={g}>
              {g}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {lista.length === 0 ? (
        <EmptyState
          icono={FileText}
          titulo="Sin solicitudes en esta categoría"
          descripcion="Cuando envíes una solicitud aparecerá aquí con su cronología."
          accion={
            <Button asChild>
              <Link to="/mascotas">Ver mascotas disponibles</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {lista.map((s) => (
            <Card key={s.id} className="border-border/80 shadow-none">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-display text-lg font-semibold">{s.mascota}</p>
                    <EstadoBadge estado={s.estado} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enviada el {s.fecha} · {s.ciudad}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Último avance: {s.cronologia[s.cronologia.length - 1]?.titulo}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDetalle(s)}>
                    Ver seguimiento
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link to="/mascotas/$id" params={{ id: s.mascotaId }}>
                      Ver mascota
                    </Link>
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
            <DialogTitle>Seguimiento de la solicitud</DialogTitle>
            <DialogDescription>
              {detalle ? `Mascota ${detalle.mascota} · Estado ${detalle.estado}` : ""}
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-4 border-l pl-5">
            {detalle?.cronologia.map((c) => (
              <li key={c.titulo} className="relative">
                <span className="absolute -left-[26px] top-1.5 size-2.5 rounded-full bg-mustard" />
                <p className="text-sm font-medium">{c.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {c.fecha} · {c.detalle}
                </p>
              </li>
            ))}
          </ol>
        </DialogContent>
      </Dialog>
    </div>
  );
}
