import { Outlet, createFileRoute } from "@tanstack/react-router";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export const Route = createFileRoute("/_site")({
  component: SiteLayout,
});

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
