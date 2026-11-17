import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  MapPin,
  Clock,
  Search,
  ClipboardList,
  Users,
  CheckCircle2,
  XCircle,
  Bell,
  ListOrdered,
  Stethoscope,
  Sparkles,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { useApp, usePacienteAtivo } from "@/store/app";
import { filaDeEspera, servicoById, ubsById, ubsDeReferencia } from "@/data/mock";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fmtDiaSemana, primeiroNome } from "@/lib/format";
import { ConfBadge } from "@/components/app/StatusBadge";

export const Route = createFileRoute("/paciente/")({ component: Inicio });

function Inicio() {
  const { ativo, titular, acompanhando } = usePacienteAtivo();
  const encs = useApp((s) => s.encaminhamentos);
  const notifs = useApp((s) => s.notificacoes);
  const confirmar = useApp((s) => s.confirmarPresenca);
  const liberar = useApp((s) => s.liberarVaga);
  if (!ativo || !titular) return null;

  const meus = encs.filter((e) => e.pacienteId === ativo.id && !e.cancelado);
  const prox = meus
    .filter(
      (e) =>
        e.etapaAtual === "agendado" &&
        e.agendamento &&
        ["pendente", "confirmada", "sem_resposta"].includes(e.agendamento.status),
    )
    .sort((a, b) => a.agendamento!.data.localeCompare(b.agendamento!.data))[0];
  const espera = meus.find((e) => e.posicaoFila);
  const aviso = notifs.find((n) => n.pacienteId === ativo.id && !n.lida);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl">Olá, {primeiroNome(titular.nome)}! 👋</h1>
      {acompanhando && (
        <p className="-mt-3 text-muted-foreground">
          Vendo os atendimentos de {primeiroNome(ativo.nome)}.
        </p>
      )}
      <p className="-mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Lock className="size-4 shrink-0" />
        UBS de Referência: <b className="text-foreground">{ubsDeReferencia(ativo).nome}</b> ·
        definida pelo seu endereço
      </p>

      {aviso && (
        <Link
          to="/paciente/avisos"
          className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success-soft p-4 text-success"
        >
          <Bell className="size-6 shrink-0" />
          <span className="font-semibold">
            {aviso.titulo}
            <span className="block text-sm font-normal text-foreground">{aviso.texto}</span>
          </span>
        </Link>
      )}

      {prox ? (
        <section
          className="overflow-hidden rounded-3xl bg-brand text-primary-foreground shadow-lift"
          aria-label="Meu próximo atendimento"
        >
          <div className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold opacity-90">Meu próximo atendimento</p>
              <span className="rounded-full bg-card">
                <ConfBadge s={prox.agendamento!.status} />
              </span>
            </div>
            <p className="mt-1 text-2xl font-bold">{servicoById(prox.servicoId).nome}</p>
            <ul className="mt-3 space-y-1.5">
              <li className="flex items-center gap-2">
                <CalendarDays className="size-5" />
                {fmtDiaSemana(prox.agendamento!.data)}
              </li>
              <li className="flex items-center gap-2">
                <Clock className="size-5" />
                {prox.agendamento!.hora}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="size-5" />
                {ubsById(prox.agendamento!.ubsId).nome}
              </li>
            </ul>
          </div>
          <div className="space-y-2 bg-card p-4">
            {prox.agendamento!.status === "confirmada" ? (
              <p className="flex items-center justify-center gap-2 py-3 text-lg font-bold text-success">
                <CheckCircle2 className="size-6" />
                Presença confirmada
              </p>
            ) : (
              <Button
                size="xl"
                variant="success"
                className="w-full"
                onClick={() => {
                  confirmar(prox.id);
                  toast.success("Presença confirmada! Até lá 💚");
                }}
              >
                <CheckCircle2 />
                Confirmar presença
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="xl" variant="outline" className="w-full text-foreground">
                  <XCircle />
                  Não vou poder ir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Liberar sua vaga?</AlertDialogTitle>
                  <AlertDialogDescription>
                    A vaga vai para a próxima pessoa da fila. Você pode entrar na lista de novo
                    depois.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Voltar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      liberar(prox.id);
                      toast.success("Vaga liberada. Obrigado por avisar! 💚");
                    }}
                  >
                    Sim, liberar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      ) : espera ? (
        <section className="rounded-3xl border-2 border-primary/30 bg-primary-soft p-5">
          <ListOrdered className="size-8 text-primary" />
          <p className="mt-2 text-xl font-bold">Você está na lista de espera</p>
          <p className="mt-1 text-lg">
            {servicoById(espera.servicoId).nome} — posição <b>{espera.posicaoFila}</b> de{" "}
            {filaDeEspera(encs, espera.servicoId).length}
          </p>
        </section>
      ) : (
        <section className="rounded-3xl border bg-card p-5 text-center">
          <CalendarDays className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-2 font-semibold">Nenhum atendimento marcado</p>
        </section>
      )}

      <div className="grid gap-3">
        {[
          { to: "/paciente/vagas", I: Search, t: "Agendar Clínico Geral" },
          { to: "/paciente/encaminhamentos", I: Stethoscope, t: "Acompanhar encaminhamentos" },
          { to: "/paciente/pedidos", I: ClipboardList, t: "Acompanhar meu pedido" },
          { to: "/paciente/familia", I: Users, t: "Acompanhar um familiar" },
        ].map((a) => (
          <Link
            key={a.to}
            to={a.to}
            className="flex min-h-16 items-center gap-4 rounded-2xl border bg-card p-4 text-lg font-bold shadow-soft transition-transform hover:-translate-y-0.5"
          >
            <span
              className="grid size-12 place-items-center rounded-xl bg-primary-soft text-primary"
              aria-hidden
            >
              <a.I className="size-6" />
            </span>
            {a.t}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-secondary p-4 text-secondary-foreground">
        <Sparkles className="size-6 shrink-0" />
        <p className="font-semibold">Mais agilidade e transparência no seu atendimento.</p>
      </div>
    </div>
  );
}
