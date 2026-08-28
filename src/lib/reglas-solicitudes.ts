import { solicitudes } from "@/mock";
import type { EstadoSolicitud, Solicitud } from "@/types";

/**
 * Reglas de negocio de las solicitudes de adopción (validadas en la interfaz).
 * Al conectar el backend estas mismas reglas deben replicarse en la API.
 */

/** Máximo de solicitudes en proceso que puede tener un usuario. */
export const MAX_SOLICITUDES_ACTIVAS = 3;

/**
 * Estados que se consideran "en proceso" y cuentan para el límite.
 * Una solicitud Aprobada (igual que Entregado o Rechazada) ya salió del
 * proceso de revisión, por lo que libera un cupo para tramitar otra.
 */
export const ESTADOS_EN_TRAMITE: EstadoSolicitud[] = [
  "Pendiente",
  "En revisión",
  "Entrevista",
  "Visita",
];

export function esEnTramite(estado: EstadoSolicitud) {
  return ESTADOS_EN_TRAMITE.includes(estado);
}

export function solicitudesActivasDe(correo: string, lista: Solicitud[] = solicitudes) {
  return lista.filter((s) => s.correo === correo && esEnTramite(s.estado));
}

export function puedeCrearSolicitud(correo: string, lista: Solicitud[] = solicitudes) {
  const activas = solicitudesActivasDe(correo, lista).length;
  return { activas, restantes: Math.max(0, MAX_SOLICITUDES_ACTIVAS - activas), permitido: activas < MAX_SOLICITUDES_ACTIVAS };
}
