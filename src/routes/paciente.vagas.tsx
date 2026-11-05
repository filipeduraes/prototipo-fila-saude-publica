import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Clock, RefreshCw, CheckCircle2, ListPlus, CalendarPlus, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useApp, usePacienteAtivo } from "@/store/app";
import { SERVICOS, UBS_LIST, ubsById, servicoById, type Encaminhamento } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SemaforoBadge } from "@/components/app/StatusBadge";
import { cn } from "@/lib/utils";
import { fmtData, primeiroNome } from "@/lib/format";

export const Route = createFileRoute("/paciente/vagas")({ component: Vagas });

function Vagas() {
  const { titular, ativo } = usePacienteAtivo();
  const pacientes = useApp((s) => s.pacientes);
  const ofertas = useApp((s) => s.ofertas);
  const entrar = useApp((s) => s.entrarFila);
  const [servico, setServico] = useState("clinico");
  const [ubs, setUbs] = useState("todas");
  const [para, setPara] = useState<string>(ativo?.id ?? "");
  const [loading, setLoading] = useState<string | null>(null);
  const [ok, setOk] = useState<Encaminhamento | null>(null);
  if (!titular) return null;
  const familiares = pacientes.filter((p) => titular.cuidadorDeIds?.includes(p.id));
  const lista = ofertas.filter((o) => o.servicoId === servico && (ubs === "todas" || o.ubsId === ubs));

  function acao(ubsId: string, reservar: boolean) {
    setLoading(ubsId);
    setTimeout(() => {
      const e = entrar({ pacienteId: para || titular!.id, servicoId: servico, ubsId, reservar });
      setLoading(null);
      setOk(e);
      toast.success(reservar ? "Vaga reservada!" : "Você entrou na lista de espera!");
    }, 900);
  }

  if (ok) {
    const pos = ok.posicaoFila ?? 1;
    return (
      <div className="flex flex-col items-center text-center">
        <span className="mt-4 grid size-24 animate-pop place-items-center rounded-full bg-success text-success-foreground shadow-lift"><CheckCircle2 className="size-14" /></span>
        <h1 className="mt-5 text-2xl">{ok.agendamento ? "Vaga reservada!" : "Você está na lista!"}</h1>
        <div className="mt-5 w-full space-y-3 rounded-2xl border bg-card p-5 text-left">
          <p className="text-sm text-muted-foreground">Protocolo</p>
          <p className="text-2xl font-bold tracking-wide">{ok.protocolo}</p>
          <p><b>{servicoById(ok.servicoId).nome}</b> · {ubsById(ok.ubsOrigemId).nome}</p>
          {ok.agendamento ? (
            <p className="text-lg">🗓️ {fmtData(ok.agendamento.data)} às {ok.agendamento.hora}</p>
          ) : (
            <>
              <p className="text-lg">Posição na fila: <b>{pos}</b></p>
              <p className="text-lg">Previsão: <b>{Math.ceil(pos / 6)} a {Math.ceil(pos / 6) + 6} dias</b></p>
            </>
          )}
        </div>
        <p className="mt-5 flex items-center gap-2 rounded-2xl bg-secondary p-4 text-left font-semibold text-secondary-foreground"><MessageCircle className="size-6 shrink-0" />Avisaremos por WhatsApp. Não precisa ir à UBS.</p>
        <div className="mt-5 grid w-full gap-3">
          <Button asChild size="xl"><Link to="/paciente/pedidos">Ver meus pedidos</Link></Button>
          <Button size="xl" variant="outline" onClick={() => setOk(null)}>Voltar para vagas</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Vagas disponíveis</h1>
      {familiares.length > 0 && (
        <fieldset>
          <legend className="mb-2 font-semibold">Para quem é?</legend>
          <div className="grid grid-cols-2 gap-2">
            {[titular, ...familiares].map((p) => (
              <button key={p.id} onClick={() => setPara(p.id)} aria-pressed={para === p.id}
                className={cn("min-h-14 rounded-xl border-2 px-3 font-semibold", para === p.id ? "border-primary bg-primary-soft text-primary-deep" : "bg-card")}>
                {p.id === titular.id ? "Para mim" : `${primeiroNome(p.nome)} (${p.parentesco ?? "familiar"})`}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="grid gap-3">
        <Select value={servico} onValueChange={setServico}>
          <SelectTrigger className="h-14 rounded-xl text-lg" aria-label="Atendimento"><SelectValue /></SelectTrigger>
          <SelectContent>{SERVICOS.map((s) => <SelectItem key={s.id} value={s.id} className="text-base">{s.nome}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={ubs} onValueChange={setUbs}>
          <SelectTrigger className="h-14 rounded-xl text-lg" aria-label="UBS"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas" className="text-base">Todas as UBS</SelectItem>
            {UBS_LIST.map((u) => <SelectItem key={u.id} value={u.id} className="text-base">{u.nome}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><RefreshCw className="size-4" />Atualizado há 2 min</p>

      {lista.length === 0 && (
        <div className="rounded-2xl border border-dashed p-6 text-center">
          <MapPin className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-2 font-semibold">Este atendimento não é feito nesta UBS.</p>
          <p className="text-muted-foreground">Especialidades ficam na UBS Centro e Bom Jesus.</p>
        </div>
      )}
      <div className="space-y-3">
        {lista.map((o) => {
          const u = ubsById(o.ubsId);
          const livres = o.cotaDia - o.ocupadasHoje;
          const semana = o.cotaSemana - o.ocupadasSemana;
          return (
            <article key={o.ubsId} className="rounded-2xl border bg-card p-4 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg">{u.nome}</h2>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" />{u.bairro} · {u.distancia}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground"><Clock className="size-4" />{u.horario}</p>
                </div>
                <SemaforoBadge livres={livres} big />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-muted p-2"><p className="text-2xl font-bold">{livres}</p><p className="text-sm text-muted-foreground">vagas hoje</p></div>
                <div className="rounded-xl bg-muted p-2"><p className="text-2xl font-bold">{Math.max(0, semana)}</p><p className="text-sm text-muted-foreground">esta semana</p></div>
              </div>
              <Button size="xl" variant={livres > 0 ? "default" : "secondary"} className="mt-3 w-full" disabled={loading === o.ubsId} onClick={() => acao(o.ubsId, livres > 0)}>
                {loading === o.ubsId ? <Loader2 className="animate-spin" /> : livres > 0 ? <CalendarPlus /> : <ListPlus />}
                {livres > 0 ? "Reservar vaga" : "Entrar na lista de espera digital"}
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
