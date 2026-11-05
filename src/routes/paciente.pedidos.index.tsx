import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, AlertTriangle, ClipboardList } from "lucide-react";
import { useApp, usePacienteAtivo } from "@/store/app";
import { servicoById, ubsById } from "@/data/mock";
import { EtapaBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/paciente/pedidos/")({ component: Pedidos });

function Pedidos() {
  const { ativo } = usePacienteAtivo();
  const encs = useApp((s) => s.encaminhamentos);
  if (!ativo) return null;
  const meus = encs.filter((e) => e.pacienteId === ativo.id && !e.cancelado).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Meus pedidos</h1>
      {meus.length === 0 && (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <ClipboardList className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-2 font-semibold">Nenhum pedido ainda</p>
          <Button asChild className="mt-4" size="lg"><Link to="/paciente/vagas">Ver vagas</Link></Button>
        </div>
      )}
      {meus.map((e) => {
        const s = servicoById(e.servicoId);
        return (
          <Link key={e.id} to="/paciente/pedidos/$id" params={{ id: e.id }} className="block rounded-2xl border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm capitalize text-muted-foreground">{s.tipo}</p>
                <h2 className="text-lg">{s.nome}</h2>
                <p className="text-sm text-muted-foreground">{ubsById(e.ubsOrigemId).nome} · {e.protocolo}</p>
              </div>
              <ChevronRight className="size-6 shrink-0 text-muted-foreground" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <EtapaBadge etapa={e.etapaAtual} />
              {e.prazoExcedido && <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning-foreground"><AlertTriangle className="size-3.5" />Demorando</span>}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
