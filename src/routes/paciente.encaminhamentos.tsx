import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Stethoscope,
  ChevronRight,
  CalendarCheck,
  Info,
  ClipboardList,
  MapPin,
  Clock,
} from "lucide-react";
import { useApp, usePacienteAtivo } from "@/store/app";
import { servicoById, ubsById } from "@/data/mock";
import { EtapaBadge, PrioridadeBadge, ConfBadge } from "@/components/app/StatusBadge";
import { fmtDiaSemana } from "@/lib/format";

export const Route = createFileRoute("/paciente/encaminhamentos")({ component: Encaminhamentos });

/**
 * Área somente de visualização/acompanhamento.
 * Consultas com especialistas NÃO são agendadas pelo paciente: o pedido é feito pelo
 * médico da UBS e o agendamento é realizado internamente pela Secretaria de Saúde / Central de Vagas.
 * Ao paciente, cabe acompanhar o status e ver data/hora/local quando a vaga for confirmada.
 */
function Encaminhamentos() {
  const { ativo } = usePacienteAtivo();
  const encs = useApp((s) => s.encaminhamentos);
  if (!ativo) return null;
  // Apenas encaminhamentos para especialistas e exames referenciados (não agendáveis diretamente).
  const meus = encs
    .filter(
      (e) =>
        e.pacienteId === ativo.id && !e.cancelado && !servicoById(e.servicoId).agendamentoDireto,
    )
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl">Meus encaminhamentos</h1>
        <p className="mt-1 text-muted-foreground">
          Consultas com especialistas e exames solicitados pelo seu médico.
        </p>
      </div>

      <div
        className="flex items-start gap-3 rounded-2xl border border-info/30 bg-info-soft p-4 text-info"
        role="note"
      >
        <Info className="mt-0.5 size-6 shrink-0" aria-hidden />
        <div className="text-sm leading-snug">
          <p className="font-bold">Como funciona o agendamento de especialistas</p>
          <p className="mt-1 text-foreground">
            O pedido é feito pelo médico da sua UBS. O agendamento é realizado internamente pela{" "}
            <b>Secretaria de Saúde / Central de Vagas</b>, conforme a disponibilidade e a prioridade
            clínica. Você não marca horário diretamente — aqui você apenas acompanha o status e vê{" "}
            <b>data, hora e local</b> quando a vaga for confirmada.
          </p>
        </div>
      </div>

      {meus.length === 0 && (
        <div className="rounded-2xl border border-dashed p-8 text-center">
          <Stethoscope className="mx-auto size-12 text-muted-foreground" />
          <p className="mt-2 font-semibold">Nenhum encaminhamento no momento</p>
          <p className="mt-1 text-muted-foreground">
            Quando o médico da sua UBS solicitar uma consulta com especialista, ela aparecerá aqui.
          </p>
          <Link
            to="/paciente/pedidos"
            className="mt-4 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <ClipboardList className="size-4" />
            Ver todos os meus pedidos
          </Link>
        </div>
      )}

      {meus.map((e) => {
        const s = servicoById(e.servicoId);
        const ag = e.agendamento;
        const confirmado =
          e.etapaAtual === "agendado" &&
          ag &&
          ["confirmada", "pendente", "sem_resposta"].includes(ag.status);
        return (
          <Link
            key={e.id}
            to="/paciente/pedidos/$id"
            params={{ id: e.id }}
            className="block rounded-2xl border bg-card p-4 shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Encaminhamento · {e.protocolo}</p>
                <h2 className="text-lg">{s.nome}</h2>
                <p className="text-sm text-muted-foreground">
                  Solicitado pelo médico da {ubsById(e.ubsOrigemId).nome}
                </p>
              </div>
              <ChevronRight className="size-6 shrink-0 text-muted-foreground" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <EtapaBadge etapa={e.etapaAtual} />
              <PrioridadeBadge p={e.prioridade} short />
            </div>
            {confirmado ? (
              <div className="mt-3 rounded-xl bg-success-soft p-3 text-success">
                <p className="flex items-center gap-2 font-bold">
                  <CalendarCheck className="size-5" aria-hidden />
                  Vaga confirmada pela Central de Vagas
                </p>
                <ul className="mt-1.5 space-y-1 text-sm font-semibold text-foreground">
                  <li className="flex items-center gap-1.5">
                    <CalendarCheck className="size-4 text-muted-foreground" />
                    {fmtDiaSemana(ag!.data)} às {ag!.hora}
                  </li>
                  <li className="flex items-center gap-1.5">
                    <MapPin className="size-4 text-muted-foreground" />
                    {ubsById(ag!.ubsId).nome}
                  </li>
                </ul>
                <div className="mt-2">
                  <ConfBadge s={ag!.status} />
                </div>
              </div>
            ) : (
              <p className="mt-3 flex items-center gap-2 rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                <Clock className="size-4 shrink-0" aria-hidden />
                Aguardando a Secretaria de Saúde / Central de Vagas confirmar a vaga. Você será
                avisado por WhatsApp.
              </p>
            )}
          </Link>
        );
      })}

      <p className="text-center text-xs text-muted-foreground">
        Esta área é apenas para acompanhamento. Nenhuma ação de agendamento é necessária aqui.
      </p>
    </div>
  );
}
