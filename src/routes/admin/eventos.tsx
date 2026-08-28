import { createFileRoute } from "@tanstack/react-router";

import { CrudModule } from "@/components/shared/crud-module";
import { Progress } from "@/components/ui/progress";
import { eventos } from "@/mock";
import { ciudades } from "@/mock/mascotas";
import type { Evento } from "@/types";

export const Route = createFileRoute("/admin/eventos")({
  head: () => ({
    meta: [
      { title: "Gestión de eventos — Bigotes y Colitas" },
      { name: "description", content: "Programa jornadas de adopción, talleres y brigadas, y controla los cupos." },
      { property: "og:title", content: "Gestión de eventos — Bigotes y Colitas" },
      { property: "og:description", content: "Agenda del refugio: jornadas, talleres y brigadas con control de cupos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  return (
    <CrudModule<Evento>
      titulo="Gestión de eventos"
      descripcion="Crea y edita la agenda del refugio, controla los cupos disponibles y las inscripciones."
      datos={eventos}
      etiquetaNuevo="Nuevo evento"
      buscarEn={(e) => `${e.titulo} ${e.lugar} ${e.ciudad}`}
      filtros={[{ key: "ciudad", label: "Ciudad", opciones: ciudades }]}
      valorFiltro={(e, key) => String(e[key as keyof Evento] ?? "")}
      columnas={[
        { key: "titulo", header: "Evento", valor: (e) => e.titulo, ordenable: true },
        { key: "fecha", header: "Fecha", valor: (e) => e.fecha, ordenable: true, render: (e) => `${e.fecha} · ${e.hora}` },
        { key: "lugar", header: "Lugar", valor: (e) => e.lugar, render: (e) => `${e.lugar}, ${e.ciudad}` },
        {
          key: "cupos",
          header: "Ocupación",
          valor: (e) => e.inscritos / e.cupos,
          ordenable: true,
          render: (e) => (
            <div className="w-36">
              <Progress value={Math.round((e.inscritos / e.cupos) * 100)} />
              <p className="mt-1 text-xs text-muted-foreground">
                {e.inscritos} / {e.cupos} cupos
              </p>
            </div>
          ),
        },
      ]}
      campos={[
        { name: "titulo", label: "Título" },
        { name: "fecha", label: "Fecha", tipo: "fecha", ancho: "medio" },
        { name: "hora", label: "Hora", ancho: "medio", placeholder: "9:00 a.m." },
        { name: "lugar", label: "Lugar", ancho: "medio" },
        { name: "ciudad", label: "Ciudad", tipo: "select", opciones: ciudades, ancho: "medio" },
        { name: "cupos", label: "Cupos totales", tipo: "numero", ancho: "medio" },
        { name: "inscritos", label: "Inscritos", tipo: "numero", ancho: "medio" },
        { name: "descripcion", label: "Descripción", tipo: "textarea" },
      ]}
    />
  );
}
