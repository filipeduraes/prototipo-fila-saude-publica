import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  MapPin,
  Clock,
  RefreshCw,
  CheckCircle2,
  ListPlus,
  CalendarPlus,
  Loader2,
  MessageCircle,
  Lock,
  Stethoscope,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { useApp, usePacienteAtivo } from "@/store/app";
import {
  SERVICO_AGENDAMENTO_DIRETO,
  ubsById,
  ubsDeReferencia,
  servicoById,
  type Encaminhamento,
} from "@/data/mock";
import { Button } from "@/components/ui/button";
import { SemaforoBadge } from "@/components/app/StatusBadge";
import { cn } from "@/lib/utils";
import { fmtData, primeiroNome } from "@/lib/format";

export const Route = createFileRoute("/paciente/vagas")({ component: Vagas });

function Vagas() {
  const { titular, ativo } = usePacienteAtivo();
  const pacientes = useApp((s) => s.pacientes);
  const ofertas = useApp((s) => s.ofertas);
  const entrar = useApp((s) => s.entrarFila);
  const [para, setPara] = useState<string>(ativo?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<Encaminhamento | null>(null);
  if (!titular) return null;
  const paraId = para || titular.id;
  const paraPaciente = pacientes.find((p) => p.id === paraId) ?? titular;
  // Regra SUS: só é possível agendar o Clínico Geral, na UBS de Referência definida pelo endereço/CEP.
  const ref = ubsDeReferencia(paraPaciente);
  const servicoId = SERVICO_AGENDAMENTO_DIRETO;
  const oferta = ofertas.find((o) => o.ubsId === ref.id && o.servicoId === servicoId);
  const familiares = pacientes.filter((p) => titular.cuidadorDeIds?.includes(p.id));
  const livres = oferta ? oferta.cotaDia - oferta.ocupadasHoje : 0;
  const semana = oferta ? Math.max(0, oferta.cotaSemana - oferta.ocupadasSemana) : 0;

  function acao(reservar: boolean) {
    setLoading(true);
    setTimeout(() => {
      const e = entrar({ pacienteId: paraId, servicoId, ubsId: ref.id, reservar });
      setLoading(false);
      setOk(e);
      toast.success(
        reservar
          ? "Consulta agendada na sua UBS de Referência!"
          : "Você entrou na lista de espera!",
      );
    }, 900);
  }

  if (ok) {
    const pos = ok.posicaoFila ?? 1;
    return (
      <div className="flex flex-col items-center text-center">
        <span className="mt-4 grid size-24 animate-pop place-items-center rounded-full bg-success text-success-foreground shadow-lift">
          <CheckCircle2 className="size-14" />
        </span>
        <h1 className="mt-5 text-2xl">
          {ok.agendamento ? "Consulta agendada!" : "Você está na lista!"}
        </h1>
        <div className="mt-5 w-full space-y-3 rounded-2xl border bg-card p-5 text-left">
          <p className="text-sm text-muted-foreground">Protocolo</p>
          <p className="text-2xl font-bold tracking-wide">{ok.protocolo}</p>
          <p>
            <b>{servicoById(ok.servicoId).nome}</b> · {ubsById(ok.ubsOrigemId).nome}
          </p>
          {ok.agendamento ? (
            <p className="text-lg">
              🗓️ {fmtData(ok.agendamento.data)} às {ok.agendamento.hora}
            </p>
          ) : (
            <>
              <p className="text-lg">
                Posição na fila: <b>{pos}</b>
              </p>
              <p className="text-lg">
                Previsão:{" "}
                <b>
                  {Math.ceil(pos / 6)} a {Math.ceil(pos / 6) + 6} dias
                </b>
              </p>
            </>
          )}
        </div>
        <p className="mt-5 flex items-center gap-2 rounded-2xl bg-secondary p-4 text-left font-semibold text-secondary-foreground">
          <MessageCircle className="size-6 shrink-0" />
          Avisaremos por WhatsApp na véspera da consulta.
        </p>
        <div className="mt-5 grid w-full gap-3">
          <Button asChild size="xl">
            <Link to="/paciente/pedidos">Ver meus pedidos</Link>
          </Button>
          <Button size="xl" variant="outline" onClick={() => setOk(null)}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl">Agendar Clínico Geral</h1>
        <p className="mt-1 text-muted-foreground">
          Consulta com o Clínico Geral (Médico de Saúde da Família) da sua UBS de Referência.
        </p>
      </div>

      {familiares.length > 0 && (
        <fieldset>
          <legend className="mb-2 font-semibold">Para quem é?</legend>
          <div className="grid grid-cols-2 gap-2">
            {[titular, ...familiares].map((p) => (
              <button
                key={p.id}
                onClick={() => setPara(p.id)}
                aria-pressed={paraId === p.id}
                className={cn(
                  "min-h-14 rounded-xl border-2 px-3 font-semibold",
                  paraId === p.id ? "border-primary bg-primary-soft text-primary-deep" : "bg-card",
                )}
              >
                {p.id === titular.id
                  ? "Para mim"
                  : `${primeiroNome(p.nome)} (${p.parentesco ?? "familiar"})`}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* UBS de Referência: bloqueada, definida pelo endereço/CEP */}
      <section
        className="rounded-2xl border-2 border-primary/25 bg-primary-soft p-4"
        aria-label="UBS de Referência"
      >
        <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-primary-deep">
          <Lock className="size-4" />
          UBS de Referência
        </p>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg">{ref.nome}</h2>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {ref.bairro} · definida pelo seu endereço ({paraPaciente.endereco} · CEP{" "}
              {paraPaciente.cep})
            </p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="size-4" />
              {ref.horario} · {ref.telefone}
            </p>
          </div>
          {oferta && <SemaforoBadge livres={livres} big />}
        </div>
        <p className="mt-2 text-sm text-primary-deep">
          Definida automaticamente com base no seu endereço/CEP. O agendamento é feito
          exclusivamente nesta unidade.
        </p>
      </section>

      {/* Só Clínico Geral: especialidades não são agendadas diretamente */}
      <div className="flex items-start gap-3 rounded-2xl border bg-card p-4 text-sm text-muted-foreground">
        <Stethoscope className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
        <p>
          <b className="text-foreground">Atendimento disponível para agendamento direto:</b> Clínico
          Geral / Médico de Saúde da Família.
          <br />
          Consultas com especialistas (Cardiologia, Oftalmologia etc.) não são agendadas
          diretamente: elas são solicitadas pelo médico da UBS e marcadas internamente pela
          Secretaria de Saúde/Central de Vagas.{" "}
          <Link
            to="/paciente/encaminhamentos"
            className="font-semibold text-primary hover:underline"
          >
            Acompanhe seus encaminhamentos
          </Link>
          .
        </p>
      </div>

      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <RefreshCw className="size-4" />
        Atualizado há 2 min
      </p>

      {oferta ? (
        <article className="rounded-2xl border bg-card p-4 shadow-soft">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-muted p-2">
              <p className="text-2xl font-bold">{livres}</p>
              <p className="text-sm text-muted-foreground">vagas hoje</p>
            </div>
            <div className="rounded-xl bg-muted p-2">
              <p className="text-2xl font-bold">{semana}</p>
              <p className="text-sm text-muted-foreground">esta semana</p>
            </div>
          </div>
          <Button
            size="xl"
            variant={livres > 0 ? "default" : "secondary"}
            className="mt-3 w-full"
            disabled={loading}
            onClick={() => acao(livres > 0)}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : livres > 0 ? (
              <CalendarPlus />
            ) : (
              <ListPlus />
            )}
            {livres > 0 ? "Agendar Clínico Geral" : "Entrar na lista de espera digital"}
          </Button>
        </article>
      ) : (
        <div className="rounded-2xl border border-dashed p-6 text-center">
          <Info className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-2 font-semibold">Sem agenda disponível na sua UBS de Referência hoje.</p>
          <p className="text-muted-foreground">
            Fale com a recepção da {ref.nome} para mais informações.
          </p>
        </div>
      )}
    </div>
  );
}
