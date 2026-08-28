import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Heart, LogIn, Menu, MessageSquare, PawPrint, Search } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRolSimulado, usuarioDemo } from "@/lib/mock-session";
import { notificaciones } from "@/mock";

const enlaces = [
  { label: "Inicio", to: "/" },
  { label: "Mascotas", to: "/mascotas" },
  { label: "Adopta", to: "/adopta" },
  { label: "Donaciones", to: "/donaciones" },
  { label: "Tienda", to: "/tienda" },
  { label: "Eventos", to: "/eventos" },
  { label: "Denuncias", to: "/denuncias" },
  { label: "Nosotros", to: "/nosotros" },
  { label: "Contacto", to: "/contacto" },
] as const;

export function Navbar() {
  const { autenticado, rol, setRol } = useRolSimulado();
  const navigate = useNavigate();

  function cerrarSesion() {
    setRol("visitante");
    navigate({ to: "/" });
  }

  const [abierto, setAbierto] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const sinLeer = notificaciones.filter((n) => !n.leida).length;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Bigotes y Colitas, inicio">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <PawPrint className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display text-lg font-semibold leading-tight">
            Bigotes <span className="text-coffee-light">y Colitas</span>
          </span>
        </Link>

        <nav aria-label="Principal" className="ml-4 hidden flex-1 items-center gap-1 xl:flex">
          {enlaces.map((e) => {
            const activo = e.to === "/" ? pathname === "/" : pathname.startsWith(e.to);
            return (
              <Link
                key={e.to}
                to={e.to}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  activo
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {e.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <Link to="/mascotas" aria-label="Buscar mascotas">
              <Search className="size-5" />
            </Link>
          </Button>

          {autenticado ? (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones">
                    <Bell className="size-5" />
                    {sinLeer > 0 && (
                      <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-mustard" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between px-4 py-3">
                    <p className="text-sm font-semibold">Notificaciones</p>
                    <Badge variant="secondary">{sinLeer} nuevas</Badge>
                  </div>
                  <ScrollArea className="h-72 border-t">
                    {notificaciones.map((n) => (
                      <div key={n.id} className="border-b px-4 py-3 last:border-0">
                        <p className="text-sm font-medium">{n.titulo}</p>
                        <p className="text-xs text-muted-foreground">{n.detalle}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">{n.fecha}</p>
                      </div>
                    ))}
                  </ScrollArea>
                  <div className="p-2">
                    <Button variant="ghost" className="w-full" asChild>
                      <Link to="/cuenta/notificaciones">Ver todas</Link>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" asChild aria-label="Mensajes">
                <Link to="/cuenta/mensajes">
                  <MessageSquare className="size-5" />
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        {usuarioDemo.iniciales}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium">{usuarioDemo.nombre}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      Rol: {rol === "administrador" ? "Administrador" : "Adoptante"}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/cuenta">Mi panel</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/cuenta/perfil">Mi perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favoritos">Favoritos</Link>
                  </DropdownMenuItem>
                  {rol === "administrador" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">Panel administrador</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => cerrarSesion()}>
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button variant="ghost" asChild>
                <Link to="/auth/login">
                  <LogIn className="mr-1.5 size-4" /> Iniciar sesión
                </Link>
              </Button>
              <Button asChild>
                <Link to="/auth/registro">Registrarse</Link>
              </Button>
            </div>
          )}

          <Sheet open={abierto} onOpenChange={setAbierto}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="xl:hidden" aria-label="Abrir menú">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetTitle className="px-1 py-2 font-display">Menú</SheetTitle>
              <nav className="mt-2 flex flex-col gap-1" aria-label="Menú móvil">
                {enlaces.map((e) => (
                  <Link
                    key={e.to}
                    to={e.to}
                    onClick={() => setAbierto(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                  >
                    {e.label}
                  </Link>
                ))}
                <Link
                  to="/favoritos"
                  onClick={() => setAbierto(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <Heart className="mr-2 inline size-4" /> Favoritos
                </Link>
                {autenticado ? (
                  <div className="mt-3 grid gap-1 border-t pt-3">
                    <p className="px-3 pb-1 text-xs text-muted-foreground">
                      {usuarioDemo.nombre} · {rol === "administrador" ? "Administrador" : "Adoptante"}
                    </p>
                    <Link
                      to="/cuenta"
                      onClick={() => setAbierto(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      Mi panel
                    </Link>
                    <Link
                      to="/cuenta/perfil"
                      onClick={() => setAbierto(false)}
                      className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                    >
                      Mi perfil
                    </Link>
                    {rol === "administrador" && (
                      <Link
                        to="/admin"
                        onClick={() => setAbierto(false)}
                        className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
                      >
                        Panel administrador
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        setAbierto(false);
                        cerrarSesion();
                      }}
                    >
                      Cerrar sesión
                    </Button>
                  </div>
                ) : (
                  <div className="mt-3 grid gap-2">
                    <Button variant="outline" asChild onClick={() => setAbierto(false)}>
                      <Link to="/auth/login">Iniciar sesión</Link>
                    </Button>
                    <Button asChild onClick={() => setAbierto(false)}>
                      <Link to="/auth/registro">Registrarse</Link>
                    </Button>
                  </div>
                )}

              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
