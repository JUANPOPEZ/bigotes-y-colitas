import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mapa: Record<string, string> = {
  Disponible: "bg-success text-success-foreground border-transparent",
  Aprobada: "bg-success text-success-foreground border-transparent",
  Recibida: "bg-success text-success-foreground border-transparent",
  Entregado: "bg-success text-success-foreground border-transparent",
  Atendida: "bg-success text-success-foreground border-transparent",
  Activo: "bg-success text-success-foreground border-transparent",
  "En proceso": "bg-warning text-warning-foreground border-transparent",
  Pendiente: "bg-warning text-warning-foreground border-transparent",
  Preparando: "bg-warning text-warning-foreground border-transparent",
  "Verificación en campo": "bg-warning text-warning-foreground border-transparent",
  Descartada: "bg-destructive/12 text-destructive border-destructive/30",
  "En revisión": "bg-accent text-accent-foreground border-transparent",
  Entrevista: "bg-accent text-accent-foreground border-transparent",
  Visita: "bg-accent text-accent-foreground border-transparent",
  "En tránsito": "bg-accent text-accent-foreground border-transparent",
  Enviado: "bg-accent text-accent-foreground border-transparent",
  "En tratamiento": "bg-accent text-accent-foreground border-transparent",
  Adoptado: "bg-secondary text-secondary-foreground border-transparent",
  Cerrada: "bg-secondary text-secondary-foreground border-transparent",
  Inactivo: "bg-secondary text-secondary-foreground border-transparent",
  Rechazada: "bg-destructive/12 text-destructive border-destructive/30",
  Cancelado: "bg-destructive/12 text-destructive border-destructive/30",
};

export function EstadoBadge({ estado, className }: { estado: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", mapa[estado] ?? "", className)}>
      {estado}
    </Badge>
  );
}
