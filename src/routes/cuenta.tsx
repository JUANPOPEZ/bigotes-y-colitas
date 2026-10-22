import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  FileText,
  HandHeart,
  LayoutDashboard,
  LogIn,
  MessageSquare,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usuarioDemo } from "@/lib/mock-session";
import { useAuth } from "@/lib/auth";
import { notificaciones } from "@/mock";

export const Route = createFileRoute("/cuenta")({
  component: CuentaLayout,
});

const enlaces = [
  { to: "/cuenta", label: "Resumen", icono: LayoutDashboard, exacto: true },
  { to: "/cuenta/solicitudes", label: "Mis solicitudes", icono: FileText, exacto: false },
  { to: "/cuenta/donaciones", label: "Mis donaciones", icono: HandHeart, exacto: false },
  { to: "/cuenta/pedidos", label: "Mis pedidos", icono: ShoppingBag, exacto: false },
  { to: "/cuenta/mensajes", label: "Mensajes", icono: MessageSquare, exacto: false },
  { to: "/cuenta/notificaciones", label: "Notificaciones", icono: Bell, exacto: false },
  { to: "/cuenta/perfil", label: "Mi perfil", icono: UserRound, exacto: false },
] as const;

function CuentaLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sinLeer = notificaciones.filter((n) => !n.leida).length;
  const { user, perfil, rol, autenticado, cargando } = useAuth();

  const nombre =
    perfil?.nombre ||
    user?.user_metadata?.nombre ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    usuarioDemo.nombre;
  const correo = perfil?.correo || user?.email || usuarioDemo.correo;
  const iniciales =
    nombre
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "BYC";

  if (cargando) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Comprobando sesión de usuario...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!autenticado) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4 rounded-2xl border border-border bg-cream/50 p-8 shadow-sm">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <LogIn className="size-7" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">
              Identificación requerida
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground">Inicio de sesión recomendado</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para acceder al panel de tu cuenta, consultar tus solicitudes de adopción, mensajes y gestionar tu perfil, es indispensable iniciar sesión con tu cuenta.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="default">
                <Link to="/auth/login" search={{ redirect: pathname }}>
                  <LogIn className="mr-1.5 size-4" /> Iniciar sesión
                </Link>
              </Button>
              <Button asChild variant="outline" size="default">
                <Link to="/auth/registro" search={{ redirect: pathname }}>
                  Crear cuenta
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/80 bg-cream/50 p-5">
              <div className="flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {iniciales}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{nombre}</p>
                  <p className="truncate text-xs text-muted-foreground">{correo}</p>
                  <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                    {rol === "administrador" ? "Administrador" : "Adoptante"}
                  </Badge>
                </div>
              </div>
            </div>

            <nav aria-label="Mi cuenta" className="mt-4 flex gap-1 overflow-x-auto lg:flex-col">
              {enlaces.map((e) => {
                const activo = e.exacto ? pathname === e.to : pathname.startsWith(e.to);
                return (
                  <Link
                    key={e.to}
                    to={e.to}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                      activo
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <e.icono className="size-4" aria-hidden="true" />
                    {e.label}
                    {e.to === "/cuenta/notificaciones" && sinLeer > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {sinLeer}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
