import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Banknote, Boxes, HandHeart, HeartHandshake, Landmark, PawPrint } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { SectionHeader } from "@/components/shared/section-header";
import { campanas } from "@/mock";

export const Route = createFileRoute("/_site/donaciones")({
  head: () => ({
    meta: [
      { title: "Donaciones y campañas — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Apoya el rescate animal con una donación en dinero o en especie y sigue el avance de nuestras campañas activas.",
      },
      { property: "og:title", content: "Donaciones y campañas — Bigotes y Colitas" },
      { property: "og:description", content: "Dona dinero, alimento o insumos y apoya el bienestar animal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const moneda = (n: number) => `$${n.toLocaleString("es-CO")}`;
const montos = [20000, 50000, 100000, 200000];

function Pagina() {
  const [tipo, setTipo] = useState("dinero");
  const [monto, setMonto] = useState(50000);
  const [personalizado, setPersonalizado] = useState("");
  const [enviado, setEnviado] = useState(false);

  return (
    <div>
      <section className="bg-cream/70 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">Apóyanos</p>
            <h1 className="font-display text-3xl font-semibold sm:text-4xl">Tu donación sostiene el refugio</h1>
            <p className="mt-3 text-muted-foreground">
              Con cada aporte cubrimos alimento, tratamientos veterinarios, esterilizaciones y
              transporte de rescates. Puedes donar dinero o entregar insumos en nuestros puntos.
            </p>
          </div>
          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icono: PawPrint, valor: "84", texto: "mascotas bajo cuidado" },
              { icono: HeartHandshake, valor: "312", texto: "adopciones logradas" },
              { icono: Banknote, valor: moneda(18450000), texto: "recaudado en 2026" },
            ].map((d) => (
              <Card key={d.texto} className="border-border/80 shadow-none">
                <CardContent className="flex items-center gap-4 p-5">
                  <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
                    <d.icono className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="sr-only">{d.texto}</dt>
                    <dd className="font-display text-xl font-semibold">{d.valor}</dd>
                    <p className="text-sm text-muted-foreground">{d.texto}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader
          eyebrow="Campañas activas"
          titulo="Elige la causa que quieres impulsar"
          descripcion="Cada campaña tiene una meta y una fecha de cierre. Mostramos el avance en tiempo real."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {campanas.map((c) => {
            const pct = Math.round((c.recaudado / c.meta) * 100);
            return (
              <Card key={c.id} className="flex flex-col border-border/80">
                <CardContent className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-semibold">{c.titulo}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{c.descripcion}</p>
                  <div className="mt-5 space-y-2">
                    <Progress value={pct} aria-label={`Avance de ${c.titulo}`} />
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{moneda(c.recaudado)}</span>
                      <span className="text-muted-foreground">meta {moneda(c.meta)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pct}% alcanzado · cierra el {c.cierre}
                    </p>
                  </div>
                  <Button
                    className="mt-5 w-full"
                    onClick={() => {
                      setTipo("dinero");
                      document.getElementById("formulario-donacion")?.scrollIntoView({ behavior: "smooth" });
                      toast.success(`Campaña seleccionada: ${c.titulo}`);
                    }}
                  >
                    Donar a esta campaña
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section id="formulario-donacion" className="bg-cream/60 py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="border-border/80">
            <CardContent className="p-6 sm:p-8">
              <h2 className="font-display text-2xl font-semibold">Formulario de donación</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Los campos marcados con * son obligatorios. Este prototipo no procesa pagos reales.
              </p>

              <form
                className="mt-6 space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  setEnviado(true);
                  toast.success("¡Gracias! Registramos tu intención de donación.");
                }}
              >
                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">Tipo de donación *</legend>
                  <RadioGroup value={tipo} onValueChange={setTipo} className="grid gap-3 sm:grid-cols-2">
                    {[
                      { v: "dinero", l: "Dinero", i: Banknote },
                      { v: "especie", l: "En especie", i: Boxes },
                    ].map((o) => (
                      <Label
                        key={o.v}
                        htmlFor={`tipo-${o.v}`}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-4 font-normal has-[:checked]:border-primary has-[:checked]:bg-accent/50"
                      >
                        <RadioGroupItem id={`tipo-${o.v}`} value={o.v} />
                        <o.i className="size-4 text-coffee-light" aria-hidden="true" />
                        {o.l}
                      </Label>
                    ))}
                  </RadioGroup>
                </fieldset>

                {tipo === "dinero" ? (
                  <div className="space-y-3">
                    <Label>Monto *</Label>
                    <div className="flex flex-wrap gap-2">
                      {montos.map((m) => (
                        <Button
                          key={m}
                          type="button"
                          variant={monto === m && !personalizado ? "default" : "outline"}
                          onClick={() => {
                            setMonto(m);
                            setPersonalizado("");
                          }}
                        >
                          {moneda(m)}
                        </Button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="monto-personalizado">Otro monto</Label>
                      <Input
                        id="monto-personalizado"
                        inputMode="numeric"
                        value={personalizado}
                        onChange={(e) => setPersonalizado(e.target.value.replace(/\D/g, ""))}
                        placeholder="Ej. 75000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frecuencia">Frecuencia</Label>
                      <Select defaultValue="unica">
                        <SelectTrigger id="frecuencia">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unica">Donación única</SelectItem>
                          <SelectItem value="mensual">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="insumo">Tipo de insumo *</Label>
                      <Select defaultValue="Alimentos">
                        <SelectTrigger id="insumo">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["Alimentos", "Medicamentos", "Juguetes", "Cobijas", "Accesorios"].map((i) => (
                            <SelectItem key={i} value={i}>
                              {i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="detalle">Detalle de la entrega *</Label>
                      <Textarea id="detalle" required placeholder="Ej. 10 kg de concentrado para cachorro" rows={3} />
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="don-nombre">Nombre completo *</Label>
                    <Input id="don-nombre" required placeholder="Nombre y apellido" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="don-correo">Correo electrónico *</Label>
                    <Input id="don-correo" type="email" required placeholder="correo@ejemplo.com" />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="don-mensaje">Mensaje (opcional)</Label>
                    <Textarea id="don-mensaje" rows={3} placeholder="Cuéntanos si tu donación es en memoria de alguien" />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  <HandHeart className="size-4" aria-hidden="true" /> Confirmar donación
                </Button>

                {enviado && (
                  <p role="status" className="rounded-xl bg-success/15 px-4 py-3 text-sm text-foreground">
                    Recibimos tu registro. Te enviaremos el certificado de donación al correo indicado.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/80">
              <CardContent className="p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                  <Landmark className="size-5 text-coffee-light" aria-hidden="true" /> Transferencia bancaria
                </h2>
                <dl className="mt-4 space-y-3 text-sm">
                  {[
                    ["Entidad", "Banco Solidario"],
                    ["Cuenta de ahorros", "123-456789-01"],
                    ["Titular", "Fundación Bigotes y Colitas"],
                    ["NIT", "901.234.567-8"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-border/60 pb-2">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
            <Card className="border-border/80 bg-accent/40">
              <CardContent className="p-6">
                <h2 className="font-display text-xl font-semibold">Puntos de entrega</h2>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li>Casa Bigotes · Calle 45 #12-30, Bogotá · Lun a Sáb, 9:00 a.m. - 5:00 p.m.</li>
                  <li>Sede Medellín · Carrera 70 #33-15 · Lun a Vie, 10:00 a.m. - 4:00 p.m.</li>
                  <li>Sede Cali · Avenida 6N #23-11 · Mar a Sáb, 9:00 a.m. - 3:00 p.m.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
