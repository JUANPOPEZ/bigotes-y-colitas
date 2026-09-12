import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, FileSearch, Inbox, Paperclip, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DataTable } from "@/components/shared/data-table";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { StatCard } from "@/components/shared/stat-card";
import { denuncias as denunciasMock } from "@/mock";
import type { Denuncia, EstadoDenuncia } from "@/types";

export const Route = createFileRoute("/admin/denuncias")({
  head: () => ({
    meta: [
      { title: "Bandeja de denuncias — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Recepción y seguimiento de las denuncias de maltrato animal reportadas por la ciudadanía: estado, prioridad y cronología.",
      },
      { property: "og:title", content: "Bandeja de denuncias — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Seguimiento de los casos de maltrato reportados por la ciudadanía.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const estados: EstadoDenuncia[] = [
  "Recibida",
  "En revisión",
  "Verificación en campo",
  "Atendida",
  "Cerrada",
  "Descartada",
];
const prioridades = ["Alta", "Media", "Baja"];
const responsables = [
  "Sin asignar",
  "Camila Ruiz",
  "Equipo de campo Bogotá",
  "Equipo de campo Medellín",
  "Jurídica",
];

function hoy() {
  return new Date().toLocaleDateString("es-CO");
}

function Pagina() {
  const [datos, setDatos] = useState<Denuncia[]>(denunciasMock);
  const [seleccion, setSeleccion] = useState<Denuncia | null>(null);
  const [nota, setNota] = useState("");

  const tipos = useMemo(() => [...new Set(datos.map((d) => d.tipo))], [datos]);
  const ciudades = useMemo(() => [...new Set(datos.map((d) => d.ciudad))], [datos]);
  const conteo = (e: EstadoDenuncia) => datos.filter((d) => d.estado === e).length;

  const actualizar = (id: string, cambios: Partial<Denuncia>, titulo: string, detalle: string) => {
    setDatos((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              ...cambios,
              seguimiento: [...d.seguimiento, { fecha: hoy(), titulo, detalle }],
            }
          : d,
      ),
    );
    setSeleccion((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            ...cambios,
            seguimiento: [...prev.seguimiento, { fecha: hoy(), titulo, detalle }],
          }
        : prev,
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Bandeja de denuncias</h1>
        <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">
          Los casos llegan desde el formulario público. Este módulo es de recepción y seguimiento:
          no se crean ni se eliminan denuncias, solo se actualiza su estado, la prioridad, el
          responsable y las notas de seguimiento.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icono={Inbox} valor={String(conteo("Recibida"))} etiqueta="Recibidas" detalle="Pendientes de asignar" />
        <StatCard
          icono={FileSearch}
          valor={String(conteo("En revisión") + conteo("Verificación en campo"))}
          etiqueta="En proceso"
          detalle="Revisión y verificación en campo"
        />
        <StatCard icono={ShieldAlert} valor={String(conteo("Atendida"))} etiqueta="Atendidas" detalle="Con intervención realizada" />
        <StatCard
          icono={CheckCircle2}
          valor={String(conteo("Cerrada") + conteo("Descartada"))}
          etiqueta="Cerradas"
          detalle="Casos finalizados o descartados"
        />
      </div>

      <DataTable<Denuncia>
        datos={datos}
        buscarEn={(d) => `${d.folio} ${d.tipo} ${d.ciudad} ${d.ubicacion} ${d.descripcion} ${d.denunciante ?? "anónimo"}`}
        filtros={[
          { key: "estado", label: "Estado", opciones: estados },
          { key: "tipo", label: "Tipo", opciones: tipos },
          { key: "ciudad", label: "Ciudad", opciones: ciudades },
          { key: "prioridad", label: "Prioridad", opciones: prioridades },
        ]}
        valorFiltro={(d, key) => String(d[key as keyof Denuncia] ?? "")}
        columnas={[
          { key: "folio", header: "Folio", valor: (d) => d.folio, ordenable: true },
          { key: "tipo", header: "Tipo", valor: (d) => d.tipo, ordenable: true },
          { key: "ciudad", header: "Ciudad", valor: (d) => d.ciudad, ordenable: true },
          { key: "fecha", header: "Recibida", valor: (d) => d.fecha, ordenable: true },
          {
            key: "prioridad",
            header: "Prioridad",
            valor: (d) => d.prioridad,
            ordenable: true,
            render: (d) => (
              <Badge
                variant="outline"
                className={
                  d.prioridad === "Alta"
                    ? "border-destructive/30 bg-destructive/12 text-destructive"
                    : d.prioridad === "Media"
                      ? "border-transparent bg-warning text-warning-foreground"
                      : "border-transparent bg-secondary text-secondary-foreground"
                }
              >
                {d.prioridad}
              </Badge>
            ),
          },
          {
            key: "denunciante",
            header: "Denunciante",
            valor: (d) => d.denunciante ?? "Anónimo",
            render: (d) => (
              <span className={d.anonimo ? "text-muted-foreground" : ""}>
                {d.anonimo ? "Anónimo" : d.denunciante}
              </span>
            ),
          },
          {
            key: "estado",
            header: "Estado",
            valor: (d) => d.estado,
            ordenable: true,
            render: (d) => <EstadoBadge estado={d.estado} />,
          },
        ]}
        onVer={(d) => {
          setSeleccion(d);
          setNota("");
        }}
        vacio={{
          titulo: "Sin denuncias",
          descripcion: "No hay casos que coincidan con los filtros aplicados.",
        }}
      />

      <Sheet open={Boolean(seleccion)} onOpenChange={(o) => !o && setSeleccion(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {seleccion && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-xl">{seleccion.folio}</SheetTitle>
                <SheetDescription>
                  {seleccion.tipo} · {seleccion.ciudad} · recibida el {seleccion.fecha}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 px-4 pb-8">
                <div className="flex flex-wrap items-center gap-2">
                  <EstadoBadge estado={seleccion.estado} />
                  <Badge variant="secondary">Prioridad {seleccion.prioridad}</Badge>
                  {seleccion.anonimo && <Badge variant="outline">Reporte anónimo</Badge>}
                </div>

                <dl className="grid gap-3 sm:grid-cols-2">
                  {[
                    ["Ubicación", seleccion.ubicacion],
                    ["Fecha del hecho", seleccion.fechaHecho],
                    ["Animales involucrados", seleccion.animales],
                    ["Responsable", seleccion.responsable ?? "Sin asignar"],
                    ["Denunciante", seleccion.anonimo ? "Anónimo" : (seleccion.denunciante ?? "—")],
                    ["Contacto", seleccion.anonimo ? "No suministrado" : (seleccion.contacto ?? "—")],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-border bg-cream/60 p-3">
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                      <dd className="mt-1 text-sm font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div>
                  <p className="text-sm font-semibold">Descripción de los hechos</p>
                  <p className="mt-1 text-sm text-muted-foreground">{seleccion.descripcion}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold">Evidencia adjunta</p>
                  {seleccion.evidencias.length === 0 ? (
                    <p className="mt-1 text-sm text-muted-foreground">Sin archivos adjuntos.</p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {seleccion.evidencias.map((e) => (
                        <li
                          key={e}
                          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                        >
                          <Paperclip className="size-4 text-muted-foreground" aria-hidden="true" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="den-estado">Estado del caso</Label>
                    <Select
                      value={seleccion.estado}
                      onValueChange={(v) => {
                        actualizar(
                          seleccion.id,
                          { estado: v as EstadoDenuncia },
                          "Cambio de estado",
                          `El caso pasó a "${v}".`,
                        );
                        toast.success("Estado actualizado");
                      }}
                    >
                      <SelectTrigger id="den-estado">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((e) => (
                          <SelectItem key={e} value={e}>
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="den-prioridad">Prioridad</Label>
                    <Select
                      value={seleccion.prioridad}
                      onValueChange={(v) => {
                        actualizar(
                          seleccion.id,
                          { prioridad: v as Denuncia["prioridad"] },
                          "Cambio de prioridad",
                          `Prioridad establecida en ${v}.`,
                        );
                        toast.success("Prioridad actualizada");
                      }}
                    >
                      <SelectTrigger id="den-prioridad">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {prioridades.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="den-responsable">Responsable asignado</Label>
                    <Select
                      value={seleccion.responsable ?? "Sin asignar"}
                      onValueChange={(v) => {
                        actualizar(
                          seleccion.id,
                          { responsable: v },
                          "Asignación",
                          `Caso asignado a ${v}.`,
                        );
                        toast.success("Responsable asignado");
                      }}
                    >
                      <SelectTrigger id="den-responsable">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {responsables.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <form
                  className="space-y-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const texto = nota.trim();
                    if (!texto) {
                      toast.error("Escribe la nota antes de guardarla.");
                      return;
                    }
                    actualizar(seleccion.id, {}, "Nota de seguimiento", texto.slice(0, 500));
                    setNota("");
                    toast.success("Nota agregada a la cronología");
                  }}
                >
                  <Label htmlFor="den-nota">Agregar nota de seguimiento</Label>
                  <Textarea
                    id="den-nota"
                    rows={3}
                    maxLength={500}
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Ej. Se coordinó visita con la policía ambiental para el 30/07."
                  />
                  <Button type="submit" className="w-full">
                    Guardar nota
                  </Button>
                </form>

                <div>
                  <p className="text-sm font-semibold">Cronología del caso</p>
                  <ol className="mt-3 space-y-4 border-l border-border pl-5">
                    {seleccion.seguimiento.map((s, i) => (
                      <li key={`${s.fecha}-${s.titulo}-${i}`} className="relative">
                        <span
                          className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-background bg-secondary"
                          aria-hidden="true"
                        />
                        <p className="text-sm font-medium">{s.titulo}</p>
                        <p className="text-xs text-muted-foreground">{s.fecha}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{s.detalle}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
