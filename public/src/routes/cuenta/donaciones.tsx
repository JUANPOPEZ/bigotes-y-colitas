import { Link, createFileRoute } from "@tanstack/react-router";
import { Download, HandHeart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { campanas, donaciones } from "@/mock";
import { usuarioDemo } from "@/lib/mock-session";

export const Route = createFileRoute("/cuenta/donaciones")({
  head: () => ({
    meta: [
      { title: "Mis donaciones — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Historial de tus aportes en dinero y especie a la fundación Bigotes y Colitas, con certificados descargables.",
      },
      { property: "og:title", content: "Mis donaciones — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Consulta y descarga el soporte de cada donación realizada.",
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

function Pagina() {
  const mias = donaciones.filter((d) => d.donante === usuarioDemo.nombre);
  const total = mias.reduce((acc, d) => acc + (d.monto ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Mis donaciones</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Gracias a tus aportes hoy hay {campanas.length} campañas activas.
        </p>
      </div>

      <Card className="border-border/80 bg-cream/50 shadow-none">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total aportado en dinero</p>
            <p className="font-display text-3xl font-semibold">{moneda.format(total)}</p>
          </div>
          <Button asChild>
            <Link to="/donaciones">Hacer una nueva donación</Link>
          </Button>
        </CardContent>
      </Card>

      {mias.length === 0 ? (
        <EmptyState
          icono={HandHeart}
          titulo="Todavía no registras donaciones"
          descripcion="Puedes aportar dinero, alimento, medicamentos o cobijas."
          accion={
            <Button asChild>
              <Link to="/donaciones">Quiero donar</Link>
            </Button>
          }
        />
      ) : (
        <Card className="border-border/80 shadow-none">
          <CardHeader>
            <CardTitle className="font-display text-lg">Historial</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Certificado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mias.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.fecha}</TableCell>
                      <TableCell>{d.tipo}</TableCell>
                      <TableCell className="text-muted-foreground">{d.detalle}</TableCell>
                      <TableCell>{d.monto ? moneda.format(d.monto) : "—"}</TableCell>
                      <TableCell>
                        <EstadoBadge estado={d.estado} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.success("Certificado descargado (simulado)")}
                        >
                          <Download className="mr-1.5 size-4" /> PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {campanas.map((c) => {
          const avance = Math.round((c.recaudado / c.meta) * 100);
          return (
            <Card key={c.id} className="border-border/80 shadow-none">
              <CardContent className="p-5">
                <p className="font-display text-base font-semibold">{c.titulo}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.descripcion}</p>
                <Progress value={avance} className="mt-4 h-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  {moneda.format(c.recaudado)} de {moneda.format(c.meta)} · {avance}%
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
