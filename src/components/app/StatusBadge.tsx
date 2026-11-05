import { CheckCircle2, Clock, Search, CalendarCheck, Send, AlertTriangle, CircleDot, XCircle, HelpCircle, RefreshCw, UserCheck, UserX, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { ETAPA_LABEL, PRIORIDADE_LABEL, type Etapa, type Prioridade, type StatusConf } from "@/data/mock";

const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border";

const ETAPA_STYLE: Record<Etapa, { cls: string; Icon: typeof Clock }> = {
  solicitado: { cls: "bg-muted text-foreground border-border", Icon: Send },
  em_analise: { cls: "bg-info-soft text-info border-info/30", Icon: Search },
  autorizado: { cls: "bg-success-soft text-success border-success/30", Icon: CheckCircle2 },
  agendado: { cls: "bg-primary-soft text-primary-deep border-primary/30", Icon: CalendarCheck },
  realizado: { cls: "bg-secondary text-secondary-foreground border-success/20", Icon: CheckCircle2 },
};

export function EtapaBadge({ etapa, className }: { etapa: Etapa; className?: string }) {
  const { cls, Icon } = ETAPA_STYLE[etapa];
  return <span className={cn(base, cls, className)}><Icon className="size-3.5" aria-hidden />{ETAPA_LABEL[etapa]}</span>;
}

const PRI: Record<Prioridade, string> = {
  vermelho: "bg-destructive-soft text-destructive border-destructive/30",
  amarelo: "bg-warning-soft text-warning-foreground border-warning/50",
  verde: "bg-success-soft text-success border-success/30",
  azul: "bg-info-soft text-info border-info/30",
};
export function PrioridadeBadge({ p, short }: { p: Prioridade; short?: boolean }) {
  return <span className={cn(base, PRI[p])}><CircleDot className="size-3.5" aria-hidden />{short ? PRIORIDADE_LABEL[p].split(" · ")[0] : PRIORIDADE_LABEL[p]}</span>;
}

export type Semaforo = "verde" | "amarelo" | "vermelho";
export const semaforo = (livres: number): Semaforo => (livres <= 0 ? "vermelho" : livres <= 3 ? "amarelo" : "verde");
export function SemaforoBadge({ livres, big }: { livres: number; big?: boolean }) {
  const s = semaforo(livres);
  const map = {
    verde: { cls: "bg-success-soft text-success border-success/30", Icon: CheckCircle2, t: `${livres} vagas` },
    amarelo: { cls: "bg-warning-soft text-warning-foreground border-warning/50", Icon: AlertTriangle, t: `Poucas: ${livres}` },
    vermelho: { cls: "bg-destructive-soft text-destructive border-destructive/30", Icon: XCircle, t: "Esgotado" },
  }[s];
  return <span className={cn(base, map.cls, big && "px-3 py-1.5 text-sm")}><map.Icon className={big ? "size-4" : "size-3.5"} aria-hidden />{map.t}</span>;
}

const CONF: Record<StatusConf, { cls: string; Icon: typeof Clock; t: string }> = {
  confirmada: { cls: "bg-success-soft text-success border-success/30", Icon: CheckCircle2, t: "Confirmada" },
  pendente: { cls: "bg-warning-soft text-warning-foreground border-warning/50", Icon: Clock, t: "Pendente" },
  cancelada: { cls: "bg-destructive-soft text-destructive border-destructive/30", Icon: XCircle, t: "Cancelada" },
  sem_resposta: { cls: "bg-muted text-muted-foreground border-border", Icon: HelpCircle, t: "Não respondeu" },
  liberada: { cls: "bg-info-soft text-info border-info/30", Icon: Unlock, t: "Liberada" },
  redistribuida: { cls: "bg-primary-soft text-primary-deep border-primary/30", Icon: RefreshCw, t: "Redistribuída" },
  compareceu: { cls: "bg-success-soft text-success border-success/30", Icon: UserCheck, t: "Compareceu" },
  falta: { cls: "bg-destructive-soft text-destructive border-destructive/30", Icon: UserX, t: "Faltou" },
};
export function ConfBadge({ s }: { s: StatusConf }) {
  const c = CONF[s];
  return <span className={cn(base, c.cls)}><c.Icon className="size-3.5" aria-hidden />{c.t}</span>;
}
