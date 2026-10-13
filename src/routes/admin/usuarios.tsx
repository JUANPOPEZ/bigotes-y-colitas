import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CrudModule } from "@/components/shared/crud-module";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { Badge } from "@/components/ui/badge";
import { ciudades } from "@/mock/mascotas";
import { obtenerTodosLosUsuarios, actualizarUsuario, desactivarUsuario } from "@/lib/services/usuarios";
import type { Usuario, Rol } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({
    meta: [
      { title: "Gestión de usuarios — Bigotes y Colitas" },
      { name: "description", content: "Administra cuentas, roles y estado de los usuarios registrados." },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const [lista, setLista] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    const datos = await obtenerTodosLosUsuarios();
    setLista(datos);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const manejarEdicion = async (id: string, valores: Record<string, string>) => {
    await actualizarUsuario(id, {
      nombre: valores.nombre,
      rol: valores.rol as Rol,
      ciudad: valores.ciudad,
      estado: valores.estado as "Activo" | "Inactivo",
    });
    toast.success("Usuario actualizado correctamente");
    await cargar();
  };

  const manejarEliminacion = async (item: Usuario) => {
    // Soft-delete cambiando el estado a Inactivo
    await desactivarUsuario(item.id);
    toast.success("Usuario desactivado. El usuario no podrá interactuar con el sistema.");
    await cargar();
  };

  if (cargando) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <CrudModule<Usuario>
      titulo="Gestión de usuarios"
      descripcion="Consulta las cuentas registradas, asigna roles y activa o desactiva accesos."
      datos={lista}
      permitirCrear={false} // Usuarios se crean a través del formulario de registro
      buscarEn={(u) => `${u.nombre} ${u.correo} ${u.ciudad}`}
      filtros={[
        { key: "rol", label: "Rol", opciones: ["adoptante", "administrador"] },
        { key: "estado", label: "Estado", opciones: ["Activo", "Inactivo"] },
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
        { name: "nombre", label: "Nombre completo", ancho: "medio", requerido: true },
        { name: "rol", label: "Rol", tipo: "select", opciones: ["adoptante", "administrador"], ancho: "medio", requerido: true },
        { name: "ciudad", label: "Ciudad", tipo: "select", opciones: ciudades, ancho: "medio", requerido: true },
        { name: "estado", label: "Estado", tipo: "select", opciones: ["Activo", "Inactivo"], ancho: "medio", requerido: true },
      ]}
      onEditar={manejarEdicion}
      onEliminar={manejarEliminacion}
    />
  );
}
