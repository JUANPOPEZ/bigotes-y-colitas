import { createFileRoute } from "@tanstack/react-router";

import { CrudModule } from "@/components/shared/crud-module";
import { Badge } from "@/components/ui/badge";
import { productos } from "@/mock";
import type { Producto } from "@/types";

export const Route = createFileRoute("/admin/productos")({
  head: () => ({
    meta: [
      { title: "Productos de la tienda — Bigotes y Colitas" },
      { name: "description", content: "Administra el catálogo solidario: precios, stock y productos destacados." },
      { property: "og:title", content: "Productos de la tienda — Bigotes y Colitas" },
      { property: "og:description", content: "Catálogo de la tienda solidaria del refugio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const categorias = [...new Set(productos.map((p) => p.categoria))];

function Pagina() {
  return (
    <CrudModule<Producto>
      titulo="Productos de la tienda"
      descripcion="Gestiona el catálogo solidario: precios, inventario, categorías y destacados de la portada."
      datos={productos}
      etiquetaNuevo="Nuevo producto"
      buscarEn={(p) => `${p.nombre} ${p.categoria} ${p.descripcion}`}
      filtros={[{ key: "categoria", label: "Categoría", opciones: categorias }]}
      valorFiltro={(p, key) => String(p[key as keyof Producto] ?? "")}
      columnas={[
        {
          key: "nombre",
          header: "Producto",
          valor: (p) => p.nombre,
          ordenable: true,
          render: (p) => (
            <div className="flex items-center gap-3">
              <img src={p.imagen} alt={p.nombre} className="size-10 rounded-xl object-cover" loading="lazy" />
              <div>
                <p className="font-medium">{p.nombre}</p>
                <p className="text-xs text-muted-foreground">{p.categoria}</p>
              </div>
            </div>
          ),
        },
        { key: "precio", header: "Precio", valor: (p) => p.precio, ordenable: true, render: (p) => cop.format(p.precio) },
        {
          key: "stock",
          header: "Stock",
          valor: (p) => p.stock,
          ordenable: true,
          render: (p) => (
            <Badge variant="outline" className={p.stock < 10 ? "border-destructive/30 bg-destructive/10 text-destructive" : ""}>
              {p.stock} und.
            </Badge>
          ),
        },
        {
          key: "destacado",
          header: "Destacado",
          valor: (p) => (p.destacado ? 1 : 0),
          render: (p) => (p.destacado ? "Sí" : "No"),
        },
      ]}
      campos={[
        { name: "nombre", label: "Nombre", ancho: "medio" },
        { name: "categoria", label: "Categoría", tipo: "select", opciones: categorias, ancho: "medio" },
        { name: "precio", label: "Precio (COP)", tipo: "numero", ancho: "medio", min: 0, paso: 500 },
        { name: "stock", label: "Stock disponible", tipo: "numero", ancho: "medio", min: 0 },
        { name: "destacado", label: "Destacado", tipo: "select", opciones: ["Sí", "No"], ancho: "medio" },
        { name: "imagen", label: "Imagen del producto", tipo: "imagen" },
        { name: "descripcion", label: "Descripción", tipo: "textarea" },
      ]}
    />
  );
}
