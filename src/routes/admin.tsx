import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  FileText,
  HandHeart,
  LayoutDashboard,
  Megaphone,
  PawPrint,
  ShieldAlert,
  ShoppingBag,
  Users,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { useRolSimulado } from "@/lib/mock-session";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

const enlaces = [
  { to: "/admin", label: "Dashboard", icono: LayoutDashboard, exacto: true },
  { to: "/admin/mascotas", label: "Mascotas", icono: PawPrint, exacto: false },
  { to: "/admin/solicitudes", label: "Solicitudes", icono: FileText, exacto: false },
  { to: "/admin/usuarios", label: "Usuarios", icono: Users, exacto: false },
  { to: "/admin/donaciones", label: "Donaciones", icono: HandHeart, exacto: false },
  { to: "/admin/productos", label: "Productos", icono: ShoppingBag, exacto: false },
  { to: "/admin/pedidos", label: "Pedidos", icono: Megaphone, exacto: false },
  { to: "/admin/eventos", label: "Eventos", icono: CalendarDays, exacto: false },
  { to: "/admin/denuncias", label: "Denuncias", icono: ShieldAlert, exacto: false },
  { to: "/admin/reportes", label: "Reportes", icono: BarChart3, exacto: false },
] as const;

function AdminLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { rol, autenticado, perfil } = useRolSimulado();

  if (rol !== "administrador") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4 rounded-2xl border border-border bg-cream/50 p-8 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-destructive">Acceso Restringido</h2>
            <p className="text-sm text-muted-foreground">
              {autenticado
                ? `Tu cuenta (${perfil?.correo || "actual"}) tiene rol de ${rol}. Esta sección de administración es exclusiva para el equipo de la fundación.`
                : "Debes iniciar sesión con una cuenta con permisos de administrador para acceder a esta sección."}
            </p>
            <div className="pt-2">
              <Link
                to={autenticado ? "/cuenta" : "/auth/login"}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                {autenticado ? "Ir a Mi Cuenta" : "Iniciar sesión como Administrador"}
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[248px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border/80 bg-cream/50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">
                Administración
              </p>
              <p className="mt-1.5 text-sm font-semibold">{perfil?.nombre || "Bigotes y Colitas"}</p>
              <Badge variant="secondary" className="mt-2">
                Rol: Administrador
              </Badge>
            </div>

            <nav aria-label="Administración" className="mt-4 flex gap-1 overflow-x-auto lg:flex-col">
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
