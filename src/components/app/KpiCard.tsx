import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({ titulo, valor, variacao, bom, serie, Icon, nota }: { titulo: string; valor: string; variacao?: string; bom?: boolean; serie?: number[]; Icon: LucideIcon; nota?: string }) {
  const desce = variacao?.startsWith("▼");
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-lift">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{titulo}</p>
        <span className="grid size-9 place-items-center rounded-xl bg-primary-soft text-primary"><Icon className="size-5" aria-hidden /></span>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">{valor}</p>
      <div className="mt-1 flex items-end justify-between gap-2">
        {variacao && (
          <span className={cn("inline-flex items-center gap-1 text-xs font-semibold", bom ? "text-success" : "text-destructive")}>
            {desce ? <TrendingDown className="size-3.5" aria-hidden /> : <TrendingUp className="size-3.5" aria-hidden />}
            {variacao}
          </span>
        )}
        {nota && <span className="text-xs text-muted-foreground">{nota}</span>}
        {serie && (
          <div className="h-10 w-24" aria-hidden>
            <ResponsiveContainer>
              <AreaChart data={serie.map((v, i) => ({ i, v }))}>
                <Area type="monotone" dataKey="v" stroke="var(--color-primary)" fill="var(--color-primary-soft)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
