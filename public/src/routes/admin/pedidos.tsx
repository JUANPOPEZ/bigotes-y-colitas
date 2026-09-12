import { createFileRoute } from "@tanstack/react-router";

import { CrudModule } from "@/components/shared/crud-module";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { pedidos } from "@/mock";
import type { Pedido } from "@/types";

export const Route = createFileRoute("/admin/pedidos")({
  head: () => ({
    meta: [
      { title: "Pedidos de la tienda — Bigotes y Colitas" },
      { name: "description", content: "Seguimiento y actualización de los pedidos realizados en la tienda solidaria." },
      { property: "og:title", content: "Pedidos de la tienda — Bigotes y Colitas" },
      { property: "og:description", content: "Estados de preparación, envío y entrega de pedidos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const cop = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
const estados = ["Pendiente", "Preparando", "Enviado", "Entregado", "Cancelado"];

function Pagina() {
  return (
    <CrudModule<Pedido>
      titulo="Pedidos de la tienda"
      descripcion="Consulta los pedidos, actualiza su estado logístico y revisa el detalle de cada compra."
      datos={pedidos}
      permitirCrear={false}
      buscarEn={(p) => `${p.id} ${p.cliente}`}
      filtros={[{ key: "estado", label: "Estado", opciones: estados }]}
      valorFiltro={(p, key) => String(p[key as keyof Pedido] ?? "")}
      columnas={[
        { key: "id", header: "Pedido", valor: (p) => p.id, ordenable: true, render: (p) => `#${p.id}` },
        { key: "cliente", header: "Cliente", valor: (p) => p.cliente, ordenable: true },
        { key: "fecha", header: "Fecha", valor: (p) => p.fecha, ordenable: true },
        { key: "articulos", header: "Artículos", valor: (p) => p.articulos, ordenable: true },
        { key: "total", header: "Total", valor: (p) => p.total, ordenable: true, render: (p) => cop.format(p.total) },
        {
          key: "estado",
          header: "Estado",
          valor: (p) => p.estado,
          render: (p) => <EstadoBadge estado={p.estado} />,
        },
      ]}
      campos={[
        { name: "cliente", label: "Cliente", ancho: "medio" },
        { name: "fecha", label: "Fecha", tipo: "fecha", ancho: "medio" },
        { name: "articulos", label: "Número de artículos", tipo: "numero", ancho: "medio" },
        { name: "total", label: "Total (COP)", tipo: "numero", ancho: "medio" },
        { name: "estado", label: "Estado", tipo: "select", opciones: estados, ancho: "medio" },
        { name: "notas", label: "Notas de envío", tipo: "textarea" },
      ]}
    />
  );
}
