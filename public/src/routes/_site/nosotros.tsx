import { Link, createFileRoute } from "@tanstack/react-router";
import { Eye, HeartHandshake, Leaf, Target, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeader } from "@/components/shared/section-header";
import { StatCard } from "@/components/shared/stat-card";
import { kpis } from "@/mock";

export const Route = createFileRoute("/_site/nosotros")({
  head: () => ({
    meta: [
      { title: "Quiénes somos — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Conoce la misión, visión y el equipo de Bigotes y Colitas, fundación de rescate y adopción animal alineada con el ODS 15.",
      },
      { property: "og:title", content: "Quiénes somos — Bigotes y Colitas" },
      { property: "og:description", content: "Misión, visión, equipo e impacto de la fundación Bigotes y Colitas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  return (
    <div>
      <section className="bg-cream/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">Nuestra historia</p>
          <h1 className="max-w-3xl font-display text-3xl font-semibold sm:text-4xl">
            Diez años rescatando, cuidando y conectando familias con animales
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Bigotes y Colitas nació en 2016 como un grupo de vecinos que alimentaba perros de calle.
            Hoy somos una fundación con tres sedes, red de hogares de paso y un equipo veterinario
            propio.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icono={HeartHandshake} valor={String(kpis.adoptadas)} etiqueta="Adopciones logradas" />
          <StatCard icono={Users} valor={String(kpis.familias)} etiqueta="Familias acompañadas" />
          <StatCard icono={Leaf} valor={String(kpis.mascotas)} etiqueta="Animales en cuidado" />
          <StatCard icono={Target} valor="3" etiqueta="Sedes en Colombia" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/80">
            <CardContent className="p-8">
              <Target className="size-6 text-coffee-light" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-semibold">Misión</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Rescatar, rehabilitar y reubicar animales en situación de calle o maltrato,
                promoviendo la tenencia responsable y la esterilización como herramientas de
                control poblacional.
              </p>
            </CardContent>
          </Card>
          <Card className="border-border/80">
            <CardContent className="p-8">
              <Eye className="size-6 text-coffee-light" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-semibold">Visión</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                Para 2030 queremos ser la red de adopción responsable más confiable del país, con
                cero animales sacrificados por falta de hogar en las ciudades donde operamos.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="bg-accent/40 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            eyebrow="ODS 15"
            titulo="Vida de ecosistemas terrestres"
            descripcion="Nuestro trabajo aporta al Objetivo de Desarrollo Sostenible 15 protegiendo la fauna urbana, reduciendo el abandono y educando sobre convivencia responsable con los animales."
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="Equipo" titulo="Las personas detrás de la fundación" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { n: "Paula Rivas", c: "Directora veterinaria" },
            { n: "Juan Esteban Mora", c: "Coordinador de rescates" },
            { n: "Sara Betancur", c: "Adopciones y seguimiento" },
            { n: "Miguel Cardona", c: "Voluntariado y eventos" },
          ].map((p) => (
            <Card key={p.n} className="border-border/80 text-center">
              <CardContent className="p-6">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent font-display text-lg font-semibold text-accent-foreground">
                  {p.n
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{p.n}</h3>
                <p className="text-sm text-muted-foreground">{p.c}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/mascotas">Conoce a nuestras mascotas</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/donaciones">Apoyar la causa</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
