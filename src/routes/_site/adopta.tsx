import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  Loader2,
  LogIn,
  PawPrint,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { MAX_SOLICITUDES_ACTIVAS } from "@/lib/reglas-solicitudes";
import { obtenerMascotas } from "@/lib/services/mascotas";
import {
  registrarSolicitudAdopcion,
  verificarLimiteSolicitudesUsuario,
} from "@/lib/services/solicitudes";
import type { Mascota } from "@/types";

export const Route = createFileRoute("/_site/adopta")({
  validateSearch: (search: Record<string, unknown>): { mascota?: string } => ({
    mascota: typeof search.mascota === "string" ? search.mascota : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Solicitud de adopción — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Completa el formulario de adopción responsable en cuatro pasos: mascota, datos personales, hogar y compromiso.",
      },
      { property: "og:title", content: "Solicitud de adopción — Bigotes y Colitas" },
      { property: "og:description", content: "Formulario de adopción responsable en cuatro pasos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

const pasos = [
  { titulo: "Mascota", icono: PawPrint },
  { titulo: "Tus datos", icono: User },
  { titulo: "Tu hogar", icono: Home },
  { titulo: "Compromiso", icono: FileText },
];

function Pagina() {
  const navigate = useNavigate();
  const { mascota: mascotaInicial } = Route.useSearch();
  const { user, perfil, autenticado, cargando: cargandoAuth } = useAuth();

  const [listaMascotas, setListaMascotas] = useState<Mascota[]>([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(true);

  // Estados del límite de solicitudes
  const [limiteInfo, setLimiteInfo] = useState<{
    activas: number;
    restantes: number;
    permitido: boolean;
  }>({
    activas: 0,
    restantes: MAX_SOLICITUDES_ACTIVAS,
    permitido: true,
  });
  const [verificandoLimite, setVerificandoLimite] = useState(false);

  // Navegación de pasos
  const [paso, setPaso] = useState(0);

  // Datos del formulario
  const [mascotaId, setMascotaId] = useState<string>(mascotaInicial ?? "");
  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("Bogotá");
  const [rangoEdad, setRangoEdad] = useState("26-40");
  const [direccion, setDireccion] = useState("");

  const [tipoVivienda, setTipoVivienda] = useState("Apartamento");
  const [propiedad, setPropiedad] = useState("Propia");
  const [personas, setPersonas] = useState("1");
  const [ninos, setNinos] = useState("0");
  const [otrasMascotas, setOtrasMascotas] = useState("");
  const [tiempoSola, setTiempoSola] = useState("");
  const [experienciaPrevia, setExperienciaPrevia] = useState("");
  const [motivo, setMotivo] = useState("");

  const [aceptaCompromiso, setAceptaCompromiso] = useState(false);

  // Control de errores de validación
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Restricción de campos exclusivamente numéricos enteros (solo dígitos 0-9)
  const bloquearTeclasNoNumericas = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      [
        "Backspace",
        "Tab",
        "Enter",
        "Delete",
        "Escape",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(e.key)
    ) {
      return;
    }
    if (e.ctrlKey || e.metaKey) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const manejarPegadoSoloDigitos = (
    e: React.ClipboardEvent<HTMLInputElement>,
    setter: (valor: string) => void,
    campoError?: string
  ) => {
    e.preventDefault();
    const textoPegado = e.clipboardData.getData("text");
    const soloDigitos = textoPegado.replace(/\D/g, "");
    if (!soloDigitos) return;

    const input = e.currentTarget;
    const inicio = input.selectionStart ?? 0;
    const fin = input.selectionEnd ?? 0;
    const valorActual = input.value;
    const nuevoValor = valorActual.slice(0, inicio) + soloDigitos + valorActual.slice(fin);

    setter(nuevoValor);
    if (campoError) {
      setErrores((prev) => ({ ...prev, [campoError]: "" }));
    }
  };

  // Estados de envío y resultado
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [radicadoGenerado, setRadicadoGenerado] = useState("");

  // Cargar catálogo de mascotas
  useEffect(() => {
    let montado = true;
    setCargandoMascotas(true);

    obtenerMascotas()
      .then((datos) => {
        if (!montado) return;
        setListaMascotas(datos);
        setCargandoMascotas(false);

        // Preselección si vino parámetro en URL
        if (mascotaInicial) {
          const elegida = datos.find((m) => m.id === mascotaInicial);
          if (elegida && elegida.estado === "Disponible") {
            setMascotaId(elegida.id);
          } else {
            // Si la mascota inicial no está disponible, seleccionar la primera disponible
            const primeraDisponible = datos.find((m) => m.estado === "Disponible");
            if (primeraDisponible) {
              setMascotaId(primeraDisponible.id);
            }
          }
        } else {
          const primeraDisponible = datos.find((m) => m.estado === "Disponible");
          if (primeraDisponible) {
            setMascotaId(primeraDisponible.id);
          }
        }
      })
      .catch((err) => {
        console.error("[Adopta] Error cargando mascotas:", err);
        if (montado) setCargandoMascotas(false);
      });

    return () => {
      montado = false;
    };
  }, [mascotaInicial]);

  // Autocompletar datos del perfil autenticado
  useEffect(() => {
    if (perfil) {
      if (!nombre && perfil.nombre) setNombre(perfil.nombre);
      if (!correo && perfil.correo) setCorreo(perfil.correo);
      if (!telefono && perfil.telefono) setTelefono(perfil.telefono.replace(/\D/g, ""));
      if (ciudad === "Bogotá" && perfil.ciudad) setCiudad(perfil.ciudad);
    } else if (user) {
      if (!nombre && user.user_metadata?.nombre) setNombre(user.user_metadata.nombre);
      if (!correo && user.email) setCorreo(user.email);
      if (!telefono && user.user_metadata?.telefono) {
        setTelefono(String(user.user_metadata.telefono).replace(/\D/g, ""));
      }
      if (ciudad === "Bogotá" && user.user_metadata?.ciudad) setCiudad(user.user_metadata.ciudad);
    }
  }, [perfil, user]);

  // Verificar el límite de 3 solicitudes activas con Supabase
  useEffect(() => {
    let montado = true;
    const usuarioId = user?.id;
    const correoUsuario = user?.email || correo;

    if (!usuarioId && !correoUsuario) {
      return;
    }

    setVerificandoLimite(true);
    verificarLimiteSolicitudesUsuario(usuarioId, correoUsuario)
      .then((resultado) => {
        if (montado) {
          setLimiteInfo(resultado);
          setVerificandoLimite(false);
        }
      })
      .catch((err) => {
        console.warn("[Adopta] Error verificando límite:", err);
        if (montado) setVerificandoLimite(false);
      });

    return () => {
      montado = false;
    };
  }, [user?.id, user?.email, correo]);

  // Filtrar exclusivamente mascotas disponibles
  const disponibles = listaMascotas.filter((m) => m.estado === "Disponible");
  const elegida = listaMascotas.find((m) => m.id === mascotaId);
  const seleccionInvalida = elegida && elegida.estado !== "Disponible";

  // Validaciones por paso
  function validarPaso0(): boolean {
    const nuevosErrores: Record<string, string> = {};
    if (!mascotaId) {
      nuevosErrores.mascota = "Debes seleccionar una mascota para la solicitud.";
    } else if (seleccionInvalida) {
      nuevosErrores.mascota = `"${elegida.nombre}" no está disponible para adopción (estado: ${elegida.estado}). Elige una mascota disponible.`;
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      toast.error(nuevosErrores.mascota || "Selecciona una mascota disponible.");
      return false;
    }
    return true;
  }

  function validarPaso1(): boolean {
    const nuevosErrores: Record<string, string> = {};

    if (!nombre.trim() || nombre.trim().length < 3) {
      nuevosErrores.nombre = "Ingresa tu nombre completo (mínimo 3 caracteres).";
    }

    if (!documento.trim() || documento.trim().length < 5 || !/^\d+$/.test(documento.trim())) {
      nuevosErrores.documento = "Ingresa un número de documento de identidad válido.";
    }

    if (!correo.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo.trim())) {
      nuevosErrores.correo = "Ingresa un correo electrónico válido.";
    }

    if (!telefono.trim() || telefono.trim().length < 7 || !/^\d+$/.test(telefono.trim())) {
      nuevosErrores.telefono = "Ingresa un número de teléfono de contacto (al menos 7 dígitos).";
    }

    if (!ciudad.trim()) {
      nuevosErrores.ciudad = "Ingresa tu ciudad de residencia.";
    }

    if (!direccion.trim() || direccion.trim().length < 5) {
      nuevosErrores.direccion = "Ingresa tu dirección completa de residencia.";
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      toast.error("Por favor completa todos los campos obligatorios de tus datos personales.");
      return false;
    }
    return true;
  }

  function validarPaso2(): boolean {
    const nuevosErrores: Record<string, string> = {};

    if (!tipoVivienda) {
      nuevosErrores.tipoVivienda = "Selecciona el tipo de vivienda.";
    }

    if (!propiedad) {
      nuevosErrores.propiedad = "Indica si la vivienda es propia o arrendada.";
    }

    const nPersonas = Number(personas);
    if (isNaN(nPersonas) || nPersonas < 1) {
      nuevosErrores.personas = "Indica cuántas personas habitan en el hogar (mínimo 1).";
    }

    if (!tiempoSola.trim() || tiempoSola.trim().length < 3) {
      nuevosErrores.tiempoSola = "Indica cuánto tiempo estimado pasará sola la mascota al día.";
    }

    if (!experienciaPrevia.trim() || experienciaPrevia.trim().length < 4) {
      nuevosErrores.experienciaPrevia = "Cuéntanos si tienes experiencia previa con mascotas.";
    }

    if (!motivo.trim() || motivo.trim().length < 10) {
      nuevosErrores.motivo = "Explica con más detalle por qué deseas adoptar a esta mascota (mínimo 10 caracteres).";
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      toast.error("Por favor completa los campos obligatorios sobre las condiciones de tu hogar.");
      return false;
    }
    return true;
  }

  function validarPaso3(): boolean {
    const nuevosErrores: Record<string, string> = {};

    if (!aceptaCompromiso) {
      nuevosErrores.aceptaCompromiso = "Debes aceptar el compromiso de adopción responsable para continuar.";
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      toast.error("Debes aceptar el compromiso de adopción responsable.");
      return false;
    }
    return true;
  }

  function avanzarPaso() {
    if (paso === 0 && !validarPaso0()) return;
    if (paso === 1 && !validarPaso1()) return;
    if (paso === 2 && !validarPaso2()) return;

    setErrores({});
    setPaso((p) => Math.min(pasos.length - 1, p + 1));
    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  function retrocederPaso() {
    setErrores({});
    setPaso((p) => Math.max(0, p - 1));
    window.scrollTo({ top: 120, behavior: "smooth" });
  }

  // Manejo de envío final de la solicitud
  async function manejarEnvio() {
    // Validar todos los pasos en cascada
    if (!validarPaso0()) {
      setPaso(0);
      return;
    }
    if (!validarPaso1()) {
      setPaso(1);
      return;
    }
    if (!validarPaso2()) {
      setPaso(2);
      return;
    }
    if (!validarPaso3()) {
      return;
    }

    // Comprobar límite de 3 solicitudes activas una vez más
    if (!limiteInfo.permitido) {
      toast.error(
        "Ya cuentas con 3 solicitudes activas en proceso. Debes esperar la resolución de alguna antes de radicar otra."
      );
      return;
    }

    setEnviando(true);

    try {
      const resultado = await registrarSolicitudAdopcion({
        mascotaId,
        usuarioId: user?.id,
        solicitante: nombre,
        documento,
        correo,
        telefono,
        ciudad,
        direccion,
        rangoEdad,
        tipoVivienda,
        propiedad,
        personas: Number(personas) || 1,
        ninos: Number(ninos) || 0,
        otrasMascotas,
        tiempoSola,
        experienciaPrevia,
        motivo,
        aceptaCompromiso,
      });

      setRadicadoGenerado(resultado.radicado);
      setEnviado(true);
      setEnviando(false);
      toast.success("¡Solicitud de adopción radicada exitosamente!");
      window.scrollTo({ top: 100, behavior: "smooth" });
    } catch (err: unknown) {
      setEnviando(false);
      const mensaje = err instanceof Error ? err.message : "Error al registrar la solicitud.";
      console.error("[Adopta] Error en radicación:", err);
      toast.error(mensaje);

      // Si el error fue por límite de solicitudes, actualizar estado de límite
      if (mensaje.includes("solicitudes activas") || mensaje.includes("límite")) {
        setLimiteInfo((prev) => ({ ...prev, activas: 3, restantes: 0, permitido: false }));
      }
    }
  }

  // 1. Pantalla de confirmación de solicitud enviada (Criterio 8)
  if (enviado) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success text-success-foreground shadow-sm">
          <CheckCircle2 className="size-9" aria-hidden="true" />
        </span>

        <h1 className="mt-6 font-display text-3xl font-semibold sm:text-4xl">¡Solicitud radicada con éxito!</h1>

        <p className="mt-3 text-base text-muted-foreground">
          Recibimos formalmente tu postulación para adoptar a{" "}
          <strong className="text-foreground">{elegida?.nombre || "la mascota"}</strong>. Tu solicitud
          inicia en estado <Badge variant="secondary">Pendiente</Badge> y nuestro equipo de adopciones
          la revisará en un plazo máximo de 3 días hábiles.
        </p>

        <div className="my-8 rounded-2xl border border-primary/20 bg-accent/30 p-6 text-left shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-wider text-coffee-light">
            Comprobante de radicación
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Número de radicado único:</p>
              <p className="font-mono text-2xl font-bold tracking-tight text-primary">
                {radicadoGenerado}
              </p>
            </div>
            <Badge variant="outline" className="h-7 border-success/40 bg-success/10 text-success">
              Estado: Pendiente
            </Badge>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <p>
              <span className="font-medium text-foreground">Solicitante:</span> {nombre}
            </p>
            <p>
              <span className="font-medium text-foreground">Correo:</span> {correo}
            </p>
            <p>
              <span className="font-medium text-foreground">Mascota:</span> {elegida?.nombre} ({elegida?.especie})
            </p>
            <p>
              <span className="font-medium text-foreground">Ciudad:</span> {ciudad}
            </p>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Guarda este número de radicado. También puedes consultar el avance en tiempo real en la sección de
            solicitudes de tu cuenta.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/cuenta/solicitudes">Ver mis solicitudes</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/mascotas">Explorar más mascotas</Link>
          </Button>
        </div>
      </div>
    );
  }

  // 2. Pantalla bloqueante si el usuario ya tiene 3 solicitudes activas (Criterio 5)
  if (!limiteInfo.permitido) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/12 text-destructive shadow-sm">
          <AlertTriangle className="size-9" aria-hidden="true" />
        </span>

        <h1 className="mt-6 font-display text-3xl font-semibold">Límite de solicitudes alcanzado</h1>

        <p className="mt-4 text-base text-muted-foreground">
          Actualmente tienes <strong className="text-foreground">{limiteInfo.activas}</strong> solicitudes
          activas en proceso de adopción. Para garantizar una gestión responsable y el bienestar de los
          animales, el sistema permite un máximo de{" "}
          <strong className="text-foreground">{MAX_SOLICITUDES_ACTIVAS} solicitudes simultáneas</strong>.
        </p>

        <div className="my-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-muted-foreground">
          Debes esperar a que alguna de tus solicitudes actuales sea resuelta (aprobada o rechazada) antes
          de poder postular una nueva solicitud de adopción.
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/cuenta/solicitudes">Ver mis solicitudes activas</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/mascotas">Volver al catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:py-14">
      {/* Encabezado */}
      <header className="max-w-2xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-coffee-light">
          Adopción responsable
        </p>
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Solicitud de adopción</h1>
        <p className="mt-2 text-muted-foreground">
          Completa este formulario para iniciar formalmente tu proceso. Toda la información será evaluada por
          nuestro equipo de adopciones.
        </p>

        {/* Indicador de límite de solicitudes disponibles */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-cream/60 p-3 text-sm text-muted-foreground">
          <span>
            Tienes <strong className="text-foreground">{limiteInfo.activas}</strong> de{" "}
            {MAX_SOLICITUDES_ACTIVAS} solicitudes activas; puedes radicar{" "}
            <strong className="text-foreground">{limiteInfo.restantes}</strong> más.
          </span>
          <Badge variant="outline" className="text-xs">
            Cupo disponible
          </Badge>
        </div>

        {/* Aviso de autenticación si el visitante no ha iniciado sesión */}
        {!cargandoAuth && !autenticado && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-sm">
            <div className="flex items-center gap-2">
              <LogIn className="size-4 text-primary shrink-0" />
              <span>Para asociar la solicitud a tu cuenta, te recomendamos iniciar sesión.</span>
            </div>
            <Button asChild size="sm" variant="outline" className="h-8 text-xs">
              <Link to="/auth/login">Iniciar sesión</Link>
            </Button>
          </div>
        )}
      </header>

      {/* Progreso en 4 pasos */}
      <ol className="mt-8 grid gap-3 sm:grid-cols-4" aria-label="Progreso de la solicitud">
        {pasos.map((p, i) => (
          <li
            key={p.titulo}
            aria-current={i === paso ? "step" : undefined}
            className={`flex items-center gap-3 rounded-xl border p-3 text-sm transition ${
              i === paso
                ? "border-primary bg-accent/50 font-medium"
                : i < paso
                  ? "border-border bg-card"
                  : "border-border/60 opacity-60"
            }`}
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i < paso
                  ? "bg-success text-success-foreground"
                  : i === paso
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < paso ? <Check className="size-4" aria-hidden="true" /> : i + 1}
            </span>
            <span>{p.titulo}</span>
          </li>
        ))}
      </ol>

      <Progress value={((paso + 1) / pasos.length) * 100} className="mt-4" aria-label="Avance del formulario" />

      {/* Tarjeta del formulario según el paso activo */}
      <Card className="mt-8 border-border/80 shadow-soft">
        <CardContent className="p-6 sm:p-8">
          {/* PASO 0: SELECCIÓN DE MASCOTA */}
          {paso === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">¿A quién deseas adoptar? *</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Solo se pueden solicitar mascotas que se encuentren en estado <strong>Disponible</strong>.
                </p>
              </div>

              {errores.mascota && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errores.mascota}</span>
                </div>
              )}

              {cargandoMascotas ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Cargando mascotas disponibles...</span>
                </div>
              ) : disponibles.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  No hay mascotas con estado "Disponible" en este momento.
                </div>
              ) : (
                <RadioGroup value={mascotaId} onValueChange={setMascotaId} className="grid gap-3 sm:grid-cols-2">
                  {disponibles.map((m) => (
                    <Label
                      key={m.id}
                      htmlFor={`m-${m.id}`}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 font-normal transition hover:border-primary/50 ${
                        mascotaId === m.id ? "border-primary bg-accent/40" : "border-border"
                      }`}
                    >
                      <RadioGroupItem id={`m-${m.id}`} value={m.id} />
                      <img
                        src={m.galeria[0]}
                        alt={m.nombre}
                        className="size-14 rounded-lg object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src =
                            m.especie === "Gato"
                              ? "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200"
                              : "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200";
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate font-medium">{m.nombre}</span>
                          <Badge variant="outline" className="text-[10px] text-success border-success/30">
                            {m.estado}
                          </Badge>
                        </div>
                        <span className="block truncate text-xs text-muted-foreground">
                          {m.especie} · {m.raza} · {m.edad}
                        </span>
                        <span className="block text-xs text-muted-foreground">{m.ciudad}</span>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              )}

              {elegida && (
                <div className="rounded-xl bg-cream/70 p-4 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="mb-2">
                    Mascota seleccionada: {elegida.nombre}
                  </Badge>
                  <p className="line-clamp-2">{elegida.historia}</p>
                </div>
              )}
            </div>
          )}

          {/* PASO 1: DATOS PERSONALES */}
          {paso === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold">Tus datos personales</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Todos los campos marcados con (*) son obligatorios para validar tu solicitud.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ad-nombre">Nombre completo *</Label>
                  <Input
                    id="ad-nombre"
                    placeholder="Ej. Juan Pérez"
                    value={nombre}
                    onChange={(e) => {
                      setNombre(e.target.value);
                      if (errores.nombre) setErrores((prev) => ({ ...prev, nombre: "" }));
                    }}
                    className={errores.nombre ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errores.nombre && <p className="text-xs text-destructive">{errores.nombre}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ad-documento">Documento de identidad (C.C. / C.E.) *</Label>
                  <Input
                    id="ad-documento"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ej. 1020304050"
                    value={documento}
                    onKeyDown={bloquearTeclasNoNumericas}
                    onPaste={(e) => manejarPegadoSoloDigitos(e, setDocumento, "documento")}
                    onChange={(e) => {
                      const soloDigitos = e.target.value.replace(/\D/g, "");
                      setDocumento(soloDigitos);
                      if (errores.documento) setErrores((prev) => ({ ...prev, documento: "" }));
                    }}
                    className={errores.documento ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errores.documento && <p className="text-xs text-destructive">{errores.documento}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ad-correo">Correo electrónico *</Label>
                  <Input
                    id="ad-correo"
                    type="email"
                    placeholder="tu@correo.com"
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value);
                      if (errores.correo) setErrores((prev) => ({ ...prev, correo: "" }));
                    }}
                    className={errores.correo ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errores.correo && <p className="text-xs text-destructive">{errores.correo}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ad-tel">Teléfono de contacto *</Label>
                  <Input
                    id="ad-tel"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Ej. 3001234567"
                    value={telefono}
                    onKeyDown={bloquearTeclasNoNumericas}
                    onPaste={(e) => manejarPegadoSoloDigitos(e, setTelefono, "telefono")}
                    onChange={(e) => {
                      const soloDigitos = e.target.value.replace(/\D/g, "");
                      setTelefono(soloDigitos);
                      if (errores.telefono) setErrores((prev) => ({ ...prev, telefono: "" }));
                    }}
                    className={errores.telefono ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errores.telefono && <p className="text-xs text-destructive">{errores.telefono}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ad-ciudad">Ciudad de residencia *</Label>
                  <Input
                    id="ad-ciudad"
                    placeholder="Ej. Bogotá"
                    value={ciudad}
                    onChange={(e) => {
                      setCiudad(e.target.value);
                      if (errores.ciudad) setErrores((prev) => ({ ...prev, ciudad: "" }));
                    }}
                    className={errores.ciudad ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errores.ciudad && <p className="text-xs text-destructive">{errores.ciudad}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ad-edad">Rango de edad *</Label>
                  <Select value={rangoEdad} onValueChange={setRangoEdad}>
                    <SelectTrigger id="ad-edad">
                      <SelectValue placeholder="Selecciona rango" />
                    </SelectTrigger>
                    <SelectContent>
                      {["18-25", "26-40", "41-60", "60+"].map((r) => (
                        <SelectItem key={r} value={r}>
                          {r} años
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ad-direccion">Dirección completa de residencia *</Label>
                  <Input
                    id="ad-direccion"
                    placeholder="Ej. Calle 45 # 12-34, Barrio Chapinero"
                    value={direccion}
                    onChange={(e) => {
                      setDireccion(e.target.value);
                      if (errores.direccion) setErrores((prev) => ({ ...prev, direccion: "" }));
                    }}
                    className={errores.direccion ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errores.direccion && <p className="text-xs text-destructive">{errores.direccion}</p>}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: SOBRE EL HOGAR Y CONDICIONES */}
          {paso === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-semibold">Sobre tu hogar y condiciones de vida</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Esta información nos permite corroborar que el entorno sea seguro y compatible con la mascota.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ad-vivienda">Tipo de vivienda *</Label>
                  <Select value={tipoVivienda} onValueChange={setTipoVivienda}>
                    <SelectTrigger id="ad-vivienda">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Casa", "Apartamento", "Finca"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ad-propiedad">¿Es vivienda propia o arrendada? *</Label>
                  <Select value={propiedad} onValueChange={setPropiedad}>
                    <SelectTrigger id="ad-propiedad">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Propia">Propia</SelectItem>
                      <SelectItem value="Arrendada (con permiso)">Arrendada (con permiso de mascotas)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ad-personas">Personas en el hogar *</Label>
                  <Input
                    id="ad-personas"
                    type="number"
                    min={1}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={personas}
                    onKeyDown={bloquearTeclasNoNumericas}
                    onPaste={(e) => manejarPegadoSoloDigitos(e, setPersonas, "personas")}
                    onChange={(e) => {
                      const soloDigitos = e.target.value.replace(/\D/g, "");
                      setPersonas(soloDigitos);
                      if (errores.personas) setErrores((prev) => ({ ...prev, personas: "" }));
                    }}
                    className={errores.personas ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errores.personas && <p className="text-xs text-destructive">{errores.personas}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="ad-ninos">Niños menores de 12 años</Label>
                  <Input
                    id="ad-ninos"
                    type="number"
                    min={0}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={ninos}
                    onKeyDown={bloquearTeclasNoNumericas}
                    onPaste={(e) => manejarPegadoSoloDigitos(e, setNinos)}
                    onChange={(e) => {
                      const soloDigitos = e.target.value.replace(/\D/g, "");
                      setNinos(soloDigitos);
                    }}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ad-otras">¿Tienes otras mascotas actualmente? Descríbelas</Label>
                  <Textarea
                    id="ad-otras"
                    rows={2}
                    placeholder="Especie, edad, si están esterilizadas y vacunadas (o escribe 'Ninguna')."
                    value={otrasMascotas}
                    onChange={(e) => setOtrasMascotas(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ad-tiempo">¿Cuánto tiempo pasará sola la mascota al día? *</Label>
                  <Input
                    id="ad-tiempo"
                    placeholder="Ej. Entre 2 y 4 horas al día, trabajo híbrido"
                    value={tiempoSola}
                    onChange={(e) => {
                      setTiempoSola(e.target.value);
                      if (errores.tiempoSola) setErrores((prev) => ({ ...prev, tiempoSola: "" }));
                    }}
                    className={errores.tiempoSola ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errores.tiempoSola && <p className="text-xs text-destructive">{errores.tiempoSola}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ad-experiencia">¿Tienes experiencia previa cuidando mascotas? *</Label>
                  <Input
                    id="ad-experiencia"
                    placeholder="Ej. Sí, he convivido con perros y gatos durante más de 5 años"
                    value={experienciaPrevia}
                    onChange={(e) => {
                      setExperienciaPrevia(e.target.value);
                      if (errores.experienciaPrevia) setErrores((prev) => ({ ...prev, experienciaPrevia: "" }));
                    }}
                    className={errores.experienciaPrevia ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errores.experienciaPrevia && <p className="text-xs text-destructive">{errores.experienciaPrevia}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="ad-motivo">¿Por qué deseas adoptar a esta mascota? *</Label>
                  <Textarea
                    id="ad-motivo"
                    rows={3}
                    placeholder="Cuéntanos qué te motivó a postularte por esta mascota y qué hogar puedes brindarle..."
                    value={motivo}
                    onChange={(e) => {
                      setMotivo(e.target.value);
                      if (errores.motivo) setErrores((prev) => ({ ...prev, motivo: "" }));
                    }}
                    className={errores.motivo ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  {errores.motivo && <p className="text-xs text-destructive">{errores.motivo}</p>}
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: COMPROMISO DE ADOPCIÓN RESPONSABLE */}
          {paso === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Compromiso de adopción responsable</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Al enviar la solicitud, declaras conocer y asumir las siguientes responsabilidades éticas y legales:
                </p>
              </div>

              <ul className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Brindar alimentación balanceada, agua potable, techo seguro y afecto durante toda la vida del animal.",
                  "Cumplir cabalmente su esquema de vacunación, desparasitación periódica y atención veterinaria oportuna.",
                  "Bajo ninguna circunstancia abandonar, comercializar, encadenar o maltratar a la mascota adoptada.",
                  "Permitir el acompañamiento y las visitas de seguimiento que el equipo de la fundación determine.",
                ].map((t, idx) => (
                  <li key={idx} className="flex gap-3 rounded-xl bg-cream/70 p-4">
                    <Check className="mt-0.5 size-4 shrink-0 text-coffee-light" aria-hidden="true" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="ad-acepta"
                    checked={aceptaCompromiso}
                    onCheckedChange={(v) => {
                      setAceptaCompromiso(v === true);
                      if (errores.aceptaCompromiso) setErrores((prev) => ({ ...prev, aceptaCompromiso: "" }));
                    }}
                  />
                  <Label htmlFor="ad-acepta" className="text-sm font-normal leading-relaxed cursor-pointer">
                    Acepto el compromiso de adopción responsable, los{" "}
                    <Link to="/terminos" className="underline font-medium">
                      términos y condiciones
                    </Link>{" "}
                    y la{" "}
                    <Link to="/politicas" className="underline font-medium">
                      política de tratamiento de datos
                    </Link>
                    . *
                  </Label>
                </div>
                {errores.aceptaCompromiso && (
                  <p className="text-xs text-destructive">{errores.aceptaCompromiso}</p>
                )}
              </div>
            </div>
          )}

          {/* BOTONES DE NAVEGACIÓN */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-border/80 pt-6">
            <Button
              type="button"
              variant="outline"
              disabled={paso === 0 || enviando}
              onClick={retrocederPaso}
            >
              <ChevronLeft className="size-4" aria-hidden="true" /> Anterior
            </Button>

            {paso < pasos.length - 1 ? (
              <Button type="button" onClick={avanzarPaso}>
                Siguiente <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={enviando || !aceptaCompromiso}
                onClick={manejarEnvio}
                className="min-w-40"
              >
                {enviando ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Radicando...
                  </>
                ) : (
                  "Radicar solicitud"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
