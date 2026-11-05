import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, Search, ListChecks, BellRing, Moon, Users, Building2, Check, Minus, X, CalendarCheck, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/app/Logo";
import { APP } from "@/config";
import { fmtBRL } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${APP.nome} — Chega de madrugar na fila do posto` },
      { name: "description", content: `${APP.slogan}. ${APP.proposta}` },
      { property: "og:title", content: `${APP.nome} — Chega de madrugar na fila do posto` },
      { property: "og:description", content: APP.proposta },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const NUMEROS = [
  { v: "5,7 mi", t: "de pessoas aguardam consultas especializadas no Brasil", f: "Fonte: Ministério da Saúde / CNN Brasil, 2024" },
  { v: "+26%", t: "foi o crescimento da fila de cirurgias eletivas em 2024 — espera média acima de 2 anos", f: "Fonte: levantamento CFM, 2024" },
  { v: "94%", t: "da Classe C concorda que o tempo de espera coloca vidas em risco", f: "Fonte: Instituto Locomotiva, 2024" },
  { v: "24%", t: "relataram piora da saúde por causa da demora no atendimento", f: "Fonte: Instituto Locomotiva, 2024" },
];

type C = "s" | "p" | "n";
const COLS = ["FilaZero", "Meu SUS Digital", "SISREG / e-SUS Regulação", "Apps municipais", "Fila da madrugada"];
const LINHAS: { crit: string; v: [C | null, string][] }[] = [
  { crit: "Foco principal", v: [[null, "Cidadão + gestor"], [null, "Cidadão"], [null, "Gestor e profissionais"], [null, "Cidadão"], [null, "Cidadão"]] },
  { crit: "Transparência de vagas em tempo real", v: [["s", "Sim"], ["p", "Parcial"], ["n", "Só gestores"], ["p", "Parcial"], ["n", "Não"]] },
  { crit: "Acompanhamento do encaminhamento", v: [["s", "Etapa por etapa"], ["p", "Parcial"], ["n", "Não"], ["n", "Não"], ["n", "Não"]] },
  { crit: "Agendamento sem ir à UBS", v: [["s", "Lista digital"], ["p", "Parcial"], ["n", "Feito pela equipe"], ["s", "Atenção básica"], ["n", "Não"]] },
  { crit: "Canal acessível (WhatsApp/SMS)", v: [["s", "Sim"], ["n", "App/web"], ["n", "Não"], ["n", "App"], ["p", "Presencial"]] },
  { crit: "Avisos e redistribuição de vagas", v: [["s", "Com redistribuição por faltas"], ["p", "Parcial"], ["n", "Não"], ["p", "Parcial"], ["n", "Não"]] },
  { crit: "Integração com sistemas existentes", v: [["s", "Camada complementar"], ["p", "Depende do município"], [null, "É o próprio sistema"], ["p", "Restrita ao local"], [null, "Não se aplica"]] },
  { crit: "Painel de gestão", v: [["s", "Sim"], ["n", "Não"], ["s", "Sim"], ["p", "Parcial"], ["n", "Não"]] },
];

function Marca({ c }: { c: C | null }) {
  if (!c) return null;
  const m = { s: { I: Check, cls: "bg-success text-success-foreground", l: "Sim" }, p: { I: Minus, cls: "bg-warning text-warning-foreground", l: "Parcial" }, n: { I: X, cls: "bg-destructive-soft text-destructive", l: "Não" } }[c];
  return <span className={`grid size-5 shrink-0 place-items-center rounded-full ${m.cls}`} aria-label={m.l}><m.I className="size-3.5" strokeWidth={3} /></span>;
}

function PhoneMock() {
  return (
    <div className="relative mx-auto w-64 rounded-[2.5rem] border-8 border-foreground/90 bg-card p-3 shadow-lift">
      <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-foreground/20" />
      <p className="text-sm font-bold">Olá, Maria! 👋</p>
      <div className="mt-2 rounded-2xl bg-brand p-3 text-primary-foreground">
        <p className="text-[11px] opacity-90">Meu próximo atendimento</p>
        <p className="font-bold">Clínico Geral</p>
        <p className="text-xs opacity-90">UBS Centro · amanhã 14:00</p>
        <div className="mt-2 rounded-xl bg-card py-1.5 text-center text-xs font-bold text-primary">Confirmar presença</div>
      </div>
      <div className="mt-2 space-y-1.5">
        {[["UBS Centro", "8 vagas", "bg-success"], ["UBS Palha", "2 vagas", "bg-warning"], ["UBS Bom Jesus", "Esgotado", "bg-destructive"]].map(([n, v, c]) => (
          <div key={n} className="flex items-center justify-between rounded-xl border px-2.5 py-2 text-xs">
            <span className="font-semibold">{n}</span>
            <span className="flex items-center gap-1"><span className={`size-2 rounded-full ${c}`} />{v}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-xl bg-success-soft p-2 text-[11px] text-success"><CheckCircle2 className="size-4" />Cardiologia autorizada</div>
    </div>
  );
}

function DashMock() {
  return (
    <div className="absolute -right-4 top-10 hidden w-72 rounded-2xl border bg-card p-4 shadow-lift lg:block">
      <p className="text-xs font-semibold text-muted-foreground">Painel da Secretaria</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-primary-soft p-2"><p className="text-[10px] text-muted-foreground">Tempo de espera</p><p className="font-bold text-primary-deep">18 dias <span className="text-[10px] text-success">▼23%</span></p></div>
        <div className="rounded-xl bg-success-soft p-2"><p className="text-[10px] text-muted-foreground">Vagas reaproveitadas</p><p className="font-bold text-success">96</p></div>
      </div>
      <div className="mt-3 flex h-16 items-end gap-1.5">
        {[70, 64, 55, 46, 38, 30].map((h, i) => <div key={i} className="flex-1 rounded-t-md bg-brand" style={{ height: `${h}%` }} />)}
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">Fila de espera · últimos 6 meses</p>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex" aria-label="Seções">
            <a href="#como" className="hover:text-foreground">Como funciona</a>
            <a href="#comparativo" className="hover:text-foreground">Comparativo</a>
            <a href="#modelo" className="hover:text-foreground">Para municípios</a>
          </nav>
          <Button asChild size="sm"><Link to="/gestao">Painel do gestor</Link></Button>
        </div>
      </header>

      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm font-semibold text-primary-deep shadow-soft">
              <span className="size-2 rounded-full bg-success" /> {APP.slogan}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] md:text-6xl">Chega de madrugar na fila do posto.</h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">{APP.proposta} Veja as vagas da sua UBS, acompanhe seu encaminhamento e receba avisos pelo WhatsApp.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="hero" size="xl"><Link to="/paciente"><Users />Sou paciente ou familiar</Link></Button>
              <Button asChild variant="outline" size="xl"><Link to="/gestao"><Building2 />Sou gestor de saúde</Link></Button>
            </div>
            <Link to="/whatsapp" className="mt-5 inline-flex items-center gap-2 font-semibold text-primary hover:underline"><MessageCircle className="size-5" />Ver no WhatsApp <ArrowRight className="size-4" /></Link>
          </div>
          <div className="relative py-6"><PhoneMock /><DashMock /></div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20" aria-labelledby="problema">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">O problema</p>
        <h2 id="problema" className="mt-2 max-w-2xl text-3xl font-bold md:text-4xl">Fichas acabam em minutos. Encaminhamentos se perdem. Ninguém sabe se há vaga.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NUMEROS.map((n) => (
            <div key={n.v} className="flex flex-col rounded-2xl border bg-card p-6 shadow-soft">
              <p className="text-4xl font-bold text-primary">{n.v}</p>
              <p className="mt-3 flex-1 text-foreground">{n.t}</p>
              <p className="mt-4 text-xs text-muted-foreground">{n.f}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="como" className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Como funciona</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Três passos, sem sair de casa</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { I: Search, t: "Veja as vagas de cada UBS", d: "Disponibilidade atualizada em tempo real, com semáforo simples." },
              { I: ListChecks, t: "Entre na lista e acompanhe", d: "Lista de espera digital e o encaminhamento etapa por etapa." },
              { I: BellRing, t: "Receba avisos e confirme", d: "Lembretes por WhatsApp ou SMS. Não pode ir? A vaga vai para outra pessoa." },
            ].map((p, i) => (
              <div key={p.t} className="relative rounded-2xl border bg-background p-6">
                <span className="absolute right-5 top-4 text-5xl font-bold text-primary/10">{i + 1}</span>
                <span className="grid size-12 place-items-center rounded-2xl bg-brand text-primary-foreground"><p.I className="size-6" /></span>
                <h3 className="mt-4 text-xl">{p.t}</h3>
                <p className="mt-2 text-muted-foreground">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-20 md:grid-cols-2">
        {[
          { t: "Para o paciente", I: Moon, cls: "bg-primary-soft", itens: ["Saber se, quando e onde será atendido", "Ver em que etapa está o encaminhamento", "Sem madrugar na porta da UBS", "Um familiar pode acompanhar por você"] },
          { t: "Para o município", I: Building2, cls: "bg-secondary", itens: ["Fila organizada e transparente", "Menos retrabalho administrativo", "Vagas de faltantes reaproveitadas", "Dados para planejar a oferta", "Resposta à pressão da população e da mídia"] },
        ].map((c) => (
          <div key={c.t} className={`rounded-3xl p-8 ${c.cls}`}>
            <c.I className="size-8 text-primary-deep" />
            <h3 className="mt-3 text-2xl">{c.t}</h3>
            <ul className="mt-5 space-y-3">
              {c.itens.map((i) => <li key={i} className="flex gap-3"><CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />{i}</li>)}
            </ul>
          </div>
        ))}
      </section>

      <section id="comparativo" className="bg-card py-20">
        <div className="mx-auto max-w-6xl px-4">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Posicionamento</p>
          <h2 className="mt-2 text-3xl font-bold md:text-4xl">Ninguém une transparência, rastreio e WhatsApp</h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="bg-muted text-left">
                  <th className="p-3 font-semibold">Critério</th>
                  {COLS.map((c, i) => <th key={c} className={`p-3 font-semibold ${i === 0 ? "bg-primary text-primary-foreground" : ""}`}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {LINHAS.map((l) => (
                  <tr key={l.crit} className="border-t">
                    <td className="p-3 font-semibold">{l.crit}</td>
                    {l.v.map(([c, t], i) => (
                      <td key={i} className={`p-3 ${i === 0 ? "bg-primary-soft font-semibold" : ""}`}>
                        <span className="flex items-center gap-2"><Marca c={c} />{t}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">✔ Sim · ◐ Parcial · ✖ Não</p>
        </div>
      </section>

      <section id="modelo" className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Modelo de negócio</p>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">A prefeitura contrata. O cidadão usa de graça.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <p className="text-sm text-muted-foreground">Implantação (única)</p>
            <p className="mt-1 text-3xl font-bold">{fmtBRL(12000)}</p>
            <p className="mt-2 text-sm text-muted-foreground">Integração, treinamento e configuração das UBS.</p>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <p className="text-sm text-muted-foreground">Licença mensal</p>
            <p className="mt-1 text-3xl font-bold">{fmtBRL(3900)}</p>
            <p className="text-sm text-muted-foreground">até 20 mil habitantes</p>
            <p className="mt-2 text-xl font-bold">{fmtBRL(5400)}</p>
            <p className="text-sm text-muted-foreground">20 a 50 mil habitantes</p>
          </div>
          <div className="rounded-2xl bg-brand p-6 text-primary-foreground shadow-lift">
            <p className="text-sm opacity-90">Estratégia</p>
            <p className="mt-1 text-2xl font-bold">Piloto em Diamantina-MG</p>
            <p className="mt-2 opacity-90">Expansão por consórcios intermunicipais de saúde, licitação, dispensa por valor e CPSI (Marco Legal das Startups).</p>
          </div>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[["5.570", "municípios no Brasil", "TAM"], ["4.914", "municípios com até 50 mil hab.", "SAM"], ["12", "municípios em 3 anos", "Meta"]].map(([n, t, l]) => (
            <div key={l} className="rounded-2xl border-2 border-primary/20 bg-primary-soft p-6 text-center">
              <span className="rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-primary-foreground">{l}</span>
              <p className="mt-3 text-4xl font-bold text-primary-deep">{n}</p>
              <p className="text-muted-foreground">{t}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary-deep py-16 text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 text-center">
          <CalendarCheck className="size-10" />
          <h2 className="text-3xl font-bold">Experimente a demonstração</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="secondary" size="lg"><Link to="/paciente">Portal do paciente</Link></Button>
            <Button asChild variant="secondary" size="lg"><Link to="/whatsapp">WhatsApp</Link></Button>
            <Button asChild variant="secondary" size="lg"><Link to="/gestao">Painel da Secretaria</Link></Button>
          </div>
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-muted-foreground md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-2">Protótipo acadêmico — Disciplina de Empreendedorismo — Sistemas de Informação.</p>
            <p className="mt-1 font-semibold text-foreground">Dados fictícios para fins de demonstração.</p>
          </div>
          <div>
            <p className="font-semibold text-foreground">Equipe</p>
            <p className="mt-1">Ana Júlia Oliveira Araújo, Ana Clara Rolim de Azevedo, Augusto Henrique Santos de Oliveira, Camila Santos Barbosa, Deivid Camargos Batista e Filipe Hipólito Diniz Durães.</p>
            <p className="mt-1">Profa. Cinthya Rocha Tameirão.</p>
          </div>
          <div className="flex gap-3">
            <ShieldCheck className="size-6 shrink-0 text-primary" />
            <p>LGPD: dados de saúde são sensíveis (art. 11). Usamos apenas para acompanhar atendimentos, com consentimento, registro de acesso e política de retenção definida pelo município.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
