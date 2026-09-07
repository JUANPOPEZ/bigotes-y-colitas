import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Loader2, PawPrint } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { iniciarSesion } from "@/lib/auth";
import { setRolSimulado } from "@/lib/mock-session";
import heroPets from "@/assets/hero-pets.jpg";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "Iniciar sesión — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Ingresa a tu cuenta de Bigotes y Colitas para seguir tus solicitudes de adopción, mensajes y donaciones.",
      },
      { property: "og:title", content: "Iniciar sesión — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Accede a tu panel de adoptante en la fundación Bigotes y Colitas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const navigate = useNavigate();
  const [ver, setVer] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [correo, setCorreo] = useState("admin@bigotesycolitas.org");
  const [clave, setClave] = useState("");
  const [errores, setErrores] = useState<{ correo?: string; clave?: string }>({});
  const [recuperar, setRecuperar] = useState(false);

  async function manejarLogin(e: React.FormEvent) {
    e.preventDefault();
    const nuevos: typeof errores = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) nuevos.correo = "Escribe un correo válido.";
    if (clave.length < 6) nuevos.clave = "La contraseña debe tener al menos 6 caracteres.";
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;

    setCargando(true);
    try {
      const res = await iniciarSesion(correo, clave);
      setCargando(false);
      if (res.rol === "administrador") {
        toast.success(`Bienvenido(a) Administrador ${res.perfil?.nombre || ""}`);
        navigate({ to: "/admin" });
      } else {
        toast.success(`¡Bienvenido(a) de vuelta, ${res.perfil?.nombre || "adoptante"}!`);
        navigate({ to: "/cuenta" });
      }
    } catch (err: unknown) {
      setCargando(false);
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      console.error("[Login] Error:", msg);
      if (msg.toLowerCase().includes("invalid login credentials")) {
        toast.error("Correo o contraseña incorrectos. Si aún no tienes cuenta, regístrate o usa el acceso demo.");
      } else {
        toast.error(msg);
      }
    }
  }

  function ingresarDemo(rol: "adoptante" | "administrador") {
    setRolSimulado(rol);
    toast.success(
      rol === "administrador"
        ? "Sesión iniciada como administrador (Modo Exploración)"
        : "Sesión iniciada como adoptante (Modo Exploración)",
    );
    navigate({ to: rol === "administrador" ? "/admin" : "/cuenta" });
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src={heroPets}
          alt="Perro y gato rescatados por la fundación"
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-coffee/45" />
        <div className="absolute bottom-0 left-0 right-0 p-12 text-cream">
          <p className="font-display text-3xl font-semibold leading-snug">
            Cada inicio de sesión acerca a una mascota a su hogar definitivo.
          </p>
          <p className="mt-3 max-w-md text-sm opacity-90">
            312 adopciones acompañadas y 276 familias que hoy comparten su casa con un rescatado.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream/50 px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <PawPrint className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-semibold">
              Bigotes <span className="text-coffee-light">y Colitas</span>
            </span>
          </Link>

          <h1 className="font-display text-3xl font-semibold sm:text-4xl">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa para revisar tus solicitudes, mensajes y donaciones.
          </p>

          <Card className="mt-8 border-border/80 shadow-none">
            <CardContent className="p-6">
              <form className="space-y-4" onSubmit={manejarLogin}>
                <div>
                  <Label htmlFor="correo" className="mb-1.5 block">
                    Correo electrónico
                  </Label>
                  <Input
                    id="correo"
                    type="email"
                    autoComplete="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    aria-invalid={Boolean(errores.correo)}
                  />
                  {errores.correo && (
                    <p className="mt-1.5 text-xs text-destructive">{errores.correo}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="clave" className="mb-1.5 block">
                    Contraseña
                  </Label>
                  <div className="relative">
                    <Input
                      id="clave"
                      type={ver ? "text" : "password"}
                      autoComplete="current-password"
                      value={clave}
                      onChange={(e) => setClave(e.target.value)}
                      aria-invalid={Boolean(errores.clave)}
                      className="pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setVer((v) => !v)}
                      aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {ver ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errores.clave && (
                    <p className="mt-1.5 text-xs text-destructive">{errores.clave}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox defaultChecked /> Recordarme
                  </label>
                  <button
                    type="button"
                    onClick={() => setRecuperar(true)}
                    className="text-sm font-medium text-coffee-light hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <Button type="submit" className="w-full" disabled={cargando}>
                  {cargando && <Loader2 className="mr-2 size-4 animate-spin" />}
                  Entrar
                </Button>
              </form>

              <div className="my-5 flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  o explora la demo
                </span>
                <Separator className="flex-1" />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" type="button" onClick={() => ingresarDemo("adoptante")}>
                  Entrar como adoptante (Demo)
                </Button>
                <Button variant="outline" type="button" onClick={() => ingresarDemo("administrador")}>
                  Entrar como admin (Demo)
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿Aún no tienes cuenta?{" "}
            <Link to="/auth/registro" className="font-medium text-coffee-light hover:underline">
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>

      <Dialog open={recuperar} onOpenChange={setRecuperar}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recuperar contraseña</DialogTitle>
            <DialogDescription>
              Te enviaremos un enlace para crear una contraseña nueva.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="correo-recuperar" className="mb-1.5 block">
              Correo electrónico
            </Label>
            <Input id="correo-recuperar" type="email" placeholder="tucorreo@correo.com" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecuperar(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setRecuperar(false);
                toast.success("Enlace de recuperación enviado (simulado)");
              }}
            >
              Enviar enlace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
