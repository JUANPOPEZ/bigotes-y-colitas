import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CrudModule } from "@/components/shared/crud-module";
import { EstadoBadge } from "@/components/shared/estado-badge";
import { ciudades } from "@/mock/mascotas";
import { obtenerTodasLasSolicitudes, actualizarEstadoSolicitud, eliminarSolicitudAdmin } from "@/lib/services/solicitudes";
import type { Solicitud, EstadoSolicitud } from "@/types";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/solicitudes")({
  head: () => ({
    meta: [
      { title: "Solicitudes de adopción — Bigotes y Colitas" },
      { name: "description", content: "Revisa, filtra y actualiza el estado de las solicitudes de adopción." },
    ],
  }),
  component: Pagina,
});

const estados: EstadoSolicitud[] = ["Pendiente", "En revisión", "Entrevista", "Visita", "Aprobada", "Entregado", "Rechazada"];

function Pagina() {
  const [lista, setLista] = useState<Solicitud[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    const datos = await obtenerTodasLasSolicitudes();
    setLista(datos);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const manejarEdicion = async (id: string, valores: Record<string, string>) => {
    const estadoNuevo = valores.estado as EstadoSolicitud;
    const obs = valores.observaciones;
    const actual = lista.find(s => s.id === id);

    if (actual?.estado === "Rechazada" && estadoNuevo !== "Rechazada") {
      throw new Error("Una solicitud rechazada no puede volver a cambiar de estado.");
    }
    
    // Si cambia de estado
    if (actual?.estado !== estadoNuevo) {
      let titulo = `Cambio de estado a ${estadoNuevo}`;
      if (estadoNuevo === "Rechazada") {
        titulo = "Motivo de Rechazo";
        if (!obs?.trim()) throw new Error("Debes indicar el motivo del rechazo en las observaciones.");
      } else if (actual?.estado === "Entrevista") {
        titulo = "Resultado de la Entrevista";
        if (!obs?.trim()) throw new Error("Para avanzar, debes escribir el resultado de la Entrevista.");
      } else if (actual?.estado === "Visita") {
        titulo = "Resultado de la Visita domiciliaria";
        if (!obs?.trim()) throw new Error("Para avanzar, debes escribir el resultado de la Visita domiciliaria.");
      }

      await actualizarEstadoSolicitud(id, estadoNuevo, obs, titulo);
      toast.success("Solicitud actualizada y notificada");
      await cargar();
    } else if (obs?.trim()) {
      // Solo añade observación a la cronología sin cambiar de estado
      await actualizarEstadoSolicitud(id, actual.estado, obs, "Nota del Administrador");
      toast.success("Observación añadida a la cronología");
      await cargar();
    }
  };

  const manejarEliminacion = async (item: Solicitud) => {
    await eliminarSolicitudAdmin(item.id);
    toast.success("Solicitud eliminada definitivamente del sistema.");
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
    <CrudModule<Solicitud>
      titulo="Solicitudes de adopción"
      descripcion="Gestiona el flujo completo: revisión de documentos, entrevista, visita domiciliaria y decisión final."
      datos={lista}
      permitirCrear={false} // Las solicitudes las hacen los usuarios
      buscarEn={(s) => `${s.solicitante} ${s.mascota} ${s.correo} ${s.ciudad} ${s.radicado || ""}`}
      filtros={[
        { key: "estado", label: "Estado", opciones: estados },
      ]}
      valorFiltro={(s, key) => String(s[key as keyof Solicitud] ?? "")}
      columnas={[
        { key: "radicado", header: "Radicado", valor: (s) => s.radicado || "N/A", ordenable: true },
        { key: "solicitante", header: "Solicitante", valor: (s) => s.solicitante, ordenable: true },
        { key: "mascota", header: "Mascota", valor: (s) => s.mascota, ordenable: true },
        { key: "fecha", header: "Fecha", valor: (s) => s.fecha, ordenable: true },
        {
          key: "estado",
          header: "Estado",
          valor: (s) => s.estado,
          ordenable: true,
          render: (s) => <EstadoBadge estado={s.estado} />,
        },
      ]}
      campos={(s) => {
        if (!s) return [];
        let opciones: EstadoSolicitud[] = [s.estado];
        let labelObs = "Observaciones (Opcional)";
        let ayudaObs = "Añade notas internas a la cronología del proceso.";
        let esRequerida = false;

        if (s.estado === "Pendiente") {
          opciones.push("En revisión", "Rechazada");
        } else if (s.estado === "En revisión") {
          opciones.push("Entrevista", "Rechazada");
        } else if (s.estado === "Entrevista") {
          opciones.push("Visita", "Rechazada");
          labelObs = "Resultado de la Entrevista";
          ayudaObs = "Resume qué se habló en la entrevista y tus conclusiones. Obligatorio para avanzar.";
          esRequerida = true;
        } else if (s.estado === "Visita") {
          opciones.push("Aprobada", "Rechazada");
          labelObs = "Resultado de la Visita domiciliaria";
          ayudaObs = "Escribe el concepto de la visita. Obligatorio para avanzar.";
          esRequerida = true;
        } else if (s.estado === "Aprobada") {
          opciones.push("Entregado");
          labelObs = "Notas de entrega";
          ayudaObs = "Firma de contrato, recomendaciones dadas, etc.";
        }

        return [
          { name: "estado", label: "Estado de la solicitud", tipo: "select", opciones, ancho: "medio", requerido: true },
          { 
            name: "observaciones", 
            label: labelObs, 
            tipo: "textarea",
            ayuda: ayudaObs,
            requerido: false // Lo validaremos en onEditar para no obligarlo si NO se cambia el estado
          },
        ];
      }}
      onEditar={manejarEdicion}
      onEliminar={manejarEliminacion}
      detalle={(s) => (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-display text-xl font-semibold">{s.solicitante}</p>
            <EstadoBadge estado={s.estado} />
            {s.radicado && <span className="font-mono text-sm text-muted-foreground">Radicado: {s.radicado}</span>}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-semibold">Datos básicos</p>
              <dl className="grid gap-3">
                {[
                  ["Mascota", s.mascota],
                  ["Correo", s.correo],
                  ["Teléfono", s.telefono || "N/A"],
                  ["Ciudad", s.ciudad],
                  ["Fecha radicación", s.fecha],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border bg-cream/60 p-3">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                    <dd className="mt-1 text-sm font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            
            {s.datosFormulario && (
              <div>
                <p className="mb-3 text-sm font-semibold">Evaluación del Hogar</p>
                <dl className="grid gap-3">
                  {[
                    ["Tipo de Vivienda", (s.datosFormulario as any).tipoVivienda],
                    ["Propiedad", (s.datosFormulario as any).propiedad],
                    ["Personas en casa", (s.datosFormulario as any).personas],
                    ["Niños", (s.datosFormulario as any).ninos],
                    ["Otras mascotas", (s.datosFormulario as any).otrasMascotas],
                    ["Tiempo sola", (s.datosFormulario as any).tiempoSola],
                    ["Experiencia previa", (s.datosFormulario as any).experienciaPrevia],
                  ].map(([k, v]) => (
                    v !== undefined && (
                      <div key={k} className="rounded-xl border border-border bg-cream/60 p-3">
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                        <dd className="mt-1 text-sm font-medium">{v}</dd>
                      </div>
                    )
                  ))}
                  <div className="rounded-xl border border-border bg-cream/60 p-3">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">Motivo de adopción</dt>
                    <dd className="mt-1 text-sm font-medium">{(s.datosFormulario as any).motivo}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold">Cronología del proceso</p>
            <ol className="mt-3 space-y-4 border-l border-border pl-5">
              {s.cronologia.map((c, i) => (
                <li key={`${c.fecha}-${i}`} className="relative">
                  <span
                    className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-background bg-secondary"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium">{c.titulo}</p>
                  <p className="text-xs text-muted-foreground">{c.fecha}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.detalle}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    />
  );
}
