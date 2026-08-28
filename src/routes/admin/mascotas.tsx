import { createFileRoute } from "@tanstack/react-router";

import { CrudModule } from "@/components/shared/crud-module";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { mascotas, ciudades } from "@/mock/mascotas";
import type { Mascota } from "@/types";

export const Route = createFileRoute("/admin/mascotas")({
  head: () => ({
    meta: [
      { title: "Gestión de mascotas — Bigotes y Colitas" },
      { name: "description", content: "Alta, edición y seguimiento de las mascotas del refugio Bigotes y Colitas." },
      { property: "og:title", content: "Gestión de mascotas — Bigotes y Colitas" },
      { property: "og:description", content: "Administra fichas, estados de salud y disponibilidad de las mascotas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  return (
    <CrudModule<Mascota>
      titulo="Gestión de mascotas"
      descripcion="Administra las fichas de las mascotas: datos básicos, salud, fotos y estado de adopción."
      datos={mascotas}
      etiquetaNuevo="Nueva mascota"
      buscarEn={(m) => `${m.nombre} ${m.raza} ${m.ciudad} ${m.especie}`}
      filtros={[
        { key: "especie", label: "Especie", opciones: ["Perro", "Gato"] },
        { key: "estado", label: "Estado", opciones: ["Disponible", "En proceso", "Adoptado", "En tratamiento"] },
        { key: "ciudad", label: "Ciudad", opciones: ciudades },
      ]}
      valorFiltro={(m, key) => String(m[key as keyof Mascota] ?? "")}
      columnas={[
        {
          key: "nombre",
          header: "Mascota",
          ordenable: true,
          valor: (m) => m.nombre,
          render: (m) => (
            <div className="flex items-center gap-3">
              <img src={m.galeria[0]} alt={m.nombre} className="size-10 rounded-xl object-cover" loading="lazy" />
              <div>
                <p className="font-medium">{m.nombre}</p>
                <p className="text-xs text-muted-foreground">{m.raza}</p>
              </div>
            </div>
          ),
        },
        { key: "especie", header: "Especie", valor: (m) => m.especie, ordenable: true },
        { key: "edad", header: "Edad", valor: (m) => m.edadMeses, ordenable: true, render: (m) => m.edad },
        { key: "ciudad", header: "Ciudad", valor: (m) => m.ciudad, ordenable: true },
        { key: "ingreso", header: "Ingreso", valor: (m) => m.ingreso },
        {
          key: "estado",
          header: "Estado",
          valor: (m) => m.estado,
          ordenable: true,
          render: (m) => <EstadoBadge estado={m.estado} />,
        },
      ]}
      campos={[
        { name: "nombre", label: "Nombre", ancho: "medio", placeholder: "Canela", requerido: true },
        { name: "especie", label: "Especie", tipo: "select", opciones: ["Perro", "Gato"], ancho: "medio", requerido: true },
        { name: "raza", label: "Raza", ancho: "medio", placeholder: "Criollo", requerido: true },
        { name: "sexo", label: "Sexo", tipo: "select", opciones: ["Macho", "Hembra"], ancho: "medio", requerido: true },
        { name: "edadMeses", label: "Edad (meses)", tipo: "numero", ancho: "medio", requerido: true },
        { name: "peso", label: "Peso (kg)", tipo: "numero", ancho: "medio", requerido: true },
        { name: "tamano", label: "Tamaño", tipo: "select", opciones: ["Pequeño", "Mediano", "Grande"], ancho: "medio", requerido: true },
        { name: "ciudad", label: "Ciudad", tipo: "select", opciones: ciudades, ancho: "medio", requerido: true },
        {
          name: "estado",
          label: "Estado",
          tipo: "select",
          opciones: ["Disponible", "En proceso", "Adoptado", "En tratamiento"],
          ancho: "medio",
          requerido: true,
        },
        { name: "ingreso", label: "Fecha de ingreso", tipo: "fecha", ancho: "medio", requerido: true },
        { name: "foto", label: "Foto principal", tipo: "imagen" },
        { name: "historia", label: "Historia", tipo: "textarea", requerido: true },
        { name: "salud", label: "Notas de salud", tipo: "textarea" },
      ]}
      detalle={(m) => (
        <div className="space-y-4">
          <div className="flex gap-4">
            <img src={m.galeria[0]} alt={m.nombre} className="size-28 rounded-2xl object-cover" />
            <div>
              <p className="font-display text-xl font-semibold">{m.nombre}</p>
              <p className="text-sm text-muted-foreground">
                {m.especie} · {m.raza} · {m.sexo} · {m.edad}
              </p>
              <div className="mt-2">
                <EstadoBadge estado={m.estado} />
              </div>
            </div>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {[
              ["Ciudad", m.ciudad],
              ["Tamaño", m.tamano],
              ["Peso", `${m.peso} kg`],
              ["Energía", m.energia],
              ["Esterilizado", m.esterilizado ? "Sí" : "No"],
              ["Vacunado", m.vacunado ? "Sí" : "No"],
              ["Apto con niños", m.compatibleNinos ? "Sí" : "No"],
              ["Apto con mascotas", m.compatibleMascotas ? "Sí" : "No"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-border bg-cream/60 p-3">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-sm font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="text-sm font-semibold">Historia</p>
            <p className="mt-1 text-sm text-muted-foreground">{m.historia}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Salud</p>
            <p className="mt-1 text-sm text-muted-foreground">{m.salud}</p>
          </div>
        </div>
      )}
    />
  );
}
