import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Paperclip, Search, Send } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { conversaciones } from "@/mock";
import type { Mensaje } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cuenta/mensajes")({
  head: () => ({
    meta: [
      { title: "Mensajes — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Conversa con el equipo de adopciones, voluntariado y tienda solidaria de Bigotes y Colitas.",
      },
      { property: "og:title", content: "Mensajes — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Centro de mensajes de tu cuenta en la fundación.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const [activaId, setActivaId] = useState(conversaciones[0]!.id);
  const [busqueda, setBusqueda] = useState("");
  const [borrador, setBorrador] = useState("");
  const [extras, setExtras] = useState<Record<string, Mensaje[]>>({});

  const lista = conversaciones.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );
  const activa = conversaciones.find((c) => c.id === activaId)!;
  const mensajes = [...activa.mensajes, ...(extras[activa.id] ?? [])];

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!borrador.trim()) return;
    const nuevo: Mensaje = {
      id: `local-${Date.now()}`,
      autor: "yo",
      texto: borrador.trim(),
      hora: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
    };
    setExtras((prev) => ({ ...prev, [activa.id]: [...(prev[activa.id] ?? []), nuevo] }));
    setBorrador("");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Mensajes</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Conversaciones con el equipo de la fundación.
        </p>
      </div>

      <Card className="grid overflow-hidden border-border/80 shadow-none md:grid-cols-[280px_1fr]">
        <div className="border-b md:border-b-0 md:border-r">
          <div className="relative p-3">
            <Search
              className="pointer-events-none absolute left-6 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar conversación"
              className="pl-9"
              aria-label="Buscar conversación"
            />
          </div>
          <ScrollArea className="h-72 md:h-[26rem]">
            {lista.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActivaId(c.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-0",
                  c.id === activaId ? "bg-secondary/60" : "hover:bg-muted",
                )}
              >
                <Avatar className="size-9">
                  <AvatarImage src={c.avatar} alt="" />
                  <AvatarFallback>{c.nombre.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.nombre}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.ultimo}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] text-muted-foreground">{c.hora}</span>
                  {c.noLeidos > 0 && <Badge variant="secondary">{c.noLeidos}</Badge>}
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>

        <div className="flex min-h-[24rem] flex-col">
          <div className="flex items-center gap-3 border-b px-4 py-3">
            <Avatar className="size-9">
              <AvatarImage src={activa.avatar} alt="" />
              <AvatarFallback>{activa.nombre.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{activa.nombre}</p>
              <p className="text-xs text-muted-foreground">Normalmente responde en 2 horas</p>
            </div>
          </div>

          <ScrollArea className="flex-1 px-4 py-5">
            <div className="space-y-3">
              {mensajes.map((m) => (
                <div
                  key={m.id}
                  className={cn("flex", m.autor === "yo" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                      m.autor === "yo"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    <p>{m.texto}</p>
                    {m.adjunto && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs opacity-80">
                        <Paperclip className="size-3.5" aria-hidden="true" /> {m.adjunto}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] opacity-70">{m.hora}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={enviar} className="flex items-center gap-2 border-t p-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Adjuntar archivo"
              onClick={() => toast.info("Adjuntar archivos estará disponible con el backend")}
            >
              <Paperclip className="size-4" />
            </Button>
            <Input
              value={borrador}
              onChange={(e) => setBorrador(e.target.value)}
              placeholder="Escribe un mensaje"
              aria-label="Mensaje"
            />
            <Button type="submit" size="icon" aria-label="Enviar mensaje">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
