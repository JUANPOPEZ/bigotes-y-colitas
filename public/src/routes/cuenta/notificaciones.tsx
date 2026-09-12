import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Bell, CalendarDays, FileText, HandHeart, MessageSquare, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { notificaciones as base } from "@/mock";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cuenta/notificaciones")({
  head: () => ({
    meta: [
      { title: "Notificaciones — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Avisos sobre tus solicitudes, mensajes, donaciones y eventos de la fundación Bigotes y Colitas.",
      },
      { property: "og:title", content: "Notificaciones — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Centro de notificaciones y preferencias de aviso.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const iconos = {
  solicitud: FileText,
  mensaje: MessageSquare,
  donacion: HandHeart,
  evento: CalendarDays,
  sistema: Settings2,
} as const;

const grupos = ["Hoy", "Esta semana", "Anteriores"] as const;

function Pagina() {
  const [leidas, setLeidas] = useState<string[]>([]);
  const [filtro, setFiltro] = useState<"Todas" | "Sin leer">("Todas");

  const lista = useMemo(
    () =>
      base
        .map((n) => ({ ...n, leida: n.leida || leidas.includes(n.id) }))
        .filter((n) => (filtro === "Sin leer" ? !n.leida : true)),
    [leidas, filtro],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Notificaciones</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Todo lo que ocurre con tus procesos en un solo lugar.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setLeidas(base.map((n) => n.id));
            toast.success("Todas marcadas como leídas");
          }}
        >
          Marcar todas como leídas
        </Button>
      </div>

      <Tabs value={filtro} onValueChange={(v) => setFiltro(v as "Todas" | "Sin leer")}>
        <TabsList>
          <TabsTrigger value="Todas">Todas</TabsTrigger>
          <TabsTrigger value="Sin leer">Sin leer</TabsTrigger>
        </TabsList>
      </Tabs>

      {lista.length === 0 ? (
        <EmptyState
          icono={Bell}
          titulo="No hay notificaciones sin leer"
          descripcion="Te avisaremos cuando haya novedades en tus solicitudes o mensajes."
        />
      ) : (
        <div className="space-y-6">
          {grupos.map((g) => {
            const delGrupo = lista.filter((n) => n.grupo === g);
            if (delGrupo.length === 0) return null;
            return (
              <section key={g}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {g}
                </h2>
                <div className="space-y-2">
                  {delGrupo.map((n) => {
                    const Icono = iconos[n.tipo];
                    return (
                      <Card
                        key={n.id}
                        className={cn(
                          "border-border/80 shadow-none",
                          !n.leida && "border-mustard/50 bg-cream/50",
                        )}
                      >
                        <CardContent className="flex items-start gap-4 p-4">
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                            <Icono className="size-4" aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{n.titulo}</p>
                            <p className="text-xs text-muted-foreground">{n.detalle}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">{n.fecha}</p>
                          </div>
                          {!n.leida && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setLeidas((p) => [...p, n.id])}
                            >
                              Marcar leída
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <Card className="border-border/80 shadow-none">
        <CardContent className="space-y-4 p-6">
          <p className="font-display text-lg font-semibold">Preferencias de aviso</p>
          {[
            "Avances de mis solicitudes de adopción",
            "Mensajes nuevos del equipo",
            "Campañas y jornadas cercanas",
            "Boletín mensual de la fundación",
          ].map((p, i) => (
            <div key={p} className="flex items-center justify-between gap-4">
              <span className="text-sm">{p}</span>
              <Switch defaultChecked={i < 3} onCheckedChange={() => toast.success("Preferencia actualizada")} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
