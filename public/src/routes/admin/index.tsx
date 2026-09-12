import { Link, createFileRoute } from "@tanstack/react-router";
import { HandHeart, Home, PawPrint, ShieldAlert, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/stat-card";
import { EstadoBadge } from "@/components/shared/estado-badge";
import {
  actividadReciente,
  denuncias,
  adopcionesPorMes,
  donacionesPorTipo,
  kpis,
  solicitudes,
} from "@/mock";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard administrador — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Indicadores de adopciones, donaciones y actividad reciente del refugio Bigotes y Colitas.",
      },
      { property: "og:title", content: "Dashboard administrador — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Indicadores de adopciones, donaciones y actividad del refugio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const colores = [
  "var(--color-secondary)",
  "var(--color-accent)",
  "var(--color-primary)",
  "var(--color-coffee-light)",
  "var(--color-muted-foreground)",
];

function Pagina() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Dashboard</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Resumen operativo del refugio. Los datos mostrados son simulados.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icono={PawPrint} valor={String(kpis.mascotas)} etiqueta="Mascotas en refugio" detalle="Disponibles y en tratamiento" />
        <StatCard icono={Home} valor={String(kpis.adoptadas)} etiqueta="Adopciones completadas" detalle="Histórico acumulado" />
        <StatCard
          icono={HandHeart}
          valor={`$${(kpis.donaciones / 1000000).toFixed(1)} M`}
          etiqueta="Donaciones recibidas"
          detalle="Aportes monetarios del año"
        />
        <StatCard
          icono={ShieldAlert}
          valor={String(denuncias.filter((d) => d.estado !== "Cerrada" && d.estado !== "Descartada").length)}
          etiqueta="Denuncias activas"
          detalle="En revisión o verificación"
        />
        <StatCard icono={Users} valor={String(kpis.familias)} etiqueta="Familias registradas" detalle="Adoptantes activos" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="border-border/80 shadow-none lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Adopciones y solicitudes por mes</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adopcionesPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
                <Legend />
                <Bar dataKey="solicitudes" name="Solicitudes" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="adopciones" name="Adopciones" fill="var(--color-secondary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Donaciones por tipo</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={donacionesPorTipo} dataKey="valor" nameKey="tipo" innerRadius={52} outerRadius={86} paddingAngle={3}>
                  {donacionesPorTipo.map((d, i) => (
                    <Cell key={d.tipo} fill={colores[i % colores.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-card)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/80 shadow-none">
        <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldAlert className="size-4 text-destructive" aria-hidden="true" />
            Denuncias recientes
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/denuncias">Ver bandeja</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {denuncias.slice(0, 5).map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-cream/40 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {d.folio} · {d.tipo}
                </p>
                <p className="text-xs text-muted-foreground">
                  {d.ciudad} · {d.fecha} · {d.anonimo ? "Anónimo" : d.denunciante}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Prioridad {d.prioridad}</Badge>
                <EstadoBadge estado={d.estado} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Solicitudes recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {solicitudes.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-cream/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{s.solicitante}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.mascota} · {s.fecha}
                  </p>
                </div>
                <EstadoBadge estado={s.estado} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {actividadReciente.map((a) => (
                <li key={a.id} className="flex gap-3">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                  <div>
                    <p className="text-sm">{a.texto}</p>
                    <p className="text-xs text-muted-foreground">{a.tiempo}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
