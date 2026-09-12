import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ImagePlus, UploadCloud, Link as LinkIcon, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  onCrear?: (valores: Record<string, string>) => Promise<void> | void;
  onEditar?: (id: string, valores: Record<string, string>) => Promise<void> | void;
  onEliminar?: (item: T) => Promise<void> | void;
}

/**
 * Módulo administrativo reutilizable con la interfaz CRUD completa:
 * tabla, buscador, filtros, orden, paginación, exportar, alta/edición,
 * detalle y confirmación de borrado.
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
  onCrear,
  onEditar,
  onEliminar,
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
      const obj = item as Record<string, unknown>;
      campos.forEach((c) => {
        let val = obj[c.name];
        if (c.tipo === "imagen" && (!val || val === "") && Array.isArray(obj.galeria) && obj.galeria.length > 0) {
          val = obj.galeria[0];
        }
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

  const [guardando, setGuardando] = useState(false);

  const manejarEnvio = async (e: React.FormEvent) => {
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

    try {
      setGuardando(true);
      if (modo === "crear" && onCrear) {
        await onCrear(valoresForm);
        setFormAbierto(false);
      } else if (modo === "editar" && onEditar && seleccion) {
        await onEditar(seleccion.id, valoresForm);
        setFormAbierto(false);
      } else {
        setFormAbierto(false);
        toast.success(
          modo === "crear" ? "Registro creado correctamente" : "Cambios guardados correctamente",
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error al procesar la solicitud";
      toast.error(msg);
    } finally {
      setGuardando(false);
    }
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
                    valor={valoresForm[campo.name] ?? ""}
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
            <Button variant="outline" onClick={() => setFormAbierto(false)} disabled={guardando}>
              Cancelar
            </Button>
            <Button type="submit" form="crud-form" disabled={guardando}>
              {guardando ? "Guardando..." : modo === "crear" ? "Crear" : "Guardar cambios"}
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
              Esta acción no se puede deshacer. El registro se eliminará de forma permanente de la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                try {
                  if (onEliminar && seleccion) {
                    await onEliminar(seleccion);
                  } else {
                    toast.success("Registro eliminado correctamente");
                  }
                } catch (error: unknown) {
                  const msg = error instanceof Error ? error.message : "Error al eliminar el registro";
                  toast.error(msg);
                }
              }}
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

/** Carga de imagen con previsualización, subida a Supabase Storage y soporte de enlace directo. */
function CampoImagen({
  campo,
  valor = "",
  onImageChange,
}: {
  campo: CampoFormulario;
  valor?: string;
  onImageChange?: (val: string) => void;
}) {
  const [previa, setPrevia] = useState<string>(valor);
  const [modo, setModo] = useState<"archivo" | "url">(
    valor && valor.startsWith("http") && !valor.includes("supabase.co") ? "url" : "archivo"
  );
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    setPrevia(valor);
  }, [valor]);

  const manejarArchivo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      toast.error("El archivo seleccionado debe ser una imagen (JPG, PNG o WEBP)");
      return;
    }

    if (archivo.size > 8 * 1024 * 1024) {
      toast.error("La imagen no debe superar los 8 MB");
      return;
    }

    setSubiendo(true);
    try {
      const nombreLimpio = archivo.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const ruta = `mascotas/${Date.now()}_${nombreLimpio}`;

      // 1. Intento de subida a Supabase Storage (bucket 'pets')
      const { data, error } = await supabase.storage
        .from("pets")
        .upload(ruta, archivo, {
          cacheControl: "3600",
          upsert: true,
          contentType: archivo.type,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage.from("pets").getPublicUrl(ruta);
        const urlFinal = publicData.publicUrl;
        setPrevia(urlFinal);
        onImageChange?.(urlFinal);
        toast.success("Imagen guardada en Supabase Storage (bucket 'pets')");
      } else {
        console.error("[CampoImagen] Error al subir a Supabase Storage:", error?.message);
        toast.error(
          `Aviso: No se pudo subir al bucket 'pets' (${error?.message || "crea el bucket en Supabase"}). Se usará copia local.`
        );
        // Respaldo garantizado: codificación Base64 en caso de que el bucket de storage no esté activo
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setPrevia(base64);
          onImageChange?.(base64);
        };
        reader.readAsDataURL(archivo);
      }
    } catch (err) {
      console.warn("[CampoImagen] Error al procesar imagen, usando fallback Base64:", err);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPrevia(base64);
        onImageChange?.(base64);
        toast.success("Imagen cargada y lista para guardar");
      };
      reader.readAsDataURL(archivo);
    } finally {
      setSubiendo(false);
    }
  };

  const limpiarImagen = () => {
    setPrevia("");
    onImageChange?.("");
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={modo === "archivo" ? "secondary" : "ghost"}
          className="h-7 text-xs"
          onClick={() => setModo("archivo")}
        >
          <UploadCloud className="mr-1.5 size-3.5" />
          Subir archivo
        </Button>
        <Button
          type="button"
          size="sm"
          variant={modo === "url" ? "secondary" : "ghost"}
          className="h-7 text-xs"
          onClick={() => setModo("url")}
        >
          <LinkIcon className="mr-1.5 size-3.5" />
          Enlace web (URL)
        </Button>
      </div>

      <div className="flex items-start gap-4">
        <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-cream/60">
          {subiendo ? (
            <Loader2 className="size-6 animate-spin text-primary" />
          ) : previa ? (
            <>
              <img src={previa} alt="Vista previa" className="size-full object-cover" />
              <button
                type="button"
                onClick={limpiarImagen}
                className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                title="Quitar imagen"
              >
                <X className="size-3.5" />
              </button>
            </>
          ) : (
            <ImagePlus className="size-6 text-muted-foreground" aria-hidden="true" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {modo === "archivo" ? (
            <div>
              <Input
                id={campo.name}
                type="file"
                disabled={subiendo}
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={manejarArchivo}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                JPG, PNG o WEBP · Se almacena en la base de datos de Bigotes y Colitas.
              </p>
            </div>
          ) : (
            <div>
              <Input
                id={campo.name}
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={previa}
                onChange={(e) => {
                  const val = e.target.value;
                  setPrevia(val);
                  onImageChange?.(val);
                }}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Pega la dirección URL de una imagen web pública.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

