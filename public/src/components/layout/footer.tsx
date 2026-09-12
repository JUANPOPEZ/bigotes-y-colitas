import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Leaf, Mail, MapPin, PawPrint, Phone, Youtube } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <PawPrint className="size-5" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-semibold">Bigotes y Colitas</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Trabajamos por la adopción responsable de perros y gatos, la tenencia consciente y el
              bienestar animal.
            </p>
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-border bg-background p-3">
              <Leaf className="mt-0.5 size-4 text-success-foreground" aria-hidden="true" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                <span className="font-medium text-foreground">ODS 15 — Vida de ecosistemas
                terrestres.</span>{" "}
                Promovemos la protección de la fauna y la convivencia responsable.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Mapa del sitio</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {[
                { l: "Mascotas", to: "/mascotas" },
                { l: "Adopta", to: "/adopta" },
                { l: "Donaciones", to: "/donaciones" },
                { l: "Tienda", to: "/tienda" },
                { l: "Eventos", to: "/eventos" },
                { l: "Reportar denuncia", to: "/denuncias" },
              ].map((i) => (
                <li key={i.to}>
                  <Link to={i.to} className="transition-colors hover:text-foreground">
                    {i.l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="size-4" aria-hidden="true" /> (601) 555 0142
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" aria-hidden="true" /> hola@bigotesycolitas.org
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" /> Calle 45 #12-30, Bogotá
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="icon" aria-label="Instagram">
                <Instagram className="size-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Facebook">
                <Facebook className="size-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="YouTube">
                <Youtube className="size-4" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Newsletter</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              Historias de adopción y jornadas, una vez al mes.
            </p>
            <form
              className="mt-4 space-y-2"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <Label htmlFor="newsletter" className="sr-only">
                Correo electrónico
              </Label>
              <Input id="newsletter" type="email" placeholder="tu@correo.com" required />
              <Button type="submit" className="w-full">
                Suscribirme
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Bigotes y Colitas. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/politicas" className="hover:text-foreground">
              Políticas de privacidad
            </Link>
            <Link to="/terminos" className="hover:text-foreground">
              Términos y condiciones
            </Link>
            <Link to="/contacto" className="hover:text-foreground">
              Soporte
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
