import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/empty-state";
import { productos } from "@/mock";

export const Route = createFileRoute("/_site/tienda")({
  head: () => ({
    meta: [
      { title: "Tienda solidaria — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Compra alimento, accesorios y merch solidaria. El 100% de las ganancias financia el rescate y cuidado animal.",
      },
      { property: "og:title", content: "Tienda solidaria — Bigotes y Colitas" },
      { property: "og:description", content: "Cada compra financia rescates, alimento y esterilizaciones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const moneda = (n: number) => `$${n.toLocaleString("es-CO")}`;

function Pagina() {
  const [categoria, setCategoria] = useState("Todas");
  const [orden, setOrden] = useState("destacados");
  const [carrito, setCarrito] = useState<Record<string, number>>({});

  const categorias = useMemo(() => ["Todas", ...new Set(productos.map((p) => p.categoria))], []);

  const lista = useMemo(() => {
    const base = productos.filter((p) => categoria === "Todas" || p.categoria === categoria);
    return [...base].sort((a, b) => {
      if (orden === "precio-asc") return a.precio - b.precio;
      if (orden === "precio-desc") return b.precio - a.precio;
      return Number(b.destacado) - Number(a.destacado);
    });
  }, [categoria, orden]);

  const items = Object.entries(carrito)
    .map(([id, cant]) => ({ producto: productos.find((p) => p.id === id)!, cant }))
    .filter((i) => i.producto);
  const total = items.reduce((s, i) => s + i.producto.precio * i.cant, 0);
  const unidades = items.reduce((s, i) => s + i.cant, 0);

  const agregar = (id: string, delta = 1) =>
    setCarrito((c) => {
      const nuevo = { ...c, [id]: Math.max(0, (c[id] ?? 0) + delta) };
      if (nuevo[id] === 0) delete nuevo[id];
      return nuevo;
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">Tienda solidaria</p>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Compra y ayuda al mismo tiempo</h1>
          <p className="mt-3 text-muted-foreground">
            Cada producto financia alimento, tratamientos y jornadas de esterilización.
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative w-fit">
              <ShoppingCart className="size-4" aria-hidden="true" /> Carrito
              {unidades > 0 && (
                <Badge className="absolute -right-2 -top-2 size-5 justify-center rounded-full p-0 text-xs">{unidades}</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="flex w-full flex-col sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Tu carrito</SheetTitle>
            </SheetHeader>
            <div className="flex-1 space-y-4 overflow-y-auto px-4">
              {items.length === 0 ? (
                <EmptyState icono={ShoppingBag} titulo="Tu carrito está vacío" descripcion="Agrega productos para apoyar la causa." />
              ) : (
                items.map(({ producto, cant }) => (
                  <div key={producto.id} className="flex gap-3 rounded-xl border border-border p-3">
                    <img src={producto.imagen} alt="" className="size-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">{moneda(producto.precio)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button size="icon" variant="outline" className="size-7" aria-label="Quitar una unidad" onClick={() => agregar(producto.id, -1)}>
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{cant}</span>
                        <Button size="icon" variant="outline" className="size-7" aria-label="Agregar una unidad" onClick={() => agregar(producto.id, 1)}>
                          <Plus className="size-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="ml-auto size-7"
                          aria-label={`Eliminar ${producto.nombre}`}
                          onClick={() => agregar(producto.id, -cant)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <SheetFooter>
              <div className="w-full space-y-3">
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{moneda(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Envío</span>
                  <span className="font-medium">{total > 150000 ? "Gratis" : moneda(12000)}</span>
                </div>
                <div className="flex justify-between font-display text-lg font-semibold">
                  <span>Total</span>
                  <span>{moneda(total > 150000 || total === 0 ? total : total + 12000)}</span>
                </div>
                <Button
                  className="w-full"
                  disabled={items.length === 0}
                  onClick={() => {
                    setCarrito({});
                    toast.success("Pedido simulado creado. Te enviamos el resumen por correo.");
                  }}
                >
                  Finalizar compra
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </header>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <Button key={c} size="sm" variant={categoria === c ? "default" : "outline"} onClick={() => setCategoria(c)}>
              {c}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="orden-tienda" className="text-sm">
            Ordenar
          </Label>
          <Select value={orden} onValueChange={setOrden}>
            <SelectTrigger id="orden-tienda" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="destacados">Destacados</SelectItem>
              <SelectItem value="precio-asc">Menor precio</SelectItem>
              <SelectItem value="precio-desc">Mayor precio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((p) => (
          <Card key={p.id} className="hover-lift flex flex-col overflow-hidden border-border/80 p-0">
            <div className="relative aspect-[4/3] bg-muted">
              <img src={p.imagen} alt={p.nombre} loading="lazy" className="size-full object-cover" />
              {p.destacado && <Badge className="absolute left-3 top-3">Destacado</Badge>}
              {p.stock <= 10 && (
                <Badge variant="outline" className="absolute right-3 top-3 bg-background/90">
                  Últimas {p.stock}
                </Badge>
              )}
            </div>
            <CardContent className="flex flex-1 flex-col p-5">
              <Badge variant="secondary" className="w-fit">
                {p.categoria}
              </Badge>
              <h2 className="mt-3 font-display text-lg font-semibold">{p.nombre}</h2>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{p.descripcion}</p>
              <p className="mt-3 font-display text-xl font-semibold">{moneda(p.precio)}</p>
              <Button
                className="mt-4"
                onClick={() => {
                  agregar(p.id);
                  toast.success(`${p.nombre} agregado al carrito`);
                }}
              >
                <ShoppingCart className="size-4" aria-hidden="true" /> Agregar al carrito
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Input className="max-w-xs" placeholder="Código de descuento" aria-label="Código de descuento" />
        <Button variant="outline" onClick={() => toast.info("Código no válido en el prototipo")}>
          Aplicar
        </Button>
      </div>
    </div>
  );
}
