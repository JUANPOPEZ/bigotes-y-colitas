import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  FileText,
  HandHeart,
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usuarioDemo } from "@/lib/mock-session";
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
                    {usuarioDemo.iniciales}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{usuarioDemo.nombre}</p>
                  <p className="truncate text-xs text-muted-foreground">{usuarioDemo.correo}</p>
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
