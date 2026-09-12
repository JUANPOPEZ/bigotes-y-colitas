import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_site/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Bigotes y Colitas" },
      {
        name: "description",
        content: "Escríbenos por adopciones, donaciones, voluntariado o alianzas. Teléfonos, sedes y horarios de atención.",
      },
      { property: "og:title", content: "Contacto — Bigotes y Colitas" },
      { property: "og:description", content: "Canales de atención, sedes y formulario de contacto de Bigotes y Colitas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">Hablemos</p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Contacto</h1>
        <p className="mt-3 text-muted-foreground">
          Respondemos en un plazo máximo de 48 horas hábiles. Para urgencias con animales en peligro,
          usa la línea telefónica.
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <Card className="border-border/80">
          <CardContent className="p-6 sm:p-8">
            <h2 className="font-display text-2xl font-semibold">Envíanos un mensaje</h2>
            <form
              className="mt-6 space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Mensaje enviado. Te responderemos muy pronto.");
                (e.target as HTMLFormElement).reset();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ct-nombre">Nombre completo *</Label>
                  <Input id="ct-nombre" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct-correo">Correo electrónico *</Label>
                  <Input id="ct-correo" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct-tel">Teléfono</Label>
                  <Input id="ct-tel" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ct-motivo">Motivo *</Label>
                  <Select defaultValue="Adopciones">
                    <SelectTrigger id="ct-motivo">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Adopciones", "Donaciones", "Voluntariado", "Alianzas", "Otro"].map((m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ct-mensaje">Mensaje *</Label>
                <Textarea id="ct-mensaje" required rows={6} placeholder="Cuéntanos en qué podemos ayudarte" />
              </div>
              <Button type="submit" size="lg" className="w-full">
                <Send className="size-4" aria-hidden="true" /> Enviar mensaje
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/80">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-xl font-semibold">Canales de atención</h2>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <Phone className="mt-0.5 size-4 text-coffee-light" aria-hidden="true" />
                  <span>
                    <span className="block font-medium">(601) 742 1180</span>
                    <span className="text-muted-foreground">Línea principal y urgencias</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Mail className="mt-0.5 size-4 text-coffee-light" aria-hidden="true" />
                  <span>
                    <span className="block font-medium">hola@bigotesycolitas.org</span>
                    <span className="text-muted-foreground">Consultas generales</span>
                  </span>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 size-4 text-coffee-light" aria-hidden="true" />
                  <span>
                    <span className="block font-medium">Lun a Vie 9:00 a.m. - 6:00 p.m.</span>
                    <span className="text-muted-foreground">Sábados 9:00 a.m. - 1:00 p.m.</span>
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardContent className="space-y-4 p-6">
              <h2 className="font-display text-xl font-semibold">Nuestras sedes</h2>
              {[
                ["Casa Bigotes · Bogotá", "Calle 45 #12-30, Chapinero"],
                ["Sede Medellín", "Carrera 70 #33-15, Laureles"],
                ["Sede Cali", "Avenida 6N #23-11, Granada"],
              ].map(([t, d]) => (
                <p key={t} className="flex gap-3 text-sm">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-coffee-light" aria-hidden="true" />
                  <span>
                    <span className="block font-medium">{t}</span>
                    <span className="text-muted-foreground">{d}</span>
                  </span>
                </p>
              ))}
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border bg-cream/70 text-sm text-muted-foreground">
                Mapa disponible al conectar el servicio de mapas
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold">Preguntas frecuentes</h2>
              <Accordion type="single" collapsible className="mt-2">
                {[
                  ["¿Cuánto tarda un proceso de adopción?", "Entre 7 y 15 días, incluyendo entrevista y visita domiciliaria."],
                  ["¿La adopción tiene algún costo?", "No cobramos por el animal; solo se aporta el valor del kit veterinario si aplica."],
                  ["¿Puedo ser hogar de paso?", "Sí. Escríbenos indicando motivo Voluntariado y te enviamos los requisitos."],
                ].map(([q, a], i) => (
                  <AccordionItem key={q} value={`faq-${i}`}>
                    <AccordionTrigger className="text-left">{q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
