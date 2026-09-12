import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { eventos } from "@/mock";
import type { Evento } from "@/types";

export const Route = createFileRoute("/_site/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos y jornadas — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Jornadas de adopción, talleres de cuidado y brigadas de esterilización. Consulta fechas, cupos e inscríbete.",
      },
      { property: "og:title", content: "Eventos y jornadas — Bigotes y Colitas" },
      { property: "og:description", content: "Participa en jornadas de adopción, talleres y brigadas de esterilización." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const [ciudad, setCiudad] = useState("todas");
  const [seleccionado, setSeleccionado] = useState<Evento | null>(null);

  const ciudades = useMemo(() => [...new Set(eventos.map((e) => e.ciudad))].sort(), []);
  const lista = eventos.filter((e) => ciudad === "todas" || e.ciudad === ciudad);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">Agenda</p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Eventos y jornadas</h1>
        <p className="mt-3 text-muted-foreground">
          Encuéntranos en parques, centros comunitarios y talleres. La inscripción es gratuita y los
          cupos son limitados.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Label htmlFor="ciudad-evento" className="text-sm">
          Ciudad
        </Label>
        <Select value={ciudad} onValueChange={setCiudad}>
          <SelectTrigger id="ciudad-evento" className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las ciudades</SelectItem>
            {ciudades.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground" role="status">
          {lista.length} {lista.length === 1 ? "evento" : "eventos"}
        </span>
      </div>

      {lista.length === 0 ? (
        <div className="mt-10">
          <EmptyState icono={CalendarDays} titulo="Sin eventos en esta ciudad" descripcion="Pronto anunciaremos nuevas fechas." />
        </div>
      ) : (
        <div className="mt-8 space-y-6">
          {lista.map((e) => {
            const lleno = e.inscritos >= e.cupos;
            return (
              <Card key={e.id} className="overflow-hidden border-border/80 p-0">
                <div className="grid md:grid-cols-[280px_1fr]">
                  <img
                    src={e.imagen}
                    alt={`Imagen del evento ${e.titulo}`}
                    loading="lazy"
                    className="h-52 w-full object-cover md:h-full"
                  />
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{e.ciudad}</Badge>
                      {lleno ? <Badge variant="outline">Cupos agotados</Badge> : <Badge variant="outline">Inscripciones abiertas</Badge>}
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-semibold">{e.titulo}</h2>
                    <p className="mt-2 leading-relaxed text-muted-foreground">{e.descripcion}</p>

                    <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-1.5">
                        <CalendarDays className="size-4" aria-hidden="true" /> {e.fecha}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Clock className="size-4" aria-hidden="true" /> {e.hora}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <MapPin className="size-4" aria-hidden="true" /> {e.lugar}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Users className="size-4" aria-hidden="true" /> {e.inscritos}/{e.cupos} inscritos
                      </li>
                    </ul>

                    <div className="mt-4 max-w-sm">
                      <Progress value={Math.round((e.inscritos / e.cupos) * 100)} aria-label={`Cupos ocupados en ${e.titulo}`} />
                    </div>

                    <Button className="mt-5" disabled={lleno} onClick={() => setSeleccionado(e)}>
                      {lleno ? "Sin cupos disponibles" : "Inscribirme"}
                    </Button>
                  </CardContent>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={seleccionado !== null} onOpenChange={(o) => !o && setSeleccionado(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inscripción a {seleccionado?.titulo}</DialogTitle>
            <DialogDescription>
              {seleccionado?.fecha} · {seleccionado?.hora} · {seleccionado?.lugar}
            </DialogDescription>
          </DialogHeader>
          <form
            id="form-inscripcion"
            className="space-y-4"
            onSubmit={(ev) => {
              ev.preventDefault();
              toast.success("Inscripción registrada. Te enviamos la confirmación por correo.");
              setSeleccionado(null);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="ins-nombre">Nombre completo *</Label>
              <Input id="ins-nombre" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ins-correo">Correo electrónico *</Label>
              <Input id="ins-correo" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ins-personas">Número de asistentes</Label>
              <Input id="ins-personas" type="number" min={1} max={5} defaultValue={1} />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSeleccionado(null)}>
              Cancelar
            </Button>
            <Button type="submit" form="form-inscripcion">
              Confirmar inscripción
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
