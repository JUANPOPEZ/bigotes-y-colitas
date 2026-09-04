import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { PetCard } from "@/components/shared/pet-card";
import { mascotas } from "@/mock/mascotas";
import { obtenerMascotas } from "@/lib/services/mascotas";
import type { Mascota } from "@/types";

export const Route = createFileRoute("/_site/mascotas/")({
  head: () => ({
    meta: [
      { title: "Mascotas en adopción — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Explora perros y gatos rescatados listos para adopción: filtra por especie, tamaño, edad, ciudad y compatibilidad.",
      },
      { property: "og:title", content: "Mascotas en adopción — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Explora perros y gatos rescatados listos para adopción en Bigotes y Colitas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const TODOS = "todos";
const POR_PAGINA = 6;

type Filtros = {
  busqueda: string;
  especie: string;
  tamano: string;
  sexo: string;
  ciudad: string;
  estado: string;
  edad: string;
  esterilizado: boolean;
  vacunado: boolean;
  ninos: boolean;
  mascotas: boolean;
};

const inicial: Filtros = {
  busqueda: "",
  especie: TODOS,
  tamano: TODOS,
  sexo: TODOS,
  ciudad: TODOS,
  estado: TODOS,
  edad: TODOS,
  esterilizado: false,
  vacunado: false,
  ninos: false,
  mascotas: false,
};

function coincideEdad(m: Mascota, rango: string) {
  if (rango === TODOS) return true;
  if (rango === "cachorro") return m.edadMeses <= 12;
  if (rango === "joven") return m.edadMeses > 12 && m.edadMeses <= 36;
  return m.edadMeses > 36;
}

function Pagina() {
  const [f, setF] = useState<Filtros>(inicial);
  const [orden, setOrden] = useState("recientes");
  const [pagina, setPagina] = useState(1);
  const [listaMascotas, setListaMascotas] = useState<Mascota[]>(mascotas);

  useEffect(() => {
    let montado = true;
    obtenerMascotas().then((datos) => {
      if (montado && datos && datos.length > 0) {
        setListaMascotas(datos);
      }
    });
    return () => {
      montado = false;
    };
  }, []);

  const ciudades = useMemo(() => [...new Set(listaMascotas.map((m) => m.ciudad))].sort(), [listaMascotas]);

  const actualizar = <K extends keyof Filtros>(clave: K, valor: Filtros[K]) => {
    setF((prev) => ({ ...prev, [clave]: valor }));
    setPagina(1);
  };

  const resultados = useMemo(() => {
    const lista = listaMascotas.filter((m) => {
      // Regla: Las mascotas adoptadas no deben aparecer en el catálogo de adopción
      if (m.estado === "Adoptado") return false;

      const texto = `${m.nombre} ${m.raza} ${m.ciudad}`.toLowerCase();
      return (
        texto.includes(f.busqueda.trim().toLowerCase()) &&
        (f.especie === TODOS || m.especie === f.especie) &&
        (f.tamano === TODOS || m.tamano === f.tamano) &&
        (f.sexo === TODOS || m.sexo === f.sexo) &&
        (f.ciudad === TODOS || m.ciudad === f.ciudad) &&
        (f.estado === TODOS || m.estado === f.estado) &&
        coincideEdad(m, f.edad) &&
        (!f.esterilizado || m.esterilizado) &&
        (!f.vacunado || m.vacunado) &&
        (!f.ninos || m.compatibleNinos) &&
        (!f.mascotas || m.compatibleMascotas)
      );
    });

    return [...lista].sort((a, b) => {
      if (orden === "nombre") return a.nombre.localeCompare(b.nombre);
      if (orden === "edad-asc") return a.edadMeses - b.edadMeses;
      if (orden === "edad-desc") return b.edadMeses - a.edadMeses;
      return Number(b.destacada) - Number(a.destacada);
    });
  }, [f, orden]);

  const totalPaginas = Math.max(1, Math.ceil(resultados.length / POR_PAGINA));
  const visibles = resultados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const activos = [
    f.especie !== TODOS && { k: "especie" as const, label: f.especie },
    f.tamano !== TODOS && { k: "tamano" as const, label: f.tamano },
    f.sexo !== TODOS && { k: "sexo" as const, label: f.sexo },
    f.ciudad !== TODOS && { k: "ciudad" as const, label: f.ciudad },
    f.estado !== TODOS && { k: "estado" as const, label: f.estado },
    f.edad !== TODOS && { k: "edad" as const, label: f.edad },
  ].filter(Boolean) as { k: keyof Filtros; label: string }[];

  const panel = (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="buscar-mascota">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            id="buscar-mascota"
            value={f.busqueda}
            onChange={(e) => actualizar("busqueda", e.target.value)}
            placeholder="Nombre, raza o ciudad"
            className="pl-9"
          />
        </div>
      </div>

      <SelectFiltro label="Especie" valor={f.especie} onChange={(v) => actualizar("especie", v)} opciones={["Perro", "Gato"]} />
      <SelectFiltro label="Tamaño" valor={f.tamano} onChange={(v) => actualizar("tamano", v)} opciones={["Pequeño", "Mediano", "Grande"]} />
      <SelectFiltro label="Sexo" valor={f.sexo} onChange={(v) => actualizar("sexo", v)} opciones={["Macho", "Hembra"]} />
      <SelectFiltro label="Ciudad" valor={f.ciudad} onChange={(v) => actualizar("ciudad", v)} opciones={ciudades} />
      <SelectFiltro
        label="Estado"
        valor={f.estado}
        onChange={(v) => actualizar("estado", v)}
        opciones={["Disponible", "En proceso", "En tratamiento"]}
      />
      <div className="space-y-2">
        <Label htmlFor="filtro-edad">Edad</Label>
        <Select value={f.edad} onValueChange={(v) => actualizar("edad", v)}>
          <SelectTrigger id="filtro-edad">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todas</SelectItem>
            <SelectItem value="cachorro">Cachorro (0-1 año)</SelectItem>
            <SelectItem value="joven">Joven (1-3 años)</SelectItem>
            <SelectItem value="adulto">Adulto (3+ años)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <fieldset className="space-y-3">
        <legend className="mb-1 text-sm font-medium">Características</legend>
        <CheckFiltro id="f-est" label="Esterilizado" checked={f.esterilizado} onChange={(v) => actualizar("esterilizado", v)} />
        <CheckFiltro id="f-vac" label="Vacunado" checked={f.vacunado} onChange={(v) => actualizar("vacunado", v)} />
        <CheckFiltro id="f-nin" label="Compatible con niños" checked={f.ninos} onChange={(v) => actualizar("ninos", v)} />
        <CheckFiltro id="f-mas" label="Compatible con otras mascotas" checked={f.mascotas} onChange={(v) => actualizar("mascotas", v)} />
      </fieldset>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setF(inicial);
          setPagina(1);
        }}
      >
        Limpiar filtros
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">Adopción</p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Mascotas en adopción</h1>
        <p className="mt-3 text-muted-foreground">
          Cada perfil incluye historia, salud y compatibilidad para que encuentres al compañero
          adecuado para tu hogar.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <Card className="sticky top-24 border-border/80">
            <CardContent className="p-6">{panel}</CardContent>
          </Card>
        </aside>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" role="status">
              {resultados.length} {resultados.length === 1 ? "mascota encontrada" : "mascotas encontradas"}
            </p>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="size-4" aria-hidden="true" /> Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="px-4 pb-8">{panel}</div>
                </SheetContent>
              </Sheet>
              <Select value={orden} onValueChange={setOrden}>
                <SelectTrigger className="w-[190px]" aria-label="Ordenar resultados">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recientes">Destacadas primero</SelectItem>
                  <SelectItem value="nombre">Nombre (A-Z)</SelectItem>
                  <SelectItem value="edad-asc">Menor edad</SelectItem>
                  <SelectItem value="edad-desc">Mayor edad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {activos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {activos.map((a) => (
                <Badge key={a.k} variant="secondary" className="gap-1 py-1 pr-1">
                  {a.label}
                  <button
                    type="button"
                    aria-label={`Quitar filtro ${a.label}`}
                    onClick={() => actualizar(a.k, TODOS as never)}
                    className="rounded-full p-0.5 hover:bg-background/60"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {visibles.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                titulo="No encontramos mascotas con esos filtros"
                descripcion="Prueba ampliando la búsqueda o limpiando algunos filtros."
                accion={
                  <Button onClick={() => setF(inicial)} variant="outline">
                    Limpiar filtros
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {visibles.map((m) => (
                <PetCard key={m.id} mascota={m} />
              ))}
            </div>
          )}

          {totalPaginas > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginación">
              <Button variant="outline" size="sm" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>
                Anterior
              </Button>
              {Array.from({ length: totalPaginas }).map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={pagina === i + 1 ? "default" : "outline"}
                  aria-current={pagina === i + 1 ? "page" : undefined}
                  onClick={() => setPagina(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={pagina === totalPaginas} onClick={() => setPagina((p) => p + 1)}>
                Siguiente
              </Button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}

function SelectFiltro({
  label,
  valor,
  onChange,
  opciones,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  opciones: string[];
}) {
  const id = `filtro-${label.toLowerCase()}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={valor} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={TODOS}>Todas</SelectItem>
          {opciones.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function CheckFiltro({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
      <Label htmlFor={id} className="text-sm font-normal">
        {label}
      </Label>
    </div>
  );
}
