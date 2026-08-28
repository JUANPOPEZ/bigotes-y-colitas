import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usuarioDemo } from "@/lib/mock-session";
import { ciudades } from "@/mock/mascotas";

export const Route = createFileRoute("/cuenta/perfil")({
  head: () => ({
    meta: [
      { title: "Mi perfil — Bigotes y Colitas" },
      {
        name: "description",
        content:
          "Actualiza tus datos personales, la información de tu hogar y la seguridad de tu cuenta en Bigotes y Colitas.",
      },
      { property: "og:title", content: "Mi perfil — Bigotes y Colitas" },
      {
        property: "og:description",
        content: "Gestiona tus datos y preferencias como adoptante.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  const [guardando, setGuardando] = useState(false);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    window.setTimeout(() => {
      setGuardando(false);
      toast.success("Cambios guardados (simulado)");
    }, 500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Mi perfil</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Mantén tus datos al día: los usamos para evaluar cada solicitud de adopción.
        </p>
      </div>

      <Card className="border-border/80 shadow-none">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
          <Avatar className="size-16">
            <AvatarFallback className="bg-secondary text-lg text-secondary-foreground">
              {usuarioDemo.iniciales}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-lg font-semibold">{usuarioDemo.nombre}</p>
            <p className="text-sm text-muted-foreground">{usuarioDemo.correo}</p>
          </div>
          <Button
            variant="outline"
            className="sm:ml-auto"
            onClick={() => toast.info("La carga de imágenes se habilita con el backend")}
          >
            <Upload className="mr-1.5 size-4" /> Cambiar foto
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="datos">
        <TabsList>
          <TabsTrigger value="datos">Datos personales</TabsTrigger>
          <TabsTrigger value="hogar">Mi hogar</TabsTrigger>
          <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="mt-6">
          <Card className="border-border/80 shadow-none">
            <CardHeader>
              <CardTitle className="font-display text-lg">Información básica</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={guardar}>
                <div>
                  <Label htmlFor="p-nombre" className="mb-1.5 block">
                    Nombre completo
                  </Label>
                  <Input id="p-nombre" defaultValue={usuarioDemo.nombre} />
                </div>
                <div>
                  <Label htmlFor="p-correo" className="mb-1.5 block">
                    Correo electrónico
                  </Label>
                  <Input id="p-correo" type="email" defaultValue={usuarioDemo.correo} />
                </div>
                <div>
                  <Label htmlFor="p-telefono" className="mb-1.5 block">
                    Teléfono
                  </Label>
                  <Input id="p-telefono" defaultValue="3001234567" />
                </div>
                <div>
                  <Label htmlFor="p-ciudad" className="mb-1.5 block">
                    Ciudad
                  </Label>
                  <Select defaultValue={ciudades[0]}>
                    <SelectTrigger id="p-ciudad">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ciudades.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="p-direccion" className="mb-1.5 block">
                    Dirección
                  </Label>
                  <Input id="p-direccion" defaultValue="Carrera 15 #85-40, apto 302" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="p-bio" className="mb-1.5 block">
                    Cuéntanos sobre ti
                  </Label>
                  <Textarea
                    id="p-bio"
                    rows={4}
                    defaultValue="Vivo con mi familia y tenemos experiencia cuidando perros medianos."
                  />
                </div>
                <Button type="submit" className="sm:col-span-2 sm:w-fit" disabled={guardando}>
                  Guardar cambios
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hogar" className="mt-6">
          <Card className="border-border/80 shadow-none">
            <CardHeader>
              <CardTitle className="font-display text-lg">Condiciones del hogar</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={guardar}>
                <div>
                  <Label htmlFor="h-vivienda" className="mb-1.5 block">
                    Tipo de vivienda
                  </Label>
                  <Select defaultValue="Apartamento">
                    <SelectTrigger id="h-vivienda">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Apartamento", "Casa", "Finca"].map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="h-personas" className="mb-1.5 block">
                    Personas en casa
                  </Label>
                  <Input id="h-personas" type="number" defaultValue={3} min={1} />
                </div>
                <div className="space-y-4 sm:col-span-2">
                  {[
                    "Tengo patio o zona exterior segura",
                    "Hay niños menores de 12 años",
                    "Convivo con otras mascotas",
                    "Puedo asumir gastos veterinarios",
                  ].map((t, i) => (
                    <div key={t} className="flex items-center justify-between gap-4">
                      <span className="text-sm">{t}</span>
                      <Switch defaultChecked={i !== 1} />
                    </div>
                  ))}
                </div>
                <Button type="submit" className="sm:col-span-2 sm:w-fit">
                  Guardar información
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguridad" className="mt-6 space-y-6">
          <Card className="border-border/80 shadow-none">
            <CardHeader>
              <CardTitle className="font-display text-lg">Cambiar contraseña</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={guardar}>
                <div className="sm:col-span-2">
                  <Label htmlFor="s-actual" className="mb-1.5 block">
                    Contraseña actual
                  </Label>
                  <Input id="s-actual" type="password" />
                </div>
                <div>
                  <Label htmlFor="s-nueva" className="mb-1.5 block">
                    Nueva contraseña
                  </Label>
                  <Input id="s-nueva" type="password" />
                </div>
                <div>
                  <Label htmlFor="s-confirmar" className="mb-1.5 block">
                    Confirmar contraseña
                  </Label>
                  <Input id="s-confirmar" type="password" />
                </div>
                <Button type="submit" className="sm:col-span-2 sm:w-fit">
                  Actualizar contraseña
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/80 shadow-none">
            <CardContent className="flex items-start gap-3 p-6">
              <ShieldCheck className="mt-0.5 size-5 text-coffee-light" aria-hidden="true" />
              <div>
                <p className="text-sm font-medium">Tus datos están protegidos</p>
                <p className="text-xs text-muted-foreground">
                  Tratamos tu información según la política de protección de datos de la fundación
                  y solo la usamos para el proceso de adopción.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30 shadow-none">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Eliminar mi cuenta</p>
                <p className="text-xs text-muted-foreground">
                  Se cerrarán tus solicitudes activas y perderás tu historial.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <Trash2 className="mr-1.5 size-4" /> Eliminar cuenta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar tu cuenta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminarán tus datos y tu historial.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => toast.success("Cuenta eliminada (simulado)")}>
                      Sí, eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
