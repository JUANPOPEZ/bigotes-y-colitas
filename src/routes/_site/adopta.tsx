import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Check, CheckCircle2, ChevronLeft, ChevronRight, FileText, Home, PawPrint, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { obtenerMascotas } from "@/lib/services/mascotas";
import type { Mascota } from "@/types";
import { MAX_SOLICITUDES_ACTIVAS, puedeCrearSolicitud } from "@/lib/reglas-solicitudes";
import { usuarioDemo } from "@/lib/mock-session";

export const Route = createFileRoute("/_site/adopta")({
  validateSearch: (search: Record<string, unknown>): { mascota?: string } => ({
    mascota: typeof search.mascota === "string" ? search.mascota : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Solicitud de adopción — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Completa el formulario de adopción responsable en cuatro pasos: mascota, datos personales, hogar y compromiso.",
      },
      { property: "og:title", content: "Solicitud de adopción — Bigotes y Colitas" },
      { property: "og:description", content: "Formulario de adopción responsable en cuatro pasos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const pasos = [
  { titulo: "Mascota", icono: PawPrint },
  { titulo: "Tus datos", icono: User },
  { titulo: "Tu hogar", icono: Home },
  { titulo: "Compromiso", icono: FileText },
];

function Pagina() {
  const { mascota: mascotaInicial } = Route.useSearch();
  const [listaMascotas, setListaMascotas] = useState<Mascota[]>([]);

  useEffect(() => {
    let montado = true;
    obtenerMascotas()
      .then((datos) => {
        if (montado) setListaMascotas(datos);
      })
      .catch((err) => {
        console.error("[Adopta] No se pudo cargar mascotas desde Supabase:", err);
      });
    return () => {
      montado = false;
    };
  }, []);

  const disponibles = listaMascotas.filter((m) => m.estado !== "Adoptado" && (m.estado === "Disponible" || m.id === mascotaInicial));

  const [paso, setPaso] = useState(0);
  const [mascotaId, setMascotaId] = useState(mascotaInicial ?? disponibles[0]?.id ?? "");
  const [acepta, setAcepta] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const { activas, restantes, permitido } = puedeCrearSolicitud(usuarioDemo.correo);
  const elegida = listaMascotas.find((m) => m.id === mascotaId);


  if (enviado) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success text-success-foreground">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold">¡Solicitud enviada!</h1>
        <p className="mt-3 text-muted-foreground">
          Recibimos tu solicitud por {elegida?.nombre}. Nuestro equipo la revisará en un plazo de 3
          días hábiles y te contactará para agendar la entrevista.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Radicado: <span className="font-semibold text-foreground">SOL-2026-{Math.floor(Math.random() * 900 + 100)}</span>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/cuenta">Ver mis solicitudes</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/mascotas">Seguir explorando</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!permitido) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/12 text-destructive">
          <AlertTriangle className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold">Límite de solicitudes alcanzado</h1>
        <p className="mt-3 text-muted-foreground">
          Solo puedes tener {MAX_SOLICITUDES_ACTIVAS} solicitudes de adopción en proceso al mismo
          tiempo y actualmente tienes {activas}. En cuanto una se resuelva (aprobación, rechazo o
          cancelación) se libera un cupo y podrás enviar otra.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/cuenta/solicitudes">Ver mis solicitudes</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/mascotas">Seguir explorando</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">Adopción responsable</p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Solicitud de adopción</h1>
        <p className="mt-3 text-muted-foreground">
          Este formulario nos ayuda a encontrar el hogar adecuado para cada mascota. Toma unos 5
          minutos.
        </p>
        <p className="mt-3 rounded-xl border border-border bg-cream/60 p-3 text-sm text-muted-foreground">
          Tienes {activas} de {MAX_SOLICITUDES_ACTIVAS} solicitudes en proceso; puedes enviar{" "}
          {restantes} más.
        </p>
      </header>


      <ol className="mt-10 grid gap-3 sm:grid-cols-4" aria-label="Progreso de la solicitud">
        {pasos.map((p, i) => (
          <li
            key={p.titulo}
            aria-current={i === paso ? "step" : undefined}
            className={`flex items-center gap-3 rounded-xl border p-3 text-sm ${
              i === paso ? "border-primary bg-accent/50" : "border-border"
            }`}
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i < paso ? "bg-success text-success-foreground" : i === paso ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {i < paso ? <Check className="size-4" aria-hidden="true" /> : i + 1}
            </span>
            <span className="font-medium">{p.titulo}</span>
          </li>
        ))}
      </ol>

      <Progress value={((paso + 1) / pasos.length) * 100} className="mt-4" aria-label="Avance del formulario" />

      <Card className="mt-8 border-border/80">
        <CardContent className="p-6 sm:p-8">
          {paso === 0 && (
            <div className="space-y-6">
              <h2 className="font-display text-xl font-semibold">¿A quién quieres adoptar?</h2>
              <RadioGroup value={mascotaId} onValueChange={setMascotaId} className="grid gap-3 sm:grid-cols-2">
                {disponibles.map((m) => (
                  <Label
                    key={m.id}
                    htmlFor={`m-${m.id}`}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 font-normal has-[:checked]:border-primary has-[:checked]:bg-accent/40"
                  >
                    <RadioGroupItem id={`m-${m.id}`} value={m.id} />
                    <img src={m.galeria[0]} alt="" className="size-12 rounded-lg object-cover" />
                    <span>
                      <span className="block font-medium">{m.nombre}</span>
                      <span className="block text-xs text-muted-foreground">
                        {m.especie} · {m.edad} · {m.ciudad}
                      </span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
              {elegida && (
                <div className="rounded-xl bg-cream/70 p-4 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="mb-2">
                    Seleccionada
                  </Badge>
                  <p>{elegida.historia}</p>
                </div>
              )}
            </div>
          )}

          {paso === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-semibold">Datos personales</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo id="ad-nombre" label="Nombre completo *" />
                <Campo id="ad-documento" label="Documento de identidad *" />
                <Campo id="ad-correo" label="Correo electrónico *" type="email" />
                <Campo id="ad-tel" label="Teléfono *" type="tel" />
                <Campo id="ad-ciudad" label="Ciudad *" />
                <div className="space-y-2">
                  <Label htmlFor="ad-edad">Rango de edad *</Label>
                  <Select defaultValue="26-40">
                    <SelectTrigger id="ad-edad">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["18-25", "26-40", "41-60", "60+"].map((r) => (
                        <SelectItem key={r} value={r}>
                          {r} años
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ad-direccion">Dirección *</Label>
                  <Input id="ad-direccion" placeholder="Calle, número, barrio" />
                </div>
              </div>
            </div>
          )}

          {paso === 2 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-semibold">Sobre tu hogar</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ad-vivienda">Tipo de vivienda *</Label>
                  <Select defaultValue="Apartamento">
                    <SelectTrigger id="ad-vivienda">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Casa", "Apartamento", "Finca"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ad-propiedad">¿Es propia o arrendada? *</Label>
                  <Select defaultValue="Propia">
                    <SelectTrigger id="ad-propiedad">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Propia">Propia</SelectItem>
                      <SelectItem value="Arrendada">Arrendada (con permiso de mascotas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Campo id="ad-personas" label="Personas en el hogar *" type="number" min={1} />
                <Campo id="ad-ninos" label="Niños menores de 12 años" type="number" min={0} />

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ad-otras">¿Tienes otras mascotas? Descríbelas</Label>
                  <Textarea id="ad-otras" rows={3} placeholder="Especie, edad, si están esterilizadas" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ad-tiempo">¿Cuánto tiempo pasará sola la mascota al día? *</Label>
                  <Textarea id="ad-tiempo" rows={2} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ad-motivo">¿Por qué quieres adoptar? *</Label>
                  <Textarea id="ad-motivo" rows={4} />
                </div>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-semibold">Compromiso de adopción</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Brindar alimento, agua limpia y refugio adecuado durante toda la vida del animal.",
                  "Cumplir el esquema de vacunación, desparasitación y la esterilización si aún no se ha realizado.",
                  "No abandonar, regalar ni comercializar la mascota; ante cualquier imprevisto, informar a la fundación.",
                  "Permitir una visita de seguimiento durante los tres primeros meses.",
                ].map((t) => (
                  <li key={t} className="flex gap-3 rounded-xl bg-cream/70 p-4">
                    <Check className="mt-0.5 size-4 shrink-0 text-coffee-light" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Separator />
              <div className="flex items-start gap-3">
                <Checkbox id="ad-acepta" checked={acepta} onCheckedChange={(v) => setAcepta(v === true)} />
                <Label htmlFor="ad-acepta" className="text-sm font-normal leading-relaxed">
                  Acepto el compromiso de adopción responsable, los{" "}
                  <Link to="/terminos" className="underline">
                    términos y condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link to="/politicas" className="underline">
                    política de tratamiento de datos
                  </Link>
                  . *
                </Label>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="outline" disabled={paso === 0} onClick={() => setPaso((p) => p - 1)}>
              <ChevronLeft className="size-4" aria-hidden="true" /> Anterior
            </Button>
            {paso < pasos.length - 1 ? (
              <Button onClick={() => setPaso((p) => p + 1)}>
                Siguiente <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                disabled={!acepta}
                onClick={() => {
                  setEnviado(true);
                  toast.success("Solicitud enviada correctamente");
                }}
              >
                Enviar solicitud
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Campo({
  id,
  label,
  type = "text",
  min,
}: {
  id: string;
  label: string;
  type?: string;
  min?: number;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        {...(type === "number"
          ? {
              min: min ?? 0,
              step: 1,
              onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
              },
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                if (Number(e.target.value) < (min ?? 0)) e.target.value = String(min ?? 0);
              },
            }
          : {})}
      />
    </div>
  );
}
