import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { useKpis } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Logo, AvisoProtótipo } from "@/components/app/Logo";
import { APP } from "@/config";
import { fmtNum } from "@/lib/format";

export const Route = createFileRoute("/gestao")({
  head: () => ({
    meta: [
      { title: `Painel da Secretaria — ${APP.nome}` },
      { name: "description", content: "Visão da fila, faltas e vagas reaproveitadas para a Secretaria Municipal de Saúde." },
      { property: "og:title", content: `Painel da Secretaria — ${APP.nome}` },
      { property: "og:description", content: "Gestão transparente de vagas e encaminhamentos do SUS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gestao,
});

function Gestao() {
  const k = useKpis();
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <Logo />
      <h1 className="flex items-center gap-2 text-3xl"><LayoutDashboard className="size-7 text-primary" />Painel da Secretaria — {APP.municipio}</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Pessoas na fila", fmtNum(k.fila)], ["Pedidos parados", String(k.parados)], ["Vagas reaproveitadas", String(k.reaproveitadas)]].map(([t, v]) => (
          <div key={t} className="rounded-2xl border bg-card p-5 shadow-soft"><p className="text-sm text-muted-foreground">{t}</p><p className="text-3xl font-bold">{v}</p></div>
        ))}
      </div>
      <p className="rounded-2xl bg-warning-soft p-4 text-warning-foreground">O painel completo (fila, vagas, faltas, demanda, alertas, integrações e área da UBS) ainda está em construção.</p>
      <Button asChild variant="outline"><Link to="/">Voltar ao início</Link></Button>
      <AvisoProtótipo />
    </div>
  );
}
