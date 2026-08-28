import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Cat,
  Dog,
  HandHeart,
  Heart,
  HeartHandshake,
  PawPrint,
  Search,
  Sparkles,
  Users,
} from "lucide-react";

import heroImg from "@/assets/hero-pets.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { PetCard } from "@/components/shared/pet-card";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { SectionHeader } from "@/components/shared/section-header";
import { StatCard } from "@/components/shared/stat-card";
import { mascotas } from "@/mock/mascotas";
import { denuncias, eventos, historias, kpis, productos } from "@/mock";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Bigotes y Colitas — Encuentra un hogar para toda la vida" },
      {
        name: "description",
        content:
          "Adopta perros y gatos rescatados, dona, participa en eventos y apoya el bienestar animal con Bigotes y Colitas.",
      },
      { property: "og:title", content: "Bigotes y Colitas — Adopción responsable" },
      {
        property: "og:description",
        content: "Perros y gatos rescatados buscan hogar. Conoce sus historias y adopta.",
      },
    ],
  }),
  component: Landing,
});

const categorias = [
  { label: "Perros", icono: Dog },
  { label: "Gatos", icono: Cat },
  { label: "Cachorros", icono: PawPrint },
  { label: "Adultos", icono: Heart },
  { label: "Necesidades especiales", icono: HeartHandshake },
];

const pasos = [
  { n: "01", t: "Busca", d: "Explora las mascotas disponibles y filtra según tu estilo de vida." },
  { n: "02", t: "Solicita", d: "Completa el formulario de adopción en cuatro pasos sencillos." },
  { n: "03", t: "Conoce", d: "Agenda una entrevista y visita a tu futuro compañero." },
  { n: "04", t: "Adopta", d: "Firma el compromiso y recibe acompañamiento post adopción." },
];

function Landing() {
  const destacadas = mascotas.filter((m) => m.destacada).slice(0, 4);
  const destacados = productos.filter((p) => p.destacado).slice(0, 3);

  return (
    <div>
      <section className="border-b border-border bg-cream">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge variant="secondary" className="mb-5 rounded-full px-3 py-1">
              <Sparkles className="mr-1.5 size-3.5" /> Adopción responsable
            </Badge>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] sm:text-5xl lg:text-6xl">
              Encuentra un hogar para toda la vida.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              En Bigotes y Colitas rescatamos, cuidamos y acompañamos a perros y gatos hasta que
              encuentran una familia responsable. Tu próximo mejor amigo te está esperando.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/mascotas">
                  Adoptar ahora <ArrowRight className="ml-1.5 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/donaciones">
                  <HandHeart className="mr-1.5 size-4" /> Quiero donar
                </Link>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border shadow-soft">
            <img
              src={heroImg}
              alt="Un perro y un gato rescatados esperando adopción"
              width={1408}
              height={1008}
              className="size-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icono={PawPrint} valor={String(kpis.mascotas)} etiqueta="Mascotas en cuidado" detalle="Perros y gatos rescatados" />
          <StatCard icono={Heart} valor={String(kpis.adoptadas)} etiqueta="Mascotas adoptadas" detalle="Desde 2023" />
          <StatCard icono={HandHeart} valor={`$${(kpis.donaciones / 1000000).toFixed(1)}M`} etiqueta="En donaciones" detalle="Recibidas este año" />
          <StatCard icono={Users} valor={String(kpis.familias)} etiqueta="Familias acompañadas" detalle="Con seguimiento post adopción" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <SectionHeader
          eyebrow="Categorías"
          titulo="¿A quién estás buscando?"
          descripcion="Filtra por tipo de compañero y encuentra el que mejor se adapta a tu hogar."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categorias.map((c) => (
            <Link
              key={c.label}
              to="/mascotas"
              className="hover-lift flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <c.icono className="size-5" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader
          eyebrow="Mascotas destacadas"
          titulo="Buscan hogar hoy"
          accion={
            <Button variant="outline" asChild>
              <Link to="/mascotas">
                Ver todas <ArrowRight className="ml-1.5 size-4" />
              </Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destacadas.map((m) => (
            <PetCard key={m.id} mascota={m} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-cream">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <SectionHeader eyebrow="Proceso" titulo="Cómo funciona la adopción" center />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pasos.map((p) => (
              <Card key={p.n} className="border-border/80 shadow-none">
                <CardContent className="p-6">
                  <span className="font-display text-3xl font-semibold text-mustard">{p.n}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{p.t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.d}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="Historias de éxito" titulo="Familias que ya adoptaron" />
        <Carousel className="mt-8" opts={{ align: "start" }}>
          <CarouselContent>
            {historias.map((h) => (
              <CarouselItem key={h.id} className="sm:basis-1/2 lg:basis-1/3">
                <Card className="h-full overflow-hidden border-border/80 p-0 shadow-soft">
                  <img
                    src={h.imagen}
                    alt={h.nombre}
                    loading="lazy"
                    width={800}
                    height={600}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <CardContent className="p-6">
                    <p className="text-sm leading-relaxed text-muted-foreground">“{h.texto}”</p>
                    <p className="mt-4 text-sm font-semibold">{h.nombre}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <SectionHeader
          eyebrow="Agenda"
          titulo="Eventos próximos"
          accion={
            <Button variant="outline" asChild>
              <Link to="/eventos">Ver agenda</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((e) => (
            <Card key={e.id} className="hover-lift overflow-hidden border-border/80 p-0 shadow-soft">
              <img
                src={e.imagen}
                alt={e.titulo}
                loading="lazy"
                width={800}
                height={600}
                className="aspect-[16/9] w-full object-cover"
              />
              <CardContent className="p-6">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" aria-hidden="true" /> {e.fecha} · {e.ciudad}
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold">{e.titulo}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{e.descripcion}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader
          eyebrow="Tienda solidaria"
          titulo="Productos destacados"
          accion={
            <Button variant="outline" asChild>
              <Link to="/tienda">Ir a la tienda</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((p) => (
            <Card key={p.id} className="hover-lift overflow-hidden border-border/80 p-0 shadow-soft">
              <img
                src={p.imagen}
                alt={p.nombre}
                loading="lazy"
                width={800}
                height={800}
                className="aspect-square w-full object-cover"
              />
              <CardContent className="p-6">
                <Badge variant="secondary">{p.categoria}</Badge>
                <h3 className="mt-3 font-display text-lg font-semibold">{p.nombre}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  ${p.precio.toLocaleString("es-CO")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <SectionHeader
          eyebrow="Protección animal"
          titulo="Denuncias de maltrato"
          descripcion="Reporta un caso de maltrato, abandono o negligencia. Puedes hacerlo de forma anónima y seguir tu caso con el número de folio."
          accion={
            <Button variant="outline" asChild>
              <Link to="/denuncias">Reportar un caso</Link>
            </Button>
          }
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="border-border/80 bg-cream/50 shadow-soft lg:col-span-1">
            <CardContent className="p-6">
              <p className="font-display text-3xl font-semibold">{denuncias.length}</p>
              <p className="mt-1 text-sm text-muted-foreground">casos reportados este año</p>
              <ol className="mt-5 space-y-3 text-sm text-muted-foreground">
                <li>1. Envías el reporte con la ubicación y la evidencia.</li>
                <li>2. Recibes un folio para consultar el avance.</li>
                <li>3. Verificamos en campo junto a las autoridades.</li>
              </ol>
              <Button className="mt-6 w-full" asChild>
                <Link to="/denuncias">Consultar mi folio</Link>
              </Button>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {denuncias.slice(0, 4).map((d) => (
              <Card key={d.id} className="border-border/80 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="secondary">{d.tipo}</Badge>
                    <EstadoBadge estado={d.estado} />
                  </div>
                  <p className="mt-3 font-display text-base font-semibold">{d.folio}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.ciudad} · {d.fecha}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{d.descripcion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="rounded-3xl border border-border bg-accent px-6 py-14 text-center sm:px-12">
          <h2 className="font-display text-3xl font-semibold text-accent-foreground sm:text-4xl">
            Una decisión, dos vidas que cambian.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-accent-foreground/80">
            Adopta, apadrina o dona. Cada gesto ayuda a que un perro o un gato tenga una segunda
            oportunidad.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/adopta">
                <Search className="mr-1.5 size-4" /> Iniciar mi adopción
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
