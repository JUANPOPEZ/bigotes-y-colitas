import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, PawPrint } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { obtenerPerfil } from "@/lib/auth";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Verificando cuenta — Bigotes y Colitas" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaginaCallback,
});

function PaginaCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let activo = true;

    async function procesarRetorno() {
      try {
        // Supabase procesa automáticamente los tokens o código en el hash/query params
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (session?.user) {
          const perfil = await obtenerPerfil(session.user.id);
          const rol =
            perfil?.rol === "administrador"
              ? "administrador"
              : perfil?.rol === "adoptante"
                ? "adoptante"
                : (session.user.user_metadata?.rol as string) || "adoptante";

          if (!activo) return;

          if (rol === "administrador") {
            toast.success(`Bienvenido(a) Administrador ${perfil?.nombre || ""}`);
            navigate({ to: "/admin" });
          } else {
            toast.success(`¡Bienvenido(a), ${perfil?.nombre || "adoptante"}!`);
            navigate({ to: "/cuenta" });
          }
          return;
        }

        // Si el cliente aún está intercambiando el token, escuchar el evento
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, nuevaSesion) => {
          if (nuevaSesion?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
            subscription.unsubscribe();
            const perfil = await obtenerPerfil(nuevaSesion.user.id);
            const rol =
              perfil?.rol === "administrador"
                ? "administrador"
                : perfil?.rol === "adoptante"
                  ? "adoptante"
                  : (nuevaSesion.user.user_metadata?.rol as string) || "adoptante";

            if (!activo) return;

            if (rol === "administrador") {
              toast.success(`Bienvenido(a) Administrador ${perfil?.nombre || ""}`);
              navigate({ to: "/admin" });
            } else {
              toast.success(`¡Bienvenido(a), ${perfil?.nombre || "adoptante"}!`);
              navigate({ to: "/cuenta" });
            }
          }
        });

        const temporizador = setTimeout(() => {
          if (activo) {
            subscription.unsubscribe();
            toast.error("No se pudo autenticar la sesión con Google.");
            navigate({ to: "/auth/login" });
          }
        }, 8000);

        return () => {
          clearTimeout(temporizador);
          subscription.unsubscribe();
        };
      } catch (err: unknown) {
        if (!activo) return;
        const msg = err instanceof Error ? err.message : "Error al procesar la autenticación de Google";
        console.error("[Callback OAuth] Error:", msg);
        toast.error(msg);
        navigate({ to: "/auth/login" });
      }
    }

    procesarRetorno();

    return () => {
      activo = false;
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream/50 px-4 py-12">
      <Card className="w-full max-w-md border-border/80 shadow-none">
        <CardContent className="flex flex-col items-center p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <PawPrint className="size-7" aria-hidden="true" />
          </div>

          <h1 className="mt-6 font-display text-2xl font-semibold">
            Verificando tu cuenta
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Estamos sincronizando tu perfil de Google con Bigotes y Colitas...
          </p>

          <div className="mt-6 flex items-center gap-2.5 text-sm text-coffee-light">
            <Loader2 className="size-5 animate-spin" />
            <span className="font-medium">Cargando tu panel...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
