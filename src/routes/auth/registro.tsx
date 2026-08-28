import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Loader2, PawPrint } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setRolSimulado } from "@/lib/mock-session";
import { ciudades } from "@/mock/mascotas";
import pet3 from "@/assets/pet-3.jpg";

export const Route = createFileRoute("/auth/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Crea tu cuenta gratuita en Bigotes y Colitas para postularte a una adopción, donar y participar en jornadas.",
      },
      { property: "og:title", content: "Crear cuenta — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Regístrate y comienza tu proceso de adopción responsable.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const beneficios = [
  "Guarda tus mascotas favoritas y compáralas",
  "Sigue el estado de tus solicitudes en tiempo real",
  "Recibe el certificado de tus donaciones",
  "Inscríbete a jornadas y talleres con un clic",
];

function fuerza(clave: string) {
  let puntos = 0;
  if (clave.length >= 8) puntos += 34;
  if (/[A-Z]/.test(clave) && /[a-z]/.test(clave)) puntos += 33;
  if (/\d|[^\w\s]/.test(clave)) puntos += 33;
  return puntos;
}

function Pagina() {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [clave, setClave] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [acepta, setAcepta] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const nivel = fuerza(clave);
  const etiquetaNivel = nivel >= 100 ? "Segura" : nivel >= 67 ? "Aceptable" : "Débil";

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    const nuevos: Record<string, string> = {};
    if (!String(datos.get("nombre") ?? "").trim()) nuevos.nombre = "Ingresa tu nombre completo.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(datos.get("correo") ?? "")))
      nuevos.correo = "Escribe un correo válido.";
    if (!/^\d{7,10}$/.test(String(datos.get("telefono") ?? "")))
      nuevos.telefono = "Ingresa un teléfono de 7 a 10 dígitos.";
    if (clave.length < 8) nuevos.clave = "Usa mínimo 8 caracteres.";
    if (clave !== confirmar) nuevos.confirmar = "Las contraseñas no coinciden.";
    if (!acepta) nuevos.acepta = "Debes aceptar los términos y la política de datos.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setCargando(true);
    window.setTimeout(() => {
      setCargando(false);
      setRolSimulado("adoptante");
      toast.success("Cuenta creada. ¡Bienvenida a Bigotes y Colitas!");
      navigate({ to: "/cuenta" });
    }, 800);
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden lg:block">
        <img src={pet3} alt="Mascota rescatada esperando hogar" className="size-full object-cover" />
        <div className="absolute inset-0 bg-coffee/50" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-cream">
          <p className="font-display text-3xl font-semibold leading-snug">
            Tu cuenta es el primer paso de una adopción responsable.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {beneficios.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream/50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-lg">
          <Link to="/" className="mb-8 inline-flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <PawPrint className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-semibold">
              Bigotes <span className="text-coffee-light">y Colitas</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Crear cuenta</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Solo toma un minuto. Con tu cuenta puedes postularte a adopciones y hacer seguimiento.
          </p>

          <Card className="mt-8 border-border/80 shadow-none">
            <CardContent className="p-6">
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={enviar} noValidate>
                <div className="sm:col-span-2">
                  <Label htmlFor="nombre" className="mb-1.5 block">
                    Nombre completo
                  </Label>
                  <Input id="nombre" name="nombre" placeholder="María Fernanda López" />
                  {errores.nombre && (
                    <p className="mt-1.5 text-xs text-destructive">{errores.nombre}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="correo-registro" className="mb-1.5 block">
                    Correo electrónico
                  </Label>
                  <Input
                    id="correo-registro"
                    name="correo"
                    type="email"
                    placeholder="tucorreo@correo.com"
                  />
                  {errores.correo && (
                    <p className="mt-1.5 text-xs text-destructive">{errores.correo}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telefono" className="mb-1.5 block">
                    Teléfono
                  </Label>
                  <Input id="telefono" name="telefono" inputMode="numeric" placeholder="3001234567" />
                  {errores.telefono && (
                    <p className="mt-1.5 text-xs text-destructive">{errores.telefono}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="ciudad" className="mb-1.5 block">
                    Ciudad
                  </Label>
                  <Select defaultValue={ciudades[0]}>
                    <SelectTrigger id="ciudad">
                      <SelectValue placeholder="Selecciona tu ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {ciudades.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tipo-vivienda" className="mb-1.5 block">
                    Tipo de vivienda
                  </Label>
                  <Select defaultValue="Apartamento">
                    <SelectTrigger id="tipo-vivienda">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Apartamento", "Casa", "Finca"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="clave-registro" className="mb-1.5 block">
                    Contraseña
                  </Label>
                  <Input
                    id="clave-registro"
                    type="password"
                    value={clave}
                    onChange={(e) => setClave(e.target.value)}
                  />
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={nivel} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">{etiquetaNivel}</span>
                  </div>
                  {errores.clave && (
                    <p className="mt-1.5 text-xs text-destructive">{errores.clave}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="confirmar" className="mb-1.5 block">
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirmar"
                    type="password"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                  />
                  {errores.confirmar && (
                    <p className="mt-1.5 text-xs text-destructive">{errores.confirmar}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <Checkbox
                      checked={acepta}
                      onCheckedChange={(v) => setAcepta(v === true)}
                      className="mt-0.5"
                    />
                    <span>
                      Acepto los{" "}
                      <Link to="/terminos" className="font-medium text-coffee-light hover:underline">
                        términos y condiciones
                      </Link>{" "}
                      y la{" "}
                      <Link to="/politicas" className="font-medium text-coffee-light hover:underline">
                        política de tratamiento de datos
                      </Link>
                      .
                    </span>
                  </label>
                  {errores.acepta && (
                    <p className="mt-1.5 text-xs text-destructive">{errores.acepta}</p>
                  )}
                </div>

                <Button type="submit" className="sm:col-span-2" disabled={cargando}>
                  {cargando && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Crear mi cuenta
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/auth/login" className="font-medium text-coffee-light hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
