import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Heart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { mascotas } from "@/mock/mascotas";

export const Route = createFileRoute("/_site/favoritos")({
  head: () => ({
    meta: [
      { title: "Mis favoritos — Bigotes y Colitas" },
      {
        name: "description",
        content: "Guarda las mascotas que te interesan y compara sus perfiles antes de enviar tu solicitud de adopción.",
      },
      { property: "og:title", content: "Mis favoritos — Bigotes y Colitas" },
      { property: "og:description", content: "Tus mascotas guardadas para adopción en Bigotes y Colitas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const [ids, setIds] = useState(["1", "3", "5"]);
  const favoritos = mascotas.filter((m) => ids.includes(m.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">Guardados</p>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Mis favoritos</h1>
          <p className="mt-3 text-muted-foreground">
            Compara las mascotas que te interesan y solicita la adopción cuando estés listo.
          </p>
        </div>
        {favoritos.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              setIds([]);
              toast.success("Lista de favoritos vaciada");
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Vaciar lista
          </Button>
        )}
      </header>

      {favoritos.length === 0 ? (
        <div className="mt-12">
          <EmptyState
            icono={Heart}
            titulo="Aún no tienes favoritos"
            descripcion="Explora el catálogo y guarda las mascotas que te interesen con el ícono de corazón."
            accion={
              <Button asChild>
                <Link to="/mascotas">Ver mascotas</Link>
              </Button>
            }
          />
        </div>
      ) : (
        <div className="mt-10 space-y-4">
          {favoritos.map((m) => (
            <Card key={m.id} className="overflow-hidden border-border/80 p-0">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <img src={m.galeria[0]} alt={m.nombre} loading="lazy" className="h-32 w-full rounded-xl object-cover sm:size-28" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-xl font-semibold">{m.nombre}</h2>
                    <EstadoBadge estado={m.estado} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {m.especie} · {m.raza} · {m.sexo} · {m.edad} · {m.ciudad}
                  </p>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{m.historia}</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:flex-col">
                  <Button asChild size="sm">
                    <Link to="/mascotas/$id" params={{ id: m.id }}>
                      Ver perfil
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" disabled={m.estado !== "Disponible"}>
                    <Link to="/adopta" search={{ mascota: m.id }}>
                      Adoptar
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Quitar a ${m.nombre} de favoritos`}
                    onClick={() => {
                      setIds((prev) => prev.filter((id) => id !== m.id));
                      toast.success(`${m.nombre} quitado de favoritos`);
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden="true" /> Quitar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
