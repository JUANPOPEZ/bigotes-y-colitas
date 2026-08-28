import { Link } from "@tanstack/react-router";
import { Heart, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EstadoBadge } from "@/components/shared/estado-badge";
import type { Mascota } from "@/types";

export function PetCard({ mascota }: { mascota: Mascota }) {
  const [favorito, setFavorito] = useState(false);

  return (
    <Card className="hover-lift group overflow-hidden border-border/80 p-0 shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={mascota.galeria[0]}
          alt={`${mascota.nombre}, ${mascota.especie.toLowerCase()} ${mascota.raza}`}
          loading="lazy"
          width={800}
          height={600}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <EstadoBadge estado={mascota.estado} />
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label={favorito ? `Quitar a ${mascota.nombre} de favoritos` : `Agregar a ${mascota.nombre} a favoritos`}
          aria-pressed={favorito}
          onClick={() => {
            setFavorito((v) => !v);
            toast.success(favorito ? "Quitado de favoritos" : "Agregado a favoritos");
          }}
          className="absolute right-3 top-3 rounded-full bg-background/90"
        >
          <Heart className={`size-4 ${favorito ? "fill-destructive text-destructive" : ""}`} />
        </Button>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold">{mascota.nombre}</h3>
          <span className="text-sm text-muted-foreground">{mascota.edad}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{mascota.raza}</Badge>
          <Badge variant="secondary">{mascota.sexo}</Badge>
          <Badge variant="secondary">{mascota.tamano}</Badge>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" aria-hidden="true" /> {mascota.ciudad}
        </p>
        <Button asChild className="w-full">
          <Link to="/mascotas/$id" params={{ id: mascota.id }}>
            Ver perfil
          </Link>
        </Button>
      </div>
    </Card>
  );
}
