import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type Columna, type FiltroConfig } from "@/components/shared/data-table";

export interface CampoFormulario {
  name: string;
  label: string;
  tipo?: "texto" | "textarea" | "numero" | "select" | "fecha" | "imagen";
  opciones?: string[];
  placeholder?: string;
  ancho?: "completo" | "medio";
  /** Si es true, el campo es obligatorio y se valida antes de registrar */
  requerido?: boolean;
  /** Valor mínimo para campos numéricos (por defecto 0: no se aceptan negativos). */
  min?: number;
  paso?: number;
  ayuda?: string;
}

interface CrudModuleProps<T extends { id: string }> {
  titulo: string;
  descripcion: string;
  datos: T[];
  columnas: Columna<T>[];
  buscarEn: (fila: T) => string;
  filtros?: FiltroConfig[];
  valorFiltro?: (fila: T, key: string) => string;
  campos: CampoFormulario[];
  etiquetaNuevo?: string;
  /** Si es false, oculta el alta manual (solo consulta y actualización). */
  permitirCrear?: boolean;
  detalle?: (fila: T) => React.ReactNode;
  extra?: React.ReactNode;
}

/**
 * Módulo administrativo reutilizable con la interfaz CRUD completa:
 * tabla, buscador, filtros, orden, paginación, exportar, alta/edición,
 * detalle y confirmación de borrado. Las acciones son simuladas (toast);
 * al integrar el backend se reemplazan por llamadas a la API REST.
 */
export function CrudModule<T extends { id: string }>({
  titulo,
  descripcion,
  datos,
  columnas,
  buscarEn,
  filtros,
  valorFiltro,
  campos,
  etiquetaNuevo = "Nuevo registro",
  permitirCrear = true,
  detalle,
  extra,
}: CrudModuleProps<T>) {
  const [formAbierto, setFormAbierto] = useState(false);
  const [modo, setModo] = useState<"crear" | "editar">("crear");
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [borrarAbierto, setBorrarAbierto] = useState(false);
  const [seleccion, setSeleccion] = useState<T | null>(null);
  const [valoresForm, setValoresForm] = useState<Record<string, string>>({});

  const abrirFormulario = (nuevoModo: "crear" | "editar", item?: T) => {
    setModo(nuevoModo);
    setSeleccion(item ?? null);
    if (nuevoModo === "editar" && item) {
      const iniciales: Record<string, string> = {};
      campos.forEach((c) => {
        const val = (item as Record<string, unknown>)[c.name];
        iniciales[c.name] = val !== undefined && val !== null ? String(val) : "";
      });
      setValoresForm(iniciales);
    } else {
      setValoresForm({});
    }
    setFormAbierto(true);
  };

  const actualizarValor = (name: string, valor: string) => {
    setValoresForm((prev) => ({ ...prev, [name]: valor }));
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos obligatorios
    const faltantes = campos
      .filter((c) => c.requerido && (!valoresForm[c.name] || valoresForm[c.name].trim() === ""))
      .map((c) => c.label);

    if (faltantes.length > 0) {
      toast.error(
        `Por favor completa los siguientes campos obligatorios: ${faltantes.join(", ")}`,
      );
      return;
    }

    setFormAbierto(false);
    toast.success(
      modo === "crear" ? "Registro creado correctamente (simulado)" : "Cambios guardados correctamente (simulado)",
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{titulo}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{descripcion}</p>
      </div>

      {extra}

      <DataTable
        datos={datos}
        columnas={columnas}
        buscarEn={buscarEn}
        filtros={filtros}
        valorFiltro={valorFiltro}
        etiquetaNuevo={etiquetaNuevo}
        onNuevo={
          permitirCrear
            ? () => abrirFormulario("crear")
            : undefined
        }
        onVer={(f) => {
          setSeleccion(f);
          setDetalleAbierto(true);
        }}
        onEditar={(f) => {
          abrirFormulario("editar", f);
        }}
        onEliminar={(f) => {
          setSeleccion(f);
          setBorrarAbierto(true);
        }}
      />

      <Dialog open={formAbierto} onOpenChange={setFormAbierto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {modo === "crear" ? etiquetaNuevo : "Editar registro"}
            </DialogTitle>
            <DialogDescription>
              {modo === "crear"
                ? "Completa todos los campos obligatorios (*) para registrar la nueva ficha."
                : "Modifica los datos y guarda los cambios."}
            </DialogDescription>
          </DialogHeader>
          <form
            id="crud-form"
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={manejarEnvio}
          >
            {campos.map((campo) => (
              <div
                key={campo.name}
                className={campo.ancho === "medio" ? "sm:col-span-1" : "sm:col-span-2"}
              >
                <Label htmlFor={campo.name} className="mb-1.5 block">
                  {campo.label}
                  {campo.requerido && (
                    <span className="ml-1 text-destructive font-bold" title="Campo obligatorio">
                      *
                    </span>
                  )}
                </Label>
                {campo.tipo === "textarea" ? (
                  <Textarea
                    id={campo.name}
                    placeholder={campo.placeholder}
                    rows={4}
                    value={valoresForm[campo.name] ?? ""}
                    onChange={(e) => actualizarValor(campo.name, e.target.value)}
                  />
                ) : campo.tipo === "imagen" ? (
                  <CampoImagen
                    campo={campo}
                    onImageChange={(val) => actualizarValor(campo.name, val)}
                  />
                ) : campo.tipo === "select" ? (
                  <Select
                    value={valoresForm[campo.name] ?? ""}
                    onValueChange={(val) => actualizarValor(campo.name, val)}
                  >
                    <SelectTrigger id={campo.name}>
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      {(campo.opciones ?? []).map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={campo.name}
                    type={campo.tipo === "numero" ? "number" : campo.tipo === "fecha" ? "date" : "text"}
                    placeholder={campo.placeholder}
                    value={valoresForm[campo.name] ?? ""}
                    onChange={(e) => actualizarValor(campo.name, e.target.value)}
                    {...(campo.tipo === "numero"
                      ? { min: campo.min ?? 0, step: campo.paso ?? 1, onKeyDown: bloquearSignoNegativo }
                      : {})}
                  />
                )}
                {campo.ayuda && (
                  <p className="mt-1.5 text-xs text-muted-foreground">{campo.ayuda}</p>
                )}
              </div>
            ))}
          </form>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="crud-form">
              {modo === "crear" ? "Crear" : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={detalleAbierto} onOpenChange={setDetalleAbierto}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del registro</DialogTitle>
            <DialogDescription>Información completa del registro seleccionado.</DialogDescription>
          </DialogHeader>
          {seleccion &&
            (detalle ? (
              detalle(seleccion)
            ) : (
              <dl className="grid gap-3 sm:grid-cols-2">
                {Object.entries(seleccion as Record<string, unknown>)
                  .filter(([, v]) => typeof v !== "object")
                  .map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-border bg-cream/60 p-3">
                      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
                      <dd className="mt-1 text-sm font-medium">{String(v)}</dd>
                    </div>
                  ))}
              </dl>
            ))}
        </DialogContent>
      </Dialog>

      <AlertDialog open={borrarAbierto} onOpenChange={setBorrarAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro se eliminará de forma permanente cuando
              el backend esté conectado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => toast.success("Registro eliminado (simulado)")}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** Impide escribir signos negativos o exponentes en los campos numéricos. */
export function bloquearSignoNegativo(e: React.KeyboardEvent<HTMLInputElement>) {
  if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
}

/** Carga de imagen con previsualización local (aún sin backend). */
function CampoImagen({
  campo,
  onImageChange,
}: {
  campo: CampoFormulario;
  onImageChange?: (val: string) => void;
}) {
  const [previa, setPrevia] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-4">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-cream/60">
        {previa ? (
          <img src={previa} alt="Vista previa" className="size-full object-cover" />
        ) : (
          <ImagePlus className="size-5 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Input
          id={campo.name}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const archivo = e.target.files?.[0];
            if (!archivo) {
              setPrevia(null);
              onImageChange?.("");
              return;
            }
            if (!archivo.type.startsWith("image/")) {
              toast.error("El archivo debe ser una imagen");
              return;
            }
            if (archivo.size > 5 * 1024 * 1024) {
              toast.error("La imagen no debe superar 5 MB");
              return;
            }
            const objectUrl = URL.createObjectURL(archivo);
            setPrevia(objectUrl);
            onImageChange?.(objectUrl);
          }}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">JPG, PNG o WEBP · máximo 5 MB.</p>
      </div>
    </div>
  );
}

