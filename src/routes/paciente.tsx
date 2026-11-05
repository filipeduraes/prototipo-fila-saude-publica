import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Search, ClipboardList, HelpCircle, Bell, Type, Contrast, LogOut, UserRound, X, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApp, usePacienteAtivo } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Logo, AvisoProtótipo } from "@/components/app/Logo";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { isValidDoc, isValidPhone, maskDoc, maskPhone, onlyDigits, primeiroNome } from "@/lib/format";
import { APP } from "@/config";

export const Route = createFileRoute("/paciente")({
  head: () => ({
    meta: [
      { title: `Portal do Paciente — ${APP.nome}` },
      { name: "description", content: "Veja vagas das UBS, acompanhe seus pedidos e receba avisos sem madrugar na fila." },
      { property: "og:title", content: `Portal do Paciente — ${APP.nome}` },
      { property: "og:description", content: "Vagas, pedidos e avisos do SUS na palma da mão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PacienteLayout,
});

const NAV = [
  { to: "/paciente", label: "Início", I: Home },
  { to: "/paciente/vagas", label: "Vagas", I: Search },
  { to: "/paciente/pedidos", label: "Meus pedidos", I: ClipboardList },
  { to: "/paciente/ajuda", label: "Ajuda", I: HelpCircle },
] as const;

function PacienteLayout() {
  const hydrated = useApp((s) => s.hydrated);
  const prefs = useApp((s) => s.prefs);
  const sessao = useApp((s) => s.sessao);

  useEffect(() => {
    const el = document.documentElement;
    el.style.fontSize = prefs.letraGrande ? "131%" : "112.5%";
    return () => { el.style.fontSize = ""; };
  }, [prefs.letraGrande]);

  return (
    <div className={cn("min-h-screen bg-muted/60", prefs.altoContraste && "hc")}>
      <div className="mx-auto flex min-h-screen max-w-[440px] flex-col bg-background shadow-lift">
        {!hydrated ? <PortalSkeleton /> : !sessao.pacienteId ? <Login /> : <Shell />}
      </div>
    </div>
  );
}

function PortalSkeleton() {
  return <div className="space-y-4 p-5"><Skeleton className="h-10 w-40" /><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-16 w-full rounded-2xl" /><Skeleton className="h-16 w-full rounded-2xl" /></div>;
}

function A11yButtons() {
  const prefs = useApp((s) => s.prefs);
  const setPrefs = useApp((s) => s.setPrefs);
  return (
    <div className="flex gap-1">
      <button onClick={() => setPrefs({ letraGrande: !prefs.letraGrande })} aria-pressed={prefs.letraGrande} aria-label="Aumentar letra"
        className={cn("grid size-11 place-items-center rounded-xl border", prefs.letraGrande ? "bg-primary text-primary-foreground" : "bg-card")}>
        <Type className="size-5" />
      </button>
      <button onClick={() => setPrefs({ altoContraste: !prefs.altoContraste })} aria-pressed={prefs.altoContraste} aria-label="Alto contraste"
        className={cn("grid size-11 place-items-center rounded-xl border", prefs.altoContraste ? "bg-primary text-primary-foreground" : "bg-card")}>
        <Contrast className="size-5" />
      </button>
    </div>
  );
}

function Shell() {
  const { ativo, acompanhando } = usePacienteAtivo();
  const acompanhar = useApp((s) => s.acompanhar);
  const logout = useApp((s) => s.logout);
  const naoLidas = useApp((s) => s.notificacoes.filter((n) => n.pacienteId === ativo?.id && !n.lida).length);
  const { pathname } = useLocation();
  return (
    <>
      <header className="sticky top-0 z-30 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <Link to="/paciente" aria-label="Início"><Logo /></Link>
          <div className="flex items-center gap-1">
            <A11yButtons />
            <Link to="/paciente/avisos" aria-label={`Avisos, ${naoLidas} não lidos`} className="relative grid size-11 place-items-center rounded-xl border bg-card">
              <Bell className="size-5" />
              {naoLidas > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-destructive text-[11px] font-bold text-destructive-foreground">{naoLidas}</span>}
            </Link>
            <button onClick={() => { logout(); toast("Você saiu do portal"); }} aria-label="Sair" className="grid size-11 place-items-center rounded-xl border bg-card"><LogOut className="size-5" /></button>
          </div>
        </div>
        {acompanhando && ativo && (
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-warning-soft px-3 py-2 text-sm font-semibold text-warning-foreground">
            <span className="flex items-center gap-2"><UserRound className="size-4" />Você está acompanhando: {ativo.idade >= 60 ? "Dona " : ""}{primeiroNome(ativo.nome)}</span>
            <button onClick={() => acompanhar(null)} className="flex items-center gap-1 rounded-lg px-2 py-1 hover:bg-warning/20" aria-label="Voltar para meu perfil"><X className="size-4" />Sair</button>
          </div>
        )}
      </header>
      <main className="flex-1 px-4 pb-28 pt-5" key={pathname}>
        <div className="animate-in fade-in duration-200"><Outlet /></div>
        <AvisoProtótipo className="mt-8" />
      </main>
      <nav className="fixed bottom-0 left-1/2 z-40 grid w-full max-w-[440px] -translate-x-1/2 grid-cols-4 border-t bg-card" aria-label="Navegação principal">
        {NAV.map((n) => {
          const active = n.to === "/paciente" ? pathname === "/paciente" || pathname === "/paciente/" : pathname.startsWith(n.to);
          return (
            <Link key={n.to} to={n.to} className={cn("flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-semibold", active ? "text-primary" : "text-muted-foreground")} aria-current={active ? "page" : undefined}>
              <span className={cn("grid h-8 w-14 place-items-center rounded-full transition-colors", active && "bg-primary-soft")}><n.I className="size-6" /></span>
              {n.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function Login() {
  const login = useApp((s) => s.login);
  const [step, setStep] = useState<"dados" | "codigo">("dados");
  const [doc, setDoc] = useState("");
  const [tel, setTel] = useState("");
  const [ok, setOk] = useState(false);
  const [code, setCode] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!isValidDoc(doc)) er.doc = "Digite um CPF (11 números) ou Cartão do SUS (15 números) válido.";
    if (!isValidPhone(tel)) er.tel = "Digite o celular com DDD. Ex.: (38) 99812-3401";
    if (!ok) er.ok = "Para continuar, marque que você aceita.";
    setErr(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep("codigo"); toast.success("Enviamos um código por SMS"); }, 900);
  }
  function confirmar(e: React.FormEvent) {
    e.preventDefault();
    if (onlyDigits(code).length !== 6) return setErr({ code: "O código tem 6 números." });
    setLoading(true);
    setTimeout(() => { login("p1"); toast.success("Bem-vinda, Maria!"); }, 700);
  }

  return (
    <div className="flex flex-1 flex-col px-5 py-6">
      <div className="flex items-center justify-between"><Logo /><A11yButtons /></div>
      <div className="mt-8">
        <h1 className="text-3xl">{step === "dados" ? "Entrar" : "Digite o código"}</h1>
        <p className="mt-2 text-muted-foreground">{step === "dados" ? "Veja vagas e acompanhe seus pedidos sem ir à UBS." : `Mandamos 6 números para ${tel}.`}</p>
      </div>
      {step === "dados" ? (
        <form onSubmit={enviar} className="mt-6 space-y-5" noValidate>
          <div>
            <Label htmlFor="doc" className="text-base">Cartão do SUS ou CPF</Label>
            <Input id="doc" inputMode="numeric" value={doc} onChange={(e) => setDoc(maskDoc(e.target.value))} placeholder="000.000.000-00" className="mt-2 h-14 rounded-xl text-lg" aria-invalid={!!err.doc} aria-describedby="doc-err" />
            {err.doc && <p id="doc-err" className="mt-1 text-sm font-semibold text-destructive">{err.doc}</p>}
          </div>
          <div>
            <Label htmlFor="tel" className="text-base">Celular</Label>
            <Input id="tel" inputMode="tel" value={tel} onChange={(e) => setTel(maskPhone(e.target.value))} placeholder="(38) 99999-9999" className="mt-2 h-14 rounded-xl text-lg" aria-invalid={!!err.tel} aria-describedby="tel-err" />
            {err.tel && <p id="tel-err" className="mt-1 text-sm font-semibold text-destructive">{err.tel}</p>}
          </div>
          <div className="rounded-2xl border bg-muted/50 p-4">
            <div className="flex gap-3">
              <Checkbox id="lgpd" checked={ok} onCheckedChange={(v) => setOk(!!v)} className="mt-1 size-6" />
              <Label htmlFor="lgpd" className="text-base font-normal leading-snug">Aceito que meus dados de saúde sejam usados apenas para acompanhar meus atendimentos.</Label>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="size-4" />Protegido pela LGPD. Você pode pedir a exclusão quando quiser.</p>
            {err.ok && <p className="mt-1 text-sm font-semibold text-destructive">{err.ok}</p>}
          </div>
          <Button type="submit" size="xl" className="w-full" disabled={loading}>{loading && <Loader2 className="animate-spin" />}Entrar</Button>
        </form>
      ) : (
        <form onSubmit={confirmar} className="mt-6 space-y-5">
          <Input autoFocus inputMode="numeric" value={code} onChange={(e) => setCode(onlyDigits(e.target.value).slice(0, 6))} aria-label="Código de 6 dígitos" placeholder="••••••" className="h-16 rounded-xl text-center text-3xl tracking-[0.5em]" />
          {err.code && <p className="text-sm font-semibold text-destructive">{err.code}</p>}
          <p className="rounded-xl bg-info-soft p-3 text-sm text-info">Código de demonstração: <b>123456</b></p>
          <Button type="submit" size="xl" className="w-full" disabled={loading}>{loading && <Loader2 className="animate-spin" />}Confirmar</Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("dados")}>Voltar</Button>
        </form>
      )}
      <div className="mt-8 space-y-3 border-t pt-6">
        <p className="text-sm font-semibold text-muted-foreground">Atalhos da demonstração</p>
        <Button variant="secondary" size="xl" className="w-full justify-start" onClick={() => login("p1")}>👩🏽 Entrar como Maria das Graças (demo)</Button>
        <Button variant="secondary" size="xl" className="w-full justify-start" onClick={() => login("p2")}>👨🏻 Entrar como Carlos, cuidador (demo)</Button>
      </div>
      <AvisoProtótipo className="mt-auto pt-8" />
    </div>
  );
}
