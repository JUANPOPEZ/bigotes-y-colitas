import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { useAuth } from "@/lib/auth";
import { MAX_SOLICITUDES_ACTIVAS, esEnTramite } from "@/lib/reglas-solicitudes";
import {
  obtenerSolicitudesUsuario,
  verificarLimiteSolicitudesUsuario,
} from "@/lib/services/solicitudes";
import { solicitudes as mockSolicitudes } from "@/mock";
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
  const { user } = useAuth();
  const [grupo, setGrupo] = useState<(typeof grupos)[number]>("Todas");
  const [detalle, setDetalle] = useState<Solicitud | null>(null);
  const [solicitudesLista, setSolicitudesLista] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);

  const [limiteInfo, setLimiteInfo] = useState<{
    activas: number;
    restantes: number;
    permitido: boolean;
  }>({
    activas: 0,
    restantes: MAX_SOLICITUDES_ACTIVAS,
    permitido: true,
  });

  useEffect(() => {
    let montado = true;
    setCargando(true);

    const usuarioId = user?.id;
    const correo = user?.email;

    Promise.all([
      obtenerSolicitudesUsuario(usuarioId, correo),
      verificarLimiteSolicitudesUsuario(usuarioId, correo),
    ])
      .then(([datos, lim]) => {
        if (!montado) return;
        if (datos && datos.length > 0) {
          setSolicitudesLista(datos);
        } else {
          // Si no hay datos en Supabase para el usuario (o en demo), mostrar mock
          setSolicitudesLista(mockSolicitudes);
        }
        setLimiteInfo(lim);
        setCargando(false);
      })
      .catch((err) => {
        console.warn("[Cuenta Solicitudes] Error cargando datos:", err);
        if (montado) {
          setSolicitudesLista(mockSolicitudes);
          setCargando(false);
        }
      });

    return () => {
      montado = false;
    };
  }, [user?.id, user?.email]);

  const { activas, restantes, permitido } = limiteInfo;

  const lista = solicitudesLista.filter((s) => {
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
            ? `Puedes enviar ${restantes} solicitud${restantes === 1 ? "" : "es"} más. Al aprobarse o resolverse una solicitud se libera un cupo.`
            : "Has alcanzado el límite máximo de 3 solicitudes activas. Debes esperar la resolución de un proceso en curso antes de enviar otra solicitud."}
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

      {cargando ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Cargando solicitudes...</span>
        </div>
      ) : lista.length === 0 ? (
        <EmptyState
          icono={FileText}
          titulo="Sin solicitudes en esta categoría"
          descripcion="Cuando envíes una solicitud aparecerá aquí con su radicado y cronología."
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
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-display text-lg font-semibold">{s.mascota}</p>
                    <EstadoBadge estado={s.estado} />
                    {s.radicado && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {s.radicado}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enviada el {s.fecha} · {s.ciudad}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Último avance: {s.cronologia[s.cronologia.length - 1]?.titulo || "En espera de revisión"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDetalle(s)}>
                    Ver seguimiento
                  </Button>
                  {s.mascotaId && (
                    <Button variant="ghost" asChild>
                      <Link to="/mascotas/$id" params={{ id: s.mascotaId }}>
                        Ver mascota
                      </Link>
                    </Button>
                  )}
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
              {detalle
                ? `Mascota: ${detalle.mascota} · Estado: ${detalle.estado}${detalle.radicado ? ` · Radicado: ${detalle.radicado}` : ""}`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-4 border-l pl-5">
            {detalle?.cronologia.map((c, i) => (
              <li key={i} className="relative">
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
