import { Link, createFileRoute } from "@tanstack/react-router";
import { Bell, FileText, HandHeart, Heart, MessageSquare, PawPrint } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { StatCard } from "@/components/shared/stat-card";
import { conversaciones, donaciones, notificaciones, solicitudes } from "@/mock";
import { mascotas } from "@/mock/mascotas";
import { usuarioDemo } from "@/lib/mock-session";

export const Route = createFileRoute("/cuenta/")({
  head: () => ({
    meta: [
      { title: "Mi panel — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Resumen de tus solicitudes de adopción, donaciones, mensajes y mascotas favoritas en Bigotes y Colitas.",
      },
      { property: "og:title", content: "Mi panel — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Sigue tu proceso de adopción y tus aportes a la fundación.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const pasos = ["Pendiente", "En revisión", "Entrevista", "Visita", "Aprobada"];

function Pagina() {
  const mias = solicitudes.filter((s) => s.correo === usuarioDemo.correo);
  const activa = mias.find((s) => s.estado !== "Aprobada" && s.estado !== "Rechazada");
  const misDonaciones = donaciones.filter((d) => d.donante === usuarioDemo.nombre);
  const favoritas = mascotas.slice(0, 3);
  const indicePaso = activa ? pasos.indexOf(activa.estado) : -1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          Hola, {usuarioDemo.nombre.split(" ")[0]}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Este es el estado de tu actividad en la fundación.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icono={FileText} valor={String(mias.length)} etiqueta="Solicitudes" detalle="Historial completo" />
        <StatCard icono={HandHeart} valor={String(misDonaciones.length)} etiqueta="Donaciones" detalle="Aportes registrados" />
        <StatCard icono={Heart} valor={String(favoritas.length)} etiqueta="Favoritos" detalle="Mascotas guardadas" />
        <StatCard
          icono={Bell}
          valor={String(notificaciones.filter((n) => !n.leida).length)}
          etiqueta="Sin leer"
          detalle="Notificaciones nuevas"
        />
      </div>

      {activa && (
        <Card className="border-border/80 shadow-none">
          <CardHeader>
            <CardTitle className="font-display text-lg">
              Solicitud en curso por {activa.mascota}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3">
              <EstadoBadge estado={activa.estado} />
              <span className="text-sm text-muted-foreground">Enviada el {activa.fecha}</span>
            </div>
            <Progress value={((indicePaso + 1) / pasos.length) * 100} className="h-2" />
            <ol className="grid gap-2 text-xs sm:grid-cols-5">
              {pasos.map((p, i) => (
                <li
                  key={p}
                  className={
                    i <= indicePaso ? "font-medium text-foreground" : "text-muted-foreground"
                  }
                >
                  {i + 1}. {p}
                </li>
              ))}
            </ol>
            <div className="space-y-3 border-t pt-4">
              {activa.cronologia.map((c) => (
                <div key={c.titulo} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-mustard" />
                  <div>
                    <p className="text-sm font-medium">{c.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.fecha} · {c.detalle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" asChild>
              <Link to="/cuenta/solicitudes">Ver todas mis solicitudes</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="font-display text-lg">Mensajes recientes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/cuenta/mensajes">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversaciones.slice(0, 3).map((c) => (
              <div key={c.id} className="flex items-start gap-3">
                <MessageSquare className="mt-0.5 size-4 text-coffee-light" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{c.nombre}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.ultimo}</p>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">{c.hora}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="font-display text-lg">Mascotas guardadas</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/favoritos">Ver favoritos</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {favoritas.map((m) => (
              <Link
                key={m.id}
                to="/mascotas/$id"
                params={{ id: m.id }}
                className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted"
              >
                <img
                  src={m.galeria[0]}
                  alt={m.nombre}
                  className="size-12 rounded-xl object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="text-sm font-medium">{m.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.especie} · {m.raza} · {m.ciudad}
                  </p>
                </div>
                <EstadoBadge estado={m.estado} className="ml-auto" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 bg-cream/50 shadow-none">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <PawPrint className="mt-0.5 size-5 text-coffee-light" aria-hidden="true" />
            <div>
              <p className="font-display text-lg font-semibold">¿Listo para otra colita feliz?</p>
              <p className="text-sm text-muted-foreground">
                Explora las mascotas disponibles y comienza una nueva solicitud.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link to="/mascotas">Ver mascotas</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
