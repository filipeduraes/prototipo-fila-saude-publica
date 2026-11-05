import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addDays } from "date-fns";
import {
  gerarDados, recalcPosicoes, filaDeEspera, calcPrazoExcedido, servicoById, ubsById, iso, dia,
  type DadosDemo, type Encaminhamento, type Prioridade, type Canal, type Etapa, type Paciente, type Notificacao,
} from "@/data/mock";
import { mascararNome, primeiroNome } from "@/lib/format";

export interface WaMsg { id: string; from: "bot" | "user"; text: string; time: string; options?: { label: string; value: string }[] }

interface Prefs { letraGrande: boolean; altoContraste: boolean; canal: Canal }

interface State extends DadosDemo {
  hydrated: boolean;
  sessao: { pacienteId: string | null; acompanhandoId: string | null };
  prefs: Prefs;
  reaproveitadasExtra: number;
  autoRedistribuir: boolean;
  wa: WaMsg[];
  integracoes: Record<string, "conectado" | "disponivel" | "configurar">;
  // ações
  login: (id: string) => void;
  logout: () => void;
  acompanhar: (id: string | null) => void;
  setPrefs: (p: Partial<Prefs>) => void;
  entrarFila: (a: { pacienteId: string; servicoId: string; ubsId: string; reservar: boolean }) => Encaminhamento;
  confirmarPresenca: (encId: string) => void;
  liberarVaga: (encId: string) => void;
  redistribuir: (encId: string) => { nome: string } | null;
  pedirAjuda: (encId: string) => void;
  cancelarPedido: (encId: string) => void;
  cobrar: (encId: string) => void;
  priorizar: (encId: string) => void;
  avancar: (encId: string) => void;
  reencaminhar: (encId: string, ubsId: string) => void;
  setCota: (ubsId: string, servicoId: string, cota: number) => void;
  abrirExtras: (ubsId: string, servicoId: string, n: number) => void;
  cadastrarEncaminhamento: (a: { pacienteId: string; servicoId: string; ubsId: string; prioridade: Prioridade; observacao: string }) => Encaminhamento;
  checkin: (encId: string) => void;
  marcarFalta: (encId: string) => void;
  marcarLida: (id: string) => void;
  marcarTodasLidas: (pacienteId: string) => void;
  addFamiliar: (cuidadorId: string, f: { nome: string; parentesco: string; cns: string; idade: number }) => void;
  resolverAlerta: (id: string) => void;
  addAlerta: (a: { tipo: "parado" | "ajuda" | "ubs" | "integracao"; severidade: "alta" | "media" | "baixa"; titulo: string; descricao: string; encId?: string }) => void;
  toggleAuto: () => void;
  setIntegracao: (k: string, v: "conectado" | "disponivel" | "configurar") => void;
  waPush: (m: Omit<WaMsg, "id" | "time">) => void;
  waReset: () => void;
  reset: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 9);
const nowIso = () => new Date().toISOString();
const hhmm = () => new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

export const WA_INICIAL = (): WaMsg[] => [
  { id: "w0", from: "bot", time: hhmm(), text: "Olá, Maria! 👋 Eu sou o assistente da Saúde de Diamantina. O que você precisa?", options: MENU },
];
export const MENU = [
  { label: "1️⃣ Ver vagas", value: "vagas" },
  { label: "2️⃣ Meu pedido", value: "pedido" },
  { label: "3️⃣ Confirmar presença", value: "presenca" },
  { label: "4️⃣ Falar com a UBS", value: "ubs" },
];

const INTEGRACOES_INI = { esus: "conectado", sisreg: "disponivel", proprio: "configurar", whatsapp: "conectado", sms: "conectado" } as const;

let seqProt = 4900;

function mapEnc(s: State, id: string, fn: (e: Encaminhamento) => Encaminhamento) {
  const encaminhamentos = s.encaminhamentos.map((e) => (e.id === id ? fn({ ...e }) : e));
  recalcPosicoes(encaminhamentos);
  encaminhamentos.forEach((e) => (e.prazoExcedido = calcPrazoExcedido(e)));
  return encaminhamentos;
}
function notif(pacienteId: string, tipo: Notificacao["tipo"], titulo: string, texto: string): Notificacao {
  return { id: uid(), pacienteId, tipo, titulo, texto, data: nowIso(), lida: false };
}
const atv = (texto: string) => ({ id: uid(), texto, data: nowIso() });

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      ...gerarDados(),
      hydrated: false,
      sessao: { pacienteId: null, acompanhandoId: null },
      prefs: { letraGrande: false, altoContraste: false, canal: "whatsapp" },
      reaproveitadasExtra: 0,
      autoRedistribuir: true,
      wa: WA_INICIAL(),
      integracoes: { ...INTEGRACOES_INI },

      login: (id) => set({ sessao: { pacienteId: id, acompanhandoId: null } }),
      logout: () => set({ sessao: { pacienteId: null, acompanhandoId: null } }),
      acompanhar: (id) => set((s) => ({ sessao: { ...s.sessao, acompanhandoId: id } })),
      setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),

      entrarFila: ({ pacienteId, servicoId, ubsId, reservar }) => {
        const s = get();
        const criado = new Date();
        const etapa: Etapa = reservar ? "agendado" : "solicitado";
        const historico = reservar
          ? (["solicitado", "em_analise", "autorizado", "agendado"] as Etapa[]).map((et) => ({ etapa: et, data: iso(criado), responsavel: et === "solicitado" ? "Pedido pelo FilaZero" : "Reserva automática" }))
          : [{ etapa: "solicitado" as Etapa, data: iso(criado), responsavel: "Pedido pelo FilaZero (lista digital)" }];
        const enc: Encaminhamento = {
          id: `e${uid()}`, protocolo: `FZ-2026-00${seqProt++}`, pacienteId, servicoId, ubsOrigemId: ubsId,
          etapaAtual: etapa, prioridade: "verde", criadoEm: iso(criado), historico, prazoExcedido: false,
          agendamento: reservar ? { data: dia(addDays(criado, 1)), hora: "08:30", ubsId, status: "pendente" } : undefined,
        };
        const encaminhamentos = [...s.encaminhamentos, enc];
        recalcPosicoes(encaminhamentos);
        const pac = s.pacientes.find((p) => p.id === pacienteId)!;
        const sv = servicoById(servicoId).nome;
        set({
          encaminhamentos,
          ofertas: reservar ? s.ofertas.map((o) => (o.ubsId === ubsId && o.servicoId === servicoId ? { ...o, ocupadasHoje: o.ocupadasHoje + 1, ocupadasSemana: o.ocupadasSemana + 1 } : o)) : s.ofertas,
          notificacoes: [notif(pacienteId, reservar ? "agendado" : "info", reservar ? "Vaga reservada 🗓️" : "Você entrou na lista de espera", reservar ? `${sv} amanhã às 08:30 na ${ubsById(ubsId).nome}.` : `${sv}: posição ${enc.posicaoFila} na fila. Avisaremos por WhatsApp.`), ...s.notificacoes],
          atividades: [atv(`${mascararNome(pac.nome)} ${reservar ? "reservou vaga de" : "entrou na lista digital de"} ${sv} (${ubsById(ubsId).nome})`), ...s.atividades],
        });
        return get().encaminhamentos.find((e) => e.id === enc.id)!;
      },

      confirmarPresenca: (encId) => set((s) => {
        const e = s.encaminhamentos.find((x) => x.id === encId)!;
        const p = s.pacientes.find((x) => x.id === e.pacienteId)!;
        return {
          encaminhamentos: mapEnc(s, encId, (x) => ({ ...x, agendamento: x.agendamento && { ...x.agendamento, status: "confirmada" } })),
          atividades: [atv(`${mascararNome(p.nome)} confirmou presença em ${servicoById(e.servicoId).nome}`), ...s.atividades],
        };
      }),

      liberarVaga: (encId) => {
        const s = get();
        const e = s.encaminhamentos.find((x) => x.id === encId)!;
        const p = s.pacientes.find((x) => x.id === e.pacienteId)!;
        set({
          encaminhamentos: mapEnc(s, encId, (x) => ({ ...x, agendamento: x.agendamento && { ...x.agendamento, status: "liberada" } })),
          atividades: [atv(`${mascararNome(p.nome)} liberou a vaga de ${servicoById(e.servicoId).nome} — vaga disponível para redistribuição`), ...s.atividades],
          notificacoes: [notif(p.id, "info", "Vaga liberada", `Você liberou sua vaga de ${servicoById(e.servicoId).nome}. Obrigado por avisar!`), ...s.notificacoes],
        });
        if (get().autoRedistribuir) setTimeout(() => get().redistribuir(encId), 2500);
      },

      redistribuir: (encId) => {
        const s = get();
        const e = s.encaminhamentos.find((x) => x.id === encId);
        if (!e?.agendamento || !["liberada", "cancelada", "sem_resposta", "falta"].includes(e.agendamento.status)) return null;
        const prox = filaDeEspera(s.encaminhamentos, e.servicoId).find((x) => x.pacienteId !== e.pacienteId);
        if (!prox) return null;
        const pac = s.pacientes.find((p) => p.id === prox.pacienteId)!;
        const ag = e.agendamento;
        let encaminhamentos = mapEnc(s, encId, (x) => ({ ...x, agendamento: { ...ag, status: "redistribuida", redistribuidaPara: mascararNome(pac.nome) } }));
        encaminhamentos = mapEnc({ ...s, encaminhamentos }, prox.id, (x) => ({
          ...x, etapaAtual: "agendado",
          historico: [...x.historico, { etapa: "agendado", data: nowIso(), responsavel: "Redistribuição automática FilaZero", nota: "Vaga liberada por outro paciente" }],
          agendamento: { data: ag.data, hora: ag.hora, ubsId: ag.ubsId, status: "pendente" },
        }));
        set({
          encaminhamentos,
          reaproveitadasExtra: s.reaproveitadasExtra + 1,
          notificacoes: [notif(pac.id, "vaga", "🎉 Uma vaga abriu para você", `${servicoById(e.servicoId).nome} em ${ag.data.split("-").reverse().join("/")} às ${ag.hora}, ${ubsById(ag.ubsId).nome}. Confirme em até 30 min.`), ...s.notificacoes],
          atividades: [atv(`Vaga de ${servicoById(e.servicoId).nome} da ${ubsById(ag.ubsId).nome} redistribuída para ${mascararNome(pac.nome)} em 2 min`), ...s.atividades],
        });
        return { nome: mascararNome(pac.nome) };
      },

      pedirAjuda: (encId) => set((s) => {
        const e = s.encaminhamentos.find((x) => x.id === encId)!;
        const p = s.pacientes.find((x) => x.id === e.pacienteId)!;
        return {
          encaminhamentos: mapEnc(s, encId, (x) => ({ ...x, ajudaPedida: true })),
          alertas: [{ id: uid(), tipo: "ajuda", severidade: "alta", titulo: `Pedido de ajuda — ${servicoById(e.servicoId).nome}`, descricao: `${mascararNome(p.nome)} pediu ajuda sobre o pedido ${e.protocolo} (parado em "${e.etapaAtual.replace("_", " ")}").`, data: nowIso(), resolvido: false, encId }, ...s.alertas],
        };
      }),
      cancelarPedido: (encId) => set((s) => ({ encaminhamentos: mapEnc(s, encId, (x) => ({ ...x, cancelado: true })) })),
      cobrar: (encId) => set((s) => {
        const e = s.encaminhamentos.find((x) => x.id === encId)!;
        return {
          encaminhamentos: mapEnc(s, encId, (x) => ({ ...x, historico: x.historico.map((h, i) => (i === x.historico.length - 1 ? { ...h, nota: `Andamento cobrado pela Secretaria em ${new Date().toLocaleDateString("pt-BR")}` } : h)) })),
          atividades: [atv(`Secretaria cobrou andamento do pedido ${e.protocolo}`), ...s.atividades],
        };
      }),
      priorizar: (encId) => set((s) => ({ encaminhamentos: mapEnc(s, encId, (x) => ({ ...x, prioridade: x.prioridade === "azul" ? "verde" : x.prioridade === "verde" ? "amarelo" : "vermelho" })) })),
      avancar: (encId) => set((s) => {
        const e = s.encaminhamentos.find((x) => x.id === encId)!;
        const ordem: Etapa[] = ["solicitado", "em_analise", "autorizado", "agendado", "realizado"];
        const prox = ordem[Math.min(4, ordem.indexOf(e.etapaAtual) + 1)];
        const titulo: Record<Etapa, string> = { solicitado: "", em_analise: "Pedido em análise", autorizado: "Pedido autorizado ✅", agendado: "Consulta agendada 🗓️", realizado: "Atendimento realizado" };
        return {
          encaminhamentos: mapEnc(s, encId, (x) => ({
            ...x, etapaAtual: prox,
            historico: [...x.historico, { etapa: prox, data: nowIso(), responsavel: prox === "agendado" ? "Central de Agendamento" : "Central de Regulação — Diamantina" }],
            agendamento: prox === "agendado" ? { data: dia(addDays(new Date(), 3)), hora: "10:00", ubsId: servicoById(x.servicoId).especialidade ? "centro" : x.ubsOrigemId, status: "pendente" } : x.agendamento,
          })),
          notificacoes: [notif(e.pacienteId, prox === "autorizado" ? "autorizado" : "agendado", titulo[prox], `Seu pedido de ${servicoById(e.servicoId).nome} avançou: ${titulo[prox]}.`), ...s.notificacoes],
        };
      }),
      reencaminhar: (encId, ubsId) => set((s) => ({ encaminhamentos: mapEnc(s, encId, (x) => ({ ...x, ubsOrigemId: ubsId, historico: [...x.historico.slice(0, -1), { ...x.historico[x.historico.length - 1], nota: `Reencaminhado para ${ubsById(ubsId).nome}` }] })) })),

      setCota: (ubsId, servicoId, cota) => set((s) => ({ ofertas: s.ofertas.map((o) => (o.ubsId === ubsId && o.servicoId === servicoId ? { ...o, cotaDia: cota, cotaSemana: Math.max(o.ocupadasSemana, cota * 5) } : o)) })),
      abrirExtras: (ubsId, servicoId, n) => set((s) => ({
        ofertas: s.ofertas.map((o) => (o.ubsId === ubsId && o.servicoId === servicoId ? { ...o, cotaDia: o.cotaDia + n, cotaSemana: o.cotaSemana + n } : o)),
        atividades: [atv(`${ubsById(ubsId).nome} abriu ${n} vagas extras de ${servicoById(servicoId).nome}`), ...s.atividades],
      })),

      cadastrarEncaminhamento: ({ pacienteId, servicoId, ubsId, prioridade, observacao }) => {
        const s = get();
        const enc: Encaminhamento = {
          id: `e${uid()}`, protocolo: `FZ-2026-00${seqProt++}`, pacienteId, servicoId, ubsOrigemId: ubsId, etapaAtual: "solicitado", prioridade,
          criadoEm: nowIso(), historico: [{ etapa: "solicitado", data: nowIso(), responsavel: `${ubsById(ubsId).nome} — Recepção` }], prazoExcedido: false, observacao,
        };
        const encaminhamentos = [...s.encaminhamentos, enc];
        recalcPosicoes(encaminhamentos);
        const p = s.pacientes.find((x) => x.id === pacienteId)!;
        set({
          encaminhamentos,
          notificacoes: [notif(pacienteId, "info", "Novo pedido registrado 📋", `A ${ubsById(ubsId).nome} registrou seu pedido de ${servicoById(servicoId).nome}. Protocolo ${enc.protocolo}.`), ...s.notificacoes],
          atividades: [atv(`${ubsById(ubsId).nome} cadastrou encaminhamento de ${servicoById(servicoId).nome} para ${mascararNome(p.nome)}`), ...s.atividades],
        });
        return get().encaminhamentos.find((e) => e.id === enc.id)!;
      },
      checkin: (encId) => set((s) => ({
        encaminhamentos: mapEnc(s, encId, (x) => ({ ...x, etapaAtual: "realizado", historico: [...x.historico, { etapa: "realizado", data: nowIso(), responsavel: `Check-in na ${ubsById(x.agendamento?.ubsId ?? x.ubsOrigemId).nome}` }], agendamento: x.agendamento && { ...x.agendamento, status: "compareceu" } })),
      })),
      marcarFalta: (encId) => {
        set((s) => ({ encaminhamentos: mapEnc(s, encId, (x) => ({ ...x, agendamento: x.agendamento && { ...x.agendamento, status: "falta" } })) }));
      },
      marcarLida: (id) => set((s) => ({ notificacoes: s.notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n)) })),
      marcarTodasLidas: (pid) => set((s) => ({ notificacoes: s.notificacoes.map((n) => (n.pacienteId === pid ? { ...n, lida: true } : n)) })),
      addFamiliar: (cuidadorId, f) => set((s) => {
        const novo: Paciente = { id: `p${uid()}`, nome: f.nome, idade: f.idade, cns: f.cns, telefone: s.pacientes.find((p) => p.id === cuidadorId)!.telefone, bairro: "Centro", canal: "whatsapp", parentesco: f.parentesco };
        return { pacientes: [...s.pacientes.map((p) => (p.id === cuidadorId ? { ...p, cuidadorDeIds: [...(p.cuidadorDeIds ?? []), novo.id] } : p)), novo] };
      }),
      resolverAlerta: (id) => set((s) => ({ alertas: s.alertas.map((a) => (a.id === id ? { ...a, resolvido: true } : a)) })),
      addAlerta: (a) => set((s) => ({ alertas: [{ ...a, id: uid(), data: nowIso(), resolvido: false }, ...s.alertas] })),
      toggleAuto: () => set((s) => ({ autoRedistribuir: !s.autoRedistribuir })),
      setIntegracao: (k, v) => set((s) => ({ integracoes: { ...s.integracoes, [k]: v } })),
      waPush: (m) => set((s) => ({ wa: [...s.wa, { ...m, id: uid(), time: hhmm() }] })),
      waReset: () => set({ wa: WA_INICIAL() }),
      reset: () => set((s) => ({ ...gerarDados(), sessao: s.sessao, reaproveitadasExtra: 0, autoRedistribuir: true, wa: WA_INICIAL(), integracoes: { ...INTEGRACOES_INI } })),
    }),
    {
      name: "filazero-demo-v1",
      skipHydration: true,
      partialize: ({ hydrated: _h, ...rest }) => rest as unknown as State,
      onRehydrateStorage: () => () => useApp.setState({ hydrated: true }),
    },
  ),
);

export const primeiro = primeiroNome;

/** Paciente atualmente em foco (o próprio ou o familiar acompanhado). */
export function usePacienteAtivo() {
  const { pacienteId, acompanhandoId } = useApp((s) => s.sessao);
  const pacientes = useApp((s) => s.pacientes);
  const titular = pacientes.find((p) => p.id === pacienteId) ?? null;
  const ativo = pacientes.find((p) => p.id === (acompanhandoId ?? pacienteId)) ?? null;
  return { titular, ativo, acompanhando: !!acompanhandoId };
}

export function useKpis() {
  const encs = useApp((s) => s.encaminhamentos);
  const base = useApp((s) => s.baseFila);
  const extra = useApp((s) => s.reaproveitadasExtra);
  const abertos = encs.filter((e) => e.etapaAtual !== "realizado" && !e.cancelado).length;
  return {
    fila: base + abertos,
    parados: encs.filter((e) => e.prazoExcedido).length,
    reaproveitadas: 96 + extra,
    abertos,
  };
}
