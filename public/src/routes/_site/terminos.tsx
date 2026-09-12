import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/terminos")({
  head: () => ({
    meta: [
      { title: "Términos y condiciones — Bigotes y Colitas" },
      { name: "description", content: "Términos y condiciones en la plataforma Bigotes y Colitas." },
      { property: "og:title", content: "Términos y condiciones — Bigotes y Colitas" },
      { property: "og:description", content: "Términos y condiciones en la plataforma Bigotes y Colitas." },
    ],
  }),
  component: Pagina,
});

function Pagina() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">Términos y condiciones</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Sección en construcción dentro del prototipo. La interfaz completa de este módulo se
        entrega en la siguiente fase.
      </p>
    </div>
  );
}
