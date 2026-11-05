import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, CalendarCheck, CheckCircle2, Clock, Sparkles, RefreshCw, Info, HelpCircle } from "lucide-react";
import { useApp, usePacienteAtivo } from "@/store/app";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fmtRel } from "@/lib/format";
import type { Notificacao } from "@/data/mock";

export const Route = createFileRoute("/paciente/avisos")({ component: Avisos });

const ICON: Record<Notificacao["tipo"], typeof Bell> = { vaga: Sparkles, autorizado: CheckCircle2, agendado: CalendarCheck, lembrete: Clock, confirmacao: HelpCircle, remarcado: RefreshCw, info: Info };

function Avisos() {
  const { ativo } = usePacienteAtivo();
  const notifs = useApp((s) => s.notificacoes);
  const marcar = useApp((s) => s.marcarLida);
  const todas = useApp((s) => s.marcarTodasLidas);
  if (!ativo) return null;
  const lista = notifs.filter((n) => n.pacienteId === ativo.id).sort((a, b) => b.data.localeCompare(a.data));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl">Avisos</h1>
        {lista.some((n) => !n.lida) && <Button variant="ghost" onClick={() => todas(ativo.id)}><CheckCheck />Marcar todos</Button>}
      </div>
      {lista.length === 0 && <div className="rounded-2xl border border-dashed p-8 text-center"><Bell className="mx-auto size-12 text-muted-foreground" /><p className="mt-2 font-semibold">Nenhum aviso por enquanto</p></div>}
      <ul className="space-y-3">
        {lista.map((n) => {
          const I = ICON[n.tipo];
          return (
            <li key={n.id}>
              <button onClick={() => marcar(n.id)} className={cn("flex w-full gap-3 rounded-2xl border p-4 text-left transition-colors", n.lida ? "bg-card" : "border-primary/40 bg-primary-soft")}>
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl", n.lida ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground")}><I className="size-5" /></span>
                <span className="flex-1">
                  <span className="flex items-center justify-between gap-2"><span className="font-bold">{n.titulo}</span>{!n.lida && <span className="size-2.5 rounded-full bg-primary" aria-label="Não lido" />}</span>
                  <span className="block">{n.texto}</span>
                  <span className="text-sm text-muted-foreground">{fmtRel(n.data)}{!n.lida && " · toque para marcar como lido"}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
