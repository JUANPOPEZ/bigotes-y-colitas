import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, MapPin, Paperclip, Search, ShieldAlert, Upload } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { denuncias } from "@/mock";
import type { Denuncia } from "@/types";

export const Route = createFileRoute("/_site/denuncias")({
  head: () => ({
    meta: [
      { title: "Denuncias de maltrato animal — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Reporta casos de maltrato, abandono o negligencia animal, de forma anónima si lo prefieres, y consulta el estado de tu denuncia con el número de folio.",
      },
      { property: "og:title", content: "Denuncias de maltrato animal — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Formulario de denuncia ciudadana y consulta de seguimiento por folio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const ciudades = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Bucaramanga", "Otra"];
const tipos = ["Maltrato", "Abandono", "Negligencia", "Criadero ilegal", "Otro"];

const esquema = z.object({
  tipo: z.string().min(1),
  ciudad: z.string().min(1, { message: "Selecciona la ciudad." }),
  fechaHecho: z.string().min(1, { message: "Indica la fecha del hecho." }),
  ubicacion: z
    .string()
    .trim()
    .min(8, { message: "Describe la dirección o un punto de referencia." })
    .max(180),
  animales: z.string().trim().min(3, { message: "Indica cuántos animales están involucrados." }).max(120),
  descripcion: z
    .string()
    .trim()
    .min(30, { message: "La descripción debe tener al menos 30 caracteres." })
    .max(1500),
  anonimo: z.boolean(),
  nombre: z.string().trim().max(100).optional(),
  contacto: z.string().trim().max(255).optional(),
});

function Pagina() {
  const [folio, setFolio] = useState("");
  const [consulta, setConsulta] = useState<Denuncia | null>(null);
  const [buscado, setBuscado] = useState(false);
  const [anonimo, setAnonimo] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [radicado, setRadicado] = useState<string | null>(null);

  return (
    <div>
      <section className="bg-cream/70 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">
            Protección animal
          </p>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            Reporta un caso de maltrato
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Tu reporte llega directamente a la bandeja de la fundación y activa una verificación en
            campo junto a las autoridades locales. Puedes hacerlo de forma anónima.
          </p>
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
            <p>
              Si el animal está en peligro inmediato, comunícate primero con la línea de emergencia
              <strong> 123</strong> o con la policía ambiental de tu municipio.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_1fr]">
        <Card className="border-border/80">
          <CardContent className="p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold">Formulario de denuncia</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Los campos marcados con * son obligatorios. Entre más detalle aportes, más rápido
              podremos verificar el caso.
            </p>

            {radicado && (
              <div
                role="status"
                className="mt-5 rounded-xl border border-secondary/40 bg-secondary/20 p-4 text-sm"
              >
                <p className="font-medium">Denuncia radicada con el folio {radicado}</p>
                <p className="mt-1 text-muted-foreground">
                  Guárdalo: con ese número puedes consultar el avance del caso en esta misma página.
                </p>
              </div>
            )}

            <form
              className="mt-6 space-y-5"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const datos = {
                  tipo: String(fd.get("tipo") ?? ""),
                  ciudad: String(fd.get("ciudad") ?? ""),
                  fechaHecho: String(fd.get("fechaHecho") ?? ""),
                  ubicacion: String(fd.get("ubicacion") ?? ""),
                  animales: String(fd.get("animales") ?? ""),
                  descripcion: String(fd.get("descripcion") ?? ""),
                  anonimo,
                  nombre: String(fd.get("nombre") ?? ""),
                  contacto: String(fd.get("contacto") ?? ""),
                };
                const res = esquema.safeParse(datos);
                const nuevos: Record<string, string> = {};
                if (!res.success) {
                  for (const issue of res.error.issues) {
                    const k = String(issue.path[0]);
                    if (!nuevos[k]) nuevos[k] = issue.message;
                  }
                }
                if (!anonimo) {
                  if (!datos.nombre) nuevos["nombre"] = "Escribe tu nombre o marca la casilla de anonimato.";
                  if (!datos.contacto) nuevos["contacto"] = "Necesitamos un teléfono o correo de contacto.";
                }
                setErrores(nuevos);
                if (Object.keys(nuevos).length > 0) {
                  toast.error("Revisa los campos marcados en el formulario.");
                  return;
                }
                const folioNuevo = `DEN-2026-${String(19 + denuncias.length).padStart(3, "0")}`;
                setRadicado(folioNuevo);
                toast.success(`Denuncia registrada. Tu folio es ${folioNuevo}.`);
                e.currentTarget.reset();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="den-tipo">Tipo de caso *</Label>
                  <Select name="tipo" defaultValue="Maltrato">
                    <SelectTrigger id="den-tipo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="den-ciudad">Ciudad *</Label>
                  <Select name="ciudad" defaultValue="Bogotá">
                    <SelectTrigger id="den-ciudad">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ciudades.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errores["ciudad"] && <p className="text-xs text-destructive">{errores["ciudad"]}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="den-fecha">Fecha del hecho *</Label>
                  <Input id="den-fecha" name="fechaHecho" type="date" />
                  {errores["fechaHecho"] && (
                    <p className="text-xs text-destructive">{errores["fechaHecho"]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="den-animales">Animales involucrados *</Label>
                  <Input id="den-animales" name="animales" maxLength={120} placeholder="Ej. 2 perros adultos" />
                  {errores["animales"] && (
                    <p className="text-xs text-destructive">{errores["animales"]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="den-ubicacion">Dirección o punto de referencia *</Label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="den-ubicacion"
                    name="ubicacion"
                    maxLength={180}
                    className="pl-9"
                    placeholder="Calle, barrio o referencia cercana"
                  />
                </div>
                {errores["ubicacion"] && (
                  <p className="text-xs text-destructive">{errores["ubicacion"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="den-descripcion">Descripción de los hechos *</Label>
                <Textarea
                  id="den-descripcion"
                  name="descripcion"
                  rows={5}
                  maxLength={1500}
                  placeholder="Describe qué observaste, desde cuándo ocurre y el estado de los animales."
                />
                {errores["descripcion"] && (
                  <p className="text-xs text-destructive">{errores["descripcion"]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="den-evidencia">Evidencia (fotos o video)</Label>
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                  <Upload className="size-5" aria-hidden="true" />
                  <span>Arrastra archivos o selecciónalos. Máximo 5 archivos de 10 MB.</span>
                </div>
                <Input id="den-evidencia" type="file" multiple accept="image/*,video/*" />
              </div>

              <Separator />

              <div className="flex items-center gap-2">
                <Checkbox
                  id="den-anonimo"
                  checked={anonimo}
                  onCheckedChange={(v) => setAnonimo(v === true)}
                />
                <Label htmlFor="den-anonimo" className="text-sm font-normal">
                  Quiero denunciar de forma anónima
                </Label>
              </div>

              {!anonimo && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="den-nombre">Nombre completo *</Label>
                    <Input id="den-nombre" name="nombre" maxLength={100} />
                    {errores["nombre"] && <p className="text-xs text-destructive">{errores["nombre"]}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="den-contacto">Teléfono o correo *</Label>
                    <Input id="den-contacto" name="contacto" maxLength={255} />
                    {errores["contacto"] && (
                      <p className="text-xs text-destructive">{errores["contacto"]}</p>
                    )}
                  </div>
                </div>
              )}

              <Button type="submit" size="lg" className="w-full">
                <AlertTriangle className="size-4" aria-hidden="true" /> Enviar denuncia
              </Button>
              <p className="text-xs text-muted-foreground">
                Los datos se tratan de forma confidencial conforme a nuestra política de privacidad.
              </p>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold">Consultar estado por folio</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ingresa el folio que recibiste al radicar tu denuncia. Ejemplo: {denuncias[0]?.folio}
              </p>
              <form
                className="mt-4 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const encontrada = denuncias.find(
                    (d) => d.folio.toLowerCase() === folio.trim().toLowerCase(),
                  );
                  setConsulta(encontrada ?? null);
                  setBuscado(true);
                }}
              >
                <Input
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                  maxLength={20}
                  placeholder="DEN-2026-000"
                  aria-label="Número de folio"
                />
                <Button type="submit">
                  <Search className="size-4" aria-hidden="true" /> Buscar
                </Button>
              </form>

              {buscado && !consulta && (
                <p role="status" className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm">
                  No encontramos ninguna denuncia con ese folio.
                </p>
              )}

              {consulta && (
                <div className="mt-5 space-y-4" role="status">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium">{consulta.folio}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Prioridad {consulta.prioridad}</Badge>
                      <EstadoBadge estado={consulta.estado} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {consulta.tipo} · {consulta.ciudad} · {consulta.ubicacion}
                  </p>
                  {consulta.evidencias.length > 0 && (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Paperclip className="size-3.5" aria-hidden="true" />
                      {consulta.evidencias.length} archivo(s) de evidencia adjuntos
                    </p>
                  )}
                  <ol className="space-y-4 border-l border-border pl-5">
                    {consulta.seguimiento.map((s) => (
                      <li key={`${s.fecha}-${s.titulo}`} className="relative">
                        <span
                          className="absolute -left-[27px] top-1.5 size-3 rounded-full bg-primary"
                          aria-hidden="true"
                        />
                        <p className="text-sm font-medium">{s.titulo}</p>
                        <p className="text-xs text-muted-foreground">{s.fecha}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{s.detalle}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-accent/40">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold">¿Qué pasa después?</h2>
              <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>1. Verificamos la información y asignamos un folio de seguimiento.</li>
                <li>2. Un equipo de campo visita el lugar en un plazo máximo de 72 horas.</li>
                <li>3. Coordinamos con las autoridades el rescate o la sanción correspondiente.</li>
                <li>4. Te informamos el cierre del caso por el canal que hayas indicado.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
