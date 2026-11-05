import { APP } from "@/config";
import { cn } from "@/lib/utils";

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold", className)}>
      <span className="grid size-8 place-items-center rounded-xl bg-brand text-primary-foreground shadow-soft" aria-hidden>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </span>
      <span className={cn("text-lg tracking-tight", light ? "text-sidebar-accent-foreground" : "text-foreground")}>{APP.nome}</span>
    </span>
  );
}

export function AvisoProtótipo({ className }: { className?: string }) {
  return <p className={cn("text-center text-xs text-muted-foreground", className)}>{APP.aviso}</p>;
}
