import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatCard } from "@/components/shared/stat-card";
import { HandHeart, PawPrint, ShieldAlert, ShoppingBag } from "lucide-react";
import { adopcionesPorMes, denuncias, donacionesPorTipo, kpis, pedidos } from "@/mock";

export const Route = createFileRoute("/admin/reportes")({
  head: () => ({
    meta: [
      { title: "Reportes y estadísticas — Bigotes y Colitas" },
      { name: "description", content: "Reportes de adopciones, donaciones, ventas y denuncias con exportación a PDF o Excel." },
      { property: "og:title", content: "Reportes y estadísticas — Bigotes y Colitas" },
      { property: "og:description", content: "Indicadores del refugio con filtros por periodo y exportación." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

const ventasPorMes = [
  { mes: "Feb", ventas: 1250000 },
  { mes: "Mar", ventas: 1680000 },
  { mes: "Abr", ventas: 1410000 },
  { mes: "May", ventas: 2130000 },
  { mes: "Jun", ventas: 2480000 },
  { mes: "Jul", ventas: 2050000 },
];

const ejeMoneda = { borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" };

function Pagina() {
  const [periodo, setPeriodo] = useState("6m");
  const ventasTotales = ventasPorMes.reduce((a, v) => a + v.ventas, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Reportes y estadísticas</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Consolidado de adopciones, donaciones, ventas y denuncias. La exportación es simulada.
        </p>
      </div>

      <Card className="border-border/80 shadow-none">
        <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:w-48">
              <Label className="mb-1.5 block text-xs text-muted-foreground">Periodo</Label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">Último mes</SelectItem>
                  <SelectItem value="3m">Últimos 3 meses</SelectItem>
                  <SelectItem value="6m">Últimos 6 meses</SelectItem>
                  <SelectItem value="12m">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-44">
              <Label htmlFor="desde" className="mb-1.5 block text-xs text-muted-foreground">
                Desde
              </Label>
              <Input id="desde" type="date" />
            </div>
            <div className="w-full sm:w-44">
              <Label htmlFor="hasta" className="mb-1.5 block text-xs text-muted-foreground">
                Hasta
              </Label>
              <Input id="hasta" type="date" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => toast.success("Reporte PDF generado (simulado)")}>
              <FileText className="mr-1.5 size-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => toast.success("Reporte Excel generado (simulado)")}>
              <FileSpreadsheet className="mr-1.5 size-4" /> Excel
            </Button>
            <Button onClick={() => toast.success("Descarga iniciada (simulada)")}>
              <Download className="mr-1.5 size-4" /> Descargar todo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icono={PawPrint} valor={String(kpis.adoptadas)} etiqueta="Adopciones" detalle="Periodo seleccionado" />
        <StatCard icono={HandHeart} valor={cop.format(kpis.donaciones)} etiqueta="Donaciones" detalle="Aportes monetarios" />
        <StatCard icono={ShoppingBag} valor={cop.format(ventasTotales)} etiqueta="Ventas tienda" detalle={`${pedidos.length} pedidos registrados`} />
        <StatCard icono={ShieldAlert} valor={String(denuncias.length)} etiqueta="Denuncias" detalle="Casos reportados" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Tendencia de adopciones</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={adopcionesPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={ejeMoneda} />
                <Line type="monotone" dataKey="adopciones" stroke="var(--color-secondary)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Ventas de la tienda solidaria</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ventasPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickFormatter={(v: number) => `${v / 1000000}M`} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={ejeMoneda} formatter={(v: number) => cop.format(v)} />
                <Area type="monotone" dataKey="ventas" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.35} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-none lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Distribución de donaciones por tipo</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donacionesPorTipo} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis type="category" dataKey="tipo" width={110} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip contentStyle={ejeMoneda} formatter={(v: number) => `${v}%`} />
                <Bar dataKey="valor" fill="var(--color-secondary)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
