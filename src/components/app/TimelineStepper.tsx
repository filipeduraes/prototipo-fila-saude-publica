import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ETAPAS, ETAPA_LABEL, ETAPA_FRASE, type Encaminhamento } from "@/data/mock";
import { fmtDataHora } from "@/lib/format";

export function TimelineStepper({ enc, simple }: { enc: Encaminhamento; simple?: boolean }) {
  const idxAtual = ETAPAS.indexOf(enc.etapaAtual);
  return (
    <ol className="relative space-y-0" aria-label="Etapas do pedido">
      {ETAPAS.map((et, i) => {
        const h = enc.historico.find((x) => x.etapa === et);
        const feito = i < idxAtual || (i === idxAtual && et === "realizado");
        const atual = i === idxAtual && et !== "realizado";
        const atrasado = atual && enc.prazoExcedido;
        return (
          <li key={et} className="relative flex gap-4 pb-6 last:pb-0" aria-current={atual ? "step" : undefined}>
            {i < ETAPAS.length - 1 && (
              <span className={cn("absolute left-[17px] top-9 h-[calc(100%-2rem)] w-0.5", i < idxAtual ? "bg-success" : "bg-border")} aria-hidden />
            )}
            <span
              className={cn(
                "relative z-10 grid size-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold transition-all",
                feito && "border-success bg-success text-success-foreground",
                atual && !atrasado && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20",
                atrasado && "border-warning bg-warning text-warning-foreground ring-4 ring-warning/30",
                !feito && !atual && "border-border bg-card text-muted-foreground",
              )}
            >
              {feito ? <Check className="size-5" aria-hidden /> : i + 1}
            </span>
            <div className={cn("min-w-0 flex-1 pt-1", !feito && !atual && "opacity-60")}>
              <p className={cn("font-bold leading-tight", atual && "text-primary-deep")}>
                {ETAPA_LABEL[et]} {atual && <span className="ml-1 rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary-deep">Etapa atual</span>}
              </p>
              {h && <p className="text-sm text-muted-foreground">{fmtDataHora(h.data)} · {h.responsavel}</p>}
              {h?.nota && <p className="mt-1 text-sm italic text-muted-foreground">{h.nota}</p>}
              {atual && !simple && <p className="mt-2 rounded-xl bg-muted p-3 text-[0.95em]">{ETAPA_FRASE[et]}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
