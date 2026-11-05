import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BadgeCheck, CheckCheck, Phone, Video, Send, Smile, Paperclip, BellRing, Sparkles, CheckCircle2, RotateCcw, Smartphone, Users, Wifi } from "lucide-react";
import { useApp } from "@/store/app";
import { waSend, waSimular, useWaTyping } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Logo, AvisoProtótipo } from "@/components/app/Logo";
import { APP } from "@/config";

export const Route = createFileRoute("/whatsapp")({
  head: () => ({
    meta: [
      { title: `Simulador de WhatsApp — ${APP.nome}` },
      { name: "description", content: "Veja como o paciente consulta vagas, acompanha pedidos e confirma presença pelo WhatsApp, sem baixar app." },
      { property: "og:title", content: `Simulador de WhatsApp — ${APP.nome}` },
      { property: "og:description", content: "O SUS no WhatsApp: vagas, pedidos e lembretes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WhatsApp,
});

function fmt(t: string) {
  return t.split(/(\*[^*]+\*)/g).map((p, i) => (p.startsWith("*") ? <b key={i}>{p.slice(1, -1)}</b> : p));
}

function WhatsApp() {
  const hydrated = useApp((s) => s.hydrated);
  const wa = useApp((s) => s.wa);
  const waReset = useApp((s) => s.waReset);
  const typing = useWaTyping((s) => s.typing);
  const [txt, setTxt] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [wa.length, typing]);
  const lastBot = [...wa].reverse().find((m) => m.from === "bot");

  return (
    <div className="min-h-screen bg-hero">
      <div className="mx-auto flex max-w-6xl items-start justify-center gap-10 md:px-4 md:py-8">
        <aside className="hidden max-w-sm flex-1 space-y-6 pt-6 lg:block">
          <Link to="/"><Logo /></Link>
          <div>
            <h1 className="text-3xl">Por que WhatsApp?</h1>
            <p className="mt-2 text-muted-foreground">Sem baixar app. Funciona para quem tem baixo letramento digital — 99% dos celulares no Brasil já têm WhatsApp.</p>
          </div>
          <ul className="space-y-3">
            {[[Smartphone, "Sem instalar nada, sem senha"], [Users, "Botões simples, poucas palavras"], [Wifi, "Funciona com internet fraca; SMS como reserva"]].map(([I, t]) => {
              const Icon = I as typeof Smartphone;
              return <li key={t as string} className="flex items-center gap-3 rounded-xl border bg-card p-3 shadow-soft"><Icon className="size-5 text-primary" />{t as string}</li>;
            })}
          </ul>
          <div className="space-y-2 rounded-2xl border bg-card p-4 shadow-soft">
            <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Cenários da apresentação</p>
            <Button variant="outline" className="w-full justify-start" onClick={() => waSimular("lembrete")}><BellRing />Simular lembrete</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => waSimular("vaga")}><Sparkles />Simular vaga liberada</Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => waSimular("autorizado")}><CheckCircle2 />Simular pedido autorizado</Button>
            <Button variant="ghost" className="w-full justify-start" onClick={waReset}><RotateCcw />Reiniciar conversa</Button>
          </div>
          <AvisoProtótipo className="text-left" />
        </aside>

        <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-wa-bg md:h-[820px] md:w-[400px] md:rounded-[3rem] md:border-[10px] md:border-foreground/90 md:shadow-lift">
          <header className="flex items-center gap-3 bg-wa-header px-3 py-3 text-wa-header-foreground">
            <Link to="/" aria-label="Voltar"><ArrowLeft className="size-5" /></Link>
            <span className="grid size-10 place-items-center rounded-full bg-card text-lg font-bold text-primary" aria-hidden>+</span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate font-semibold">FilaZero • Saúde Diamantina <BadgeCheck className="size-4 shrink-0" aria-label="Conta verificada" /></p>
              <p className="text-xs opacity-80">{typing ? "digitando…" : "online"}</p>
            </div>
            <Video className="size-5 opacity-90" aria-hidden /><Phone className="size-5 opacity-90" aria-hidden />
          </header>
          <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4" aria-live="polite">
            <p className="mx-auto w-fit rounded-lg bg-card/80 px-3 py-1 text-xs text-muted-foreground">🔒 Mensagens protegidas · Dados fictícios</p>
            {hydrated && wa.map((m) => (
              <div key={m.id} className={m.from === "user" ? "flex justify-end" : "flex justify-start"}>
                <div className="max-w-[85%] animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <div className={`whitespace-pre-line rounded-xl px-3 py-2 text-[15px] shadow-sm ${m.from === "user" ? "rounded-tr-none bg-wa-out" : "rounded-tl-none bg-wa-in"}`}>
                    {fmt(m.text)}
                    <span className="ml-2 inline-flex translate-y-1 items-center gap-0.5 text-[11px] text-muted-foreground">{m.time}{m.from === "user" && <CheckCheck className="size-4 text-wa-tick" />}</span>
                  </div>
                  {m.options && m === lastBot && !typing && (
                    <div className="mt-1 grid gap-1">
                      {m.options.map((o) => (
                        <button key={o.value} onClick={() => waSend(o.label, o.value)} className="rounded-xl bg-wa-in px-3 py-2.5 text-center text-[15px] font-semibold text-wa-header shadow-sm hover:bg-muted">{o.label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {typing && <div className="w-fit rounded-xl rounded-tl-none bg-wa-in px-4 py-3 shadow-sm"><span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: `${i * 120}ms` }} />)}</span></div>}
            <div ref={end} />
          </div>
          <div className="flex gap-1 overflow-x-auto px-2 pb-1 lg:hidden">
            <Button size="sm" variant="outline" onClick={() => waSimular("lembrete")}>Lembrete</Button>
            <Button size="sm" variant="outline" onClick={() => waSimular("vaga")}>Vaga liberada</Button>
            <Button size="sm" variant="outline" onClick={() => waSimular("autorizado")}>Autorizado</Button>
          </div>
          <form className="flex items-center gap-2 px-2 pb-3 pt-1" onSubmit={(e) => { e.preventDefault(); if (txt.trim()) { waSend(txt.trim()); setTxt(""); } }}>
            <div className="flex flex-1 items-center gap-2 rounded-full bg-wa-in px-4 py-2.5 shadow-sm">
              <Smile className="size-5 text-muted-foreground" aria-hidden />
              <input value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Mensagem" aria-label="Digite uma mensagem" className="flex-1 bg-transparent text-[15px] outline-none" />
              <Paperclip className="size-5 text-muted-foreground" aria-hidden />
            </div>
            <button type="submit" aria-label="Enviar" className="grid size-11 place-items-center rounded-full bg-wa-header text-wa-header-foreground"><Send className="size-5" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}
