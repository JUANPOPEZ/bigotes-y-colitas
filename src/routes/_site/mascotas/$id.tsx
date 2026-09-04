import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Baby,
  CalendarDays,
  Cat,
  Dog,
  Heart,
  MapPin,
  PawPrint,
  Ruler,
  Share2,
  ShieldCheck,
  Syringe,
  Weight,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { PetCard } from "@/components/shared/pet-card";
import { obtenerMascotaPorId, obtenerMascotas } from "@/lib/services/mascotas";
import type { Mascota } from "@/types";

export const Route = createFileRoute("/_site/mascotas/$id")({
  loader: async ({ params }): Promise<{ mascota: Mascota; similares: Mascota[] }> => {
    const mascota = await obtenerMascotaPorId(params.id);
    if (!mascota) throw notFound();
    const todas = await obtenerMascotas();
    const similares = todas
      .filter((m) => m.id !== mascota.id && m.especie === mascota.especie && m.estado !== "Adoptado")
      .slice(0, 3);
    return { mascota, similares };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Mascota no disponible — Bigotes y Colitas" }, { name: "robots", content: "noindex" }] };
    }
    const { mascota } = loaderData;
    const titulo = `${mascota.nombre}, ${mascota.especie.toLowerCase()} en adopción — Bigotes y Colitas`;
    const descripcion = `${mascota.nombre} es ${mascota.raza.toLowerCase()} de ${mascota.edad} en ${mascota.ciudad}. ${mascota.historia.slice(0, 110)}`;
    return {
      meta: [
        { title: titulo },
        { name: "description", content: descripcion },
        { property: "og:title", content: titulo },
        { property: "og:description", content: descripcion },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: MascotaNoEncontrada,
  component: Pagina,
});

function Pagina() {
  const { mascota, similares } = Route.useLoaderData() as { mascota: Mascota; similares: Mascota[] };
  const [imagen, setImagen] = useState(0);
  const [favorito, setFavorito] = useState(false);
  const Icono = mascota.especie === "Perro" ? Dog : Cat;

  const datos = [
    { icono: Icono, etiqueta: "Especie", valor: `${mascota.especie} · ${mascota.raza}` },
    { icono: PawPrint, etiqueta: "Sexo", valor: mascota.sexo },
    { icono: CalendarDays, etiqueta: "Edad", valor: mascota.edad },
    { icono: Ruler, etiqueta: "Tamaño", valor: mascota.tamano },
    { icono: Weight, etiqueta: "Peso", valor: `${mascota.peso} kg` },
    { icono: MapPin, etiqueta: "Ciudad", valor: mascota.ciudad },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link to="/mascotas">
          <ArrowLeft className="size-4" aria-hidden="true" /> Volver al listado
        </Link>
      </Button>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="overflow-hidden rounded-2xl bg-muted shadow-soft">
            <img
              src={mascota.galeria[imagen]}
              alt={`${mascota.nombre}, ${mascota.especie.toLowerCase()} ${mascota.raza} en adopción`}
              width={1000}
              height={750}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          {mascota.galeria.length > 1 && (
            <div className="mt-4 flex gap-3">
              {mascota.galeria.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImagen(i)}
                  aria-label={`Ver foto ${i + 1} de ${mascota.nombre}`}
                  aria-current={i === imagen}
                  className={`size-20 overflow-hidden rounded-xl border-2 transition ${
                    i === imagen ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={g} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <EstadoBadge estado={mascota.estado} />
            {mascota.necesidadesEspeciales && <Badge variant="outline">Necesidades especiales</Badge>}
          </div>
          <h1 className="mt-3 font-display text-4xl font-semibold">{mascota.nombre}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" /> {mascota.ciudad} · Ingresó el {mascota.ingreso}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {mascota.personalidad.map((p) => (
              <Badge key={p} variant="secondary">
                {p}
              </Badge>
            ))}
            <Badge variant="secondary">Energía {mascota.energia.toLowerCase()}</Badge>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-4">
            {datos.map((d) => (
              <div key={d.etiqueta} className="flex items-start gap-3 rounded-xl border border-border/80 p-3">
                <d.icono className="mt-0.5 size-4 shrink-0 text-coffee-light" aria-hidden="true" />
                <div>
                  <dt className="text-xs uppercase tracking-wide text-muted-foreground">{d.etiqueta}</dt>
                  <dd className="text-sm font-medium">{d.valor}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            <Indicador activo={mascota.esterilizado} icono={ShieldCheck} texto="Esterilizado" />
            <Indicador activo={mascota.vacunado} icono={Syringe} texto="Vacunado" />
            <Indicador activo={mascota.compatibleNinos} icono={Baby} texto="Apto con niños" />
            <Indicador activo={mascota.compatibleMascotas} icono={PawPrint} texto="Apto con mascotas" />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" disabled={mascota.estado !== "Disponible"}>
              <Link to="/adopta" search={{ mascota: mascota.id }}>
                Solicitar adopción
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              aria-pressed={favorito}
              onClick={() => {
                setFavorito((v) => !v);
                toast.success(favorito ? "Quitado de favoritos" : `${mascota.nombre} guardado en favoritos`);
              }}
            >
              <Heart className={`size-4 ${favorito ? "fill-destructive text-destructive" : ""}`} aria-hidden="true" />
              Favorito
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => {
                void navigator.clipboard?.writeText(window.location.href);
                toast.success("Enlace copiado");
              }}
            >
              <Share2 className="size-4" aria-hidden="true" /> Compartir
            </Button>
          </div>

          {mascota.estado !== "Disponible" && (
            <p className="mt-4 rounded-xl bg-accent/60 px-4 py-3 text-sm text-accent-foreground">
              Esta mascota no está disponible por ahora. Puedes guardarla en favoritos para recibir
              novedades.
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="historia" className="mt-14">
        <TabsList>
          <TabsTrigger value="historia">Historia</TabsTrigger>
          <TabsTrigger value="salud">Salud</TabsTrigger>
          <TabsTrigger value="convivencia">Convivencia</TabsTrigger>
        </TabsList>
        <TabsContent value="historia">
          <Card className="border-border/80">
            <CardContent className="p-6 leading-relaxed text-muted-foreground">{mascota.historia}</CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="salud">
          <Card className="border-border/80">
            <CardContent className="space-y-4 p-6">
              <p className="leading-relaxed text-muted-foreground">{mascota.salud}</p>
              <Separator />
              <h2 className="font-display text-lg font-semibold">Esquema de vacunación</h2>
              {mascota.vacunas.length === 0 ? (
                <p className="text-sm text-muted-foreground">Esquema en curso, aún sin registros.</p>
              ) : (
                <ul className="space-y-2">
                  {mascota.vacunas.map((v) => (
                    <li key={v.nombre} className="flex items-center justify-between rounded-lg bg-cream/70 px-4 py-2 text-sm">
                      <span className="font-medium">{v.nombre}</span>
                      <span className="text-muted-foreground">{v.fecha}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="convivencia">
          <Card className="border-border/80">
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <Dato titulo="Nivel de energía" valor={mascota.energia} />
              <Dato titulo="Convivencia con niños" valor={mascota.compatibleNinos ? "Recomendada" : "No recomendada"} />
              <Dato titulo="Convivencia con mascotas" valor={mascota.compatibleMascotas ? "Recomendada" : "Requiere adaptación"} />
              <Dato
                titulo="Necesidades especiales"
                valor={mascota.necesidadesEspeciales ? "Sí, requiere cuidados adicionales" : "No"}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {similares.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold">También podrían gustarte</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {similares.map((m) => (
              <PetCard key={m.id} mascota={m} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-border/80 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{titulo}</p>
      <p className="mt-1 font-medium">{valor}</p>
    </div>
  );
}

function Indicador({
  activo,
  icono: Icono,
  texto,
}: {
  activo: boolean;
  icono: typeof ShieldCheck;
  texto: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
        activo ? "border-transparent bg-success text-success-foreground" : "border-border text-muted-foreground"
      }`}
    >
      <Icono className="size-3.5" aria-hidden="true" />
      {activo ? texto : `No ${texto.toLowerCase()}`}
    </span>
  );
}

function MascotaNoEncontrada() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">No encontramos esta mascota</h1>
      <p className="mt-3 text-muted-foreground">
        Es posible que ya haya sido adoptada o que el enlace esté desactualizado.
      </p>
      <Button asChild className="mt-6">
        <Link to="/mascotas">Ver todas las mascotas</Link>
      </Button>
    </div>
  );
}
