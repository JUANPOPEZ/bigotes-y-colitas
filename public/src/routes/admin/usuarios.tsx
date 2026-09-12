import { createFileRoute } from "@tanstack/react-router";

import { CrudModule } from "@/components/shared/crud-module";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { Badge } from "@/components/ui/badge";
import { usuarios } from "@/mock";
import { ciudades } from "@/mock/mascotas";
import type { Usuario } from "@/types";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Gestión de usuarios — Bigotes y Colitas" },
      { name: "description", content: "Administra cuentas, roles y estado de los usuarios registrados." },
      { property: "og:title", content: "Gestión de usuarios — Bigotes y Colitas" },
      { property: "og:description", content: "Cuentas de adoptantes y administradores del refugio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  return (
    <CrudModule<Usuario>
      titulo="Gestión de usuarios"
      descripcion="Consulta las cuentas registradas, asigna roles y activa o desactiva accesos."
      datos={usuarios}
      etiquetaNuevo="Nuevo usuario"
      buscarEn={(u) => `${u.nombre} ${u.correo} ${u.ciudad}`}
      filtros={[
        { key: "rol", label: "Rol", opciones: ["adoptante", "administrador"] },
        { key: "estado", label: "Estado", opciones: ["Activo", "Inactivo"] },
        { key: "ciudad", label: "Ciudad", opciones: ciudades },
      ]}
      valorFiltro={(u, key) => String(u[key as keyof Usuario] ?? "")}
      columnas={[
        { key: "nombre", header: "Nombre", valor: (u) => u.nombre, ordenable: true },
        { key: "correo", header: "Correo", valor: (u) => u.correo },
        {
          key: "rol",
          header: "Rol",
          valor: (u) => u.rol,
          ordenable: true,
          render: (u) => (
            <Badge variant="outline" className="capitalize">
              {u.rol}
            </Badge>
          ),
        },
        { key: "ciudad", header: "Ciudad", valor: (u) => u.ciudad },
        { key: "registro", header: "Registro", valor: (u) => u.registro, ordenable: true },
        {
          key: "estado",
          header: "Estado",
          valor: (u) => u.estado,
          render: (u) => <EstadoBadge estado={u.estado} />,
        },
      ]}
      campos={[
        { name: "nombre", label: "Nombre completo", ancho: "medio" },
        { name: "correo", label: "Correo electrónico", ancho: "medio" },
        { name: "rol", label: "Rol", tipo: "select", opciones: ["adoptante", "administrador"], ancho: "medio" },
        { name: "ciudad", label: "Ciudad", tipo: "select", opciones: ciudades, ancho: "medio" },
        { name: "estado", label: "Estado", tipo: "select", opciones: ["Activo", "Inactivo"], ancho: "medio" },
        { name: "registro", label: "Fecha de registro", tipo: "fecha", ancho: "medio" },
      ]}
    />
  );
}
