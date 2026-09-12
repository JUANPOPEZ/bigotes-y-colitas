import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpDown, Download, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/skeletons";

export interface Columna<T> {
  key: string;
  header: string;
  render?: (fila: T) => ReactNode;
  valor?: (fila: T) => string | number;
  ordenable?: boolean;
  className?: string;
}

export interface FiltroConfig {
  key: string;
  label: string;
  opciones: string[];
}

interface DataTableProps<T> {
  datos: T[];
  columnas: Columna<T>[];
  buscarEn: (fila: T) => string;
  filtros?: FiltroConfig[];
  valorFiltro?: (fila: T, key: string) => string;
  cargando?: boolean;
  onNuevo?: () => void;
  etiquetaNuevo?: string;
  onVer?: (fila: T) => void;
  onEditar?: (fila: T) => void;
  onEliminar?: (fila: T) => void;
  vacio?: { titulo: string; descripcion?: string };
  porPagina?: number;
}

/**
 * Tabla reutilizable: búsqueda, filtros, ordenamiento, paginación y exportar.
 * Sin lógica de negocio: al conectar el backend, sustituir `datos` por la
 * respuesta paginada de la API y mover el filtrado al servidor.
 */
export function DataTable<T extends { id: string }>({
  datos,
  columnas,
  buscarEn,
  filtros = [],
  valorFiltro,
  cargando = false,
  onNuevo,
  etiquetaNuevo = "Nuevo",
  onVer,
  onEditar,
  onEliminar,
  vacio,
  porPagina = 8,
}: DataTableProps<T>) {
  const [busqueda, setBusqueda] = useState("");
  const [activos, setActivos] = useState<Record<string, string>>({});
  const [orden, setOrden] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [pagina, setPagina] = useState(1);

  const filtradas = useMemo(() => {
    let resultado = datos.filter((f) =>
      buscarEn(f).toLowerCase().includes(busqueda.trim().toLowerCase()),
    );
    for (const [key, valor] of Object.entries(activos)) {
      if (!valor || valor === "todos") continue;
      resultado = resultado.filter((f) => (valorFiltro ? valorFiltro(f, key) : "") === valor);
    }
    if (orden) {
      const col = columnas.find((c) => c.key === orden.key);
      resultado = [...resultado].sort((a, b) => {
        const va = col?.valor ? col.valor(a) : "";
        const vb = col?.valor ? col.valor(b) : "";
        if (va === vb) return 0;
        const cmp = va > vb ? 1 : -1;
        return orden.dir === "asc" ? cmp : -cmp;
      });
    }
    return resultado;
  }, [datos, busqueda, activos, orden, columnas, buscarEn, valorFiltro]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice((paginaActual - 1) * porPagina, paginaActual * porPagina);
  const hayAcciones = Boolean(onVer || onEditar || onEliminar);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-56 flex-1">
            <Label htmlFor="buscar-tabla" className="mb-1.5 block text-xs text-muted-foreground">
              Buscar
            </Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="buscar-tabla"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setPagina(1);
                }}
                placeholder="Buscar registros..."
                className="pl-9"
              />
            </div>
          </div>

          {filtros.map((f) => (
            <div key={f.key} className="w-full sm:w-44">
              <Label className="mb-1.5 block text-xs text-muted-foreground">{f.label}</Label>
              <Select
                value={activos[f.key] ?? "todos"}
                onValueChange={(v) => {
                  setActivos((prev) => ({ ...prev, [f.key]: v }));
                  setPagina(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {f.opciones.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toast.success("Exportación simulada generada")}
          >
            <Download className="mr-1.5 size-4" /> Exportar
          </Button>
          {onNuevo && (
            <Button onClick={onNuevo}>
              <Plus className="mr-1.5 size-4" /> {etiquetaNuevo}
            </Button>
          )}
        </div>
      </div>

      {cargando ? (
        <TableSkeleton />
      ) : visibles.length === 0 ? (
        <EmptyState
          titulo={vacio?.titulo ?? "Sin registros"}
          descripcion={vacio?.descripcion ?? "No encontramos resultados con los filtros aplicados."}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-cream/70">
                  {columnas.map((c) => (
                    <TableHead key={c.key} className={c.className}>
                      {c.ordenable ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
                          onClick={() =>
                            setOrden((prev) =>
                              prev?.key === c.key
                                ? { key: c.key, dir: prev.dir === "asc" ? "desc" : "asc" }
                                : { key: c.key, dir: "asc" },
                            )
                          }
                        >
                          {c.header}
                          <ArrowUpDown className="size-3.5" aria-hidden="true" />
                        </button>
                      ) : (
                        c.header
                      )}
                    </TableHead>
                  ))}
                  {hayAcciones && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibles.map((fila) => (
                  <TableRow key={fila.id}>
                    {columnas.map((c) => (
                      <TableCell key={c.key} className={c.className}>
                        {c.render ? c.render(fila) : String(c.valor?.(fila) ?? "")}
                      </TableCell>
                    ))}
                    {hayAcciones && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {onVer && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Ver detalle"
                              onClick={() => onVer(fila)}
                            >
                              <Eye className="size-4" />
                            </Button>
                          )}
                          {onEditar && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Editar"
                              onClick={() => onEditar(fila)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          )}
                          {onEliminar && (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Eliminar"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onEliminar(fila)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {!cargando && filtradas.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Mostrando {(paginaActual - 1) * porPagina + 1}–
            {Math.min(paginaActual * porPagina, filtradas.length)} de {filtradas.length} registros
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={paginaActual === 1}
              onClick={() => setPagina((p) => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {paginaActual} de {totalPaginas}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={paginaActual === totalPaginas}
              onClick={() => setPagina((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
