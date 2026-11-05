// Todos os dados são FICTÍCIOS. Nenhum nome, CNS, CPF ou telefone é real.
import { addDays, subDays, format } from "date-fns";

export type Etapa = "solicitado" | "em_analise" | "autorizado" | "agendado" | "realizado";
export type Prioridade = "vermelho" | "amarelo" | "verde" | "azul";
export type Canal = "whatsapp" | "sms" | "app";
export type StatusConf =
  | "confirmada"
  | "pendente"
  | "cancelada"
  | "sem_resposta"
  | "liberada"
  | "redistribuida"
  | "compareceu"
  | "falta";

export interface UBS { id: string; nome: string; bairro: string; horario: string; distancia: string; telefone: string }
export interface Servico { id: string; nome: string; tipo: "consulta" | "exame" | "procedimento"; especialidade: boolean }
export interface Oferta { ubsId: string; servicoId: string; cotaDia: number; ocupadasHoje: number; cotaSemana: number; ocupadasSemana: number; profissional: string }
export interface Paciente { id: string; nome: string; idade: number; cns: string; telefone: string; bairro: string; canal: Canal; cuidadorDeIds?: string[]; parentesco?: string }
export interface Agendamento { data: string; hora: string; ubsId: string; status: StatusConf; redistribuidaPara?: string }
export interface Historico { etapa: Etapa; data: string; responsavel: string; nota?: string }
export interface Encaminhamento {
  id: string; protocolo: string; pacienteId: string; servicoId: string; ubsOrigemId: string;
  etapaAtual: Etapa; prioridade: Prioridade; posicaoFila?: number; criadoEm: string;
  historico: Historico[]; prazoExcedido: boolean; agendamento?: Agendamento; observacao?: string;
  cancelado?: boolean; ajudaPedida?: boolean;
}
export interface Notificacao { id: string; pacienteId: string; tipo: "vaga" | "autorizado" | "agendado" | "lembrete" | "confirmacao" | "remarcado" | "info"; titulo: string; texto: string; data: string; lida: boolean }
export interface Alerta { id: string; tipo: "parado" | "ajuda" | "ubs" | "integracao"; severidade: "alta" | "media" | "baixa"; titulo: string; descricao: string; data: string; resolvido: boolean; encId?: string }
export interface Atividade { id: string; texto: string; data: string }

export const ETAPAS: Etapa[] = ["solicitado", "em_analise", "autorizado", "agendado", "realizado"];
export const ETAPA_LABEL: Record<Etapa, string> = {
  solicitado: "Solicitado na UBS",
  em_analise: "Em análise",
  autorizado: "Autorizado",
  agendado: "Agendado",
  realizado: "Realizado",
};
export const ETAPA_FRASE: Record<Etapa, string> = {
  solicitado: "Seu pedido foi feito na UBS e vai seguir para a central de vagas. Normalmente leva até 3 dias.",
  em_analise: "Seu pedido está sendo analisado pela central de vagas. Normalmente leva até 5 dias.",
  autorizado: "Seu pedido foi aprovado! Agora falta marcar o dia. Normalmente leva até 7 dias.",
  agendado: "Sua consulta está marcada. Confirme sua presença quando receber o aviso.",
  realizado: "Atendimento concluído. Se precisar de retorno, a UBS vai avisar.",
};
export const PRAZO_ETAPA: Record<Etapa, number> = { solicitado: 3, em_analise: 5, autorizado: 7, agendado: 60, realizado: 999 };
export const PRIORIDADE_LABEL: Record<Prioridade, string> = { vermelho: "Vermelho · urgente", amarelo: "Amarelo · prioritário", verde: "Verde · pouco urgente", azul: "Azul · eletivo" };
export const PRIORIDADE_PESO: Record<Prioridade, number> = { vermelho: 0, amarelo: 1, verde: 2, azul: 3 };

export const UBS_LIST: UBS[] = [
  { id: "centro", nome: "UBS Centro", bairro: "Centro", horario: "07h às 19h", distancia: "1,2 km", telefone: "(38) 3531-0001" },
  { id: "bomjesus", nome: "UBS Bom Jesus", bairro: "Bom Jesus", horario: "07h às 17h", distancia: "2,8 km", telefone: "(38) 3531-0002" },
  { id: "riogrande", nome: "UBS Rio Grande", bairro: "Rio Grande", horario: "07h às 17h", distancia: "3,5 km", telefone: "(38) 3531-0003" },
  { id: "palha", nome: "UBS Palha", bairro: "Palha", horario: "07h às 16h", distancia: "4,1 km", telefone: "(38) 3531-0004" },
  { id: "vila", nome: "UBS Vila Operária", bairro: "Vila Operária", horario: "07h às 17h", distancia: "2,2 km", telefone: "(38) 3531-0005" },
];

export const SERVICOS: Servico[] = [
  { id: "clinico", nome: "Clínico Geral", tipo: "consulta", especialidade: false },
  { id: "pediatria", nome: "Pediatria", tipo: "consulta", especialidade: false },
  { id: "gineco", nome: "Ginecologia", tipo: "consulta", especialidade: false },
  { id: "odonto", nome: "Odontologia", tipo: "consulta", especialidade: false },
  { id: "cardio", nome: "Cardiologia", tipo: "consulta", especialidade: true },
  { id: "orto", nome: "Ortopedia", tipo: "consulta", especialidade: true },
  { id: "oftalmo", nome: "Oftalmologia", tipo: "consulta", especialidade: true },
  { id: "usg", nome: "Ultrassonografia", tipo: "exame", especialidade: true },
  { id: "sangue", nome: "Exames de sangue", tipo: "exame", especialidade: false },
];

export const ubsById = (id: string) => UBS_LIST.find((u) => u.id === id)!;
export const servicoById = (id: string) => SERVICOS.find((s) => s.id === id)!;

const PROFISSIONAIS = ["Dra. Helena Costa", "Dr. Marcos Pereira", "Dra. Luiza Fernandes", "Dr. Rafael Nunes", "Dra. Beatriz Lima", "Dr. Tiago Moreira"];

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOMES = ["José", "Ana", "João", "Francisca", "Antônio", "Luzia", "Sebastião", "Rosa", "Geraldo", "Terezinha", "Paulo", "Joana", "Raimundo", "Lúcia", "Pedro", "Marta", "Benedito", "Helena", "Lucas", "Vitória", "Rafael", "Juliana", "Marcos", "Patrícia", "Edson", "Cláudia", "Wellington", "Sônia", "Diego", "Aline", "Rogério", "Fernanda", "Gabriel", "Regina", "Matheus", "Simone", "Vinícius"];
const SOBRENOMES = ["Souza", "Ferreira", "Rodrigues", "Pereira", "Costa", "Gomes", "Martins", "Ribeiro", "Lopes", "Mendes", "Batista", "Moreira", "Teixeira", "Barbosa", "Rocha"];

export const iso = (d: Date) => d.toISOString();
export const dia = (d: Date) => format(d, "yyyy-MM-dd");

export interface DadosDemo {
  pacientes: Paciente[];
  encaminhamentos: Encaminhamento[];
  ofertas: Oferta[];
  notificacoes: Notificacao[];
  alertas: Alerta[];
  atividades: Atividade[];
  baseFila: number;
}

export function diasNaEtapa(e: Encaminhamento, now = new Date()) {
  const last = e.historico[e.historico.length - 1];
  return Math.max(0, Math.floor((now.getTime() - new Date(last.data).getTime()) / 86400000));
}
export function calcPrazoExcedido(e: Encaminhamento, now = new Date()) {
  if (e.cancelado || e.etapaAtual === "agendado" || e.etapaAtual === "realizado") return false;
  return diasNaEtapa(e, now) > PRAZO_ETAPA[e.etapaAtual];
}

function responsavel(etapa: Etapa, ubsId: string, r: () => number) {
  const prof = PROFISSIONAIS[Math.floor(r() * PROFISSIONAIS.length)];
  if (etapa === "solicitado") return `${ubsById(ubsId).nome} — ${prof}`;
  if (etapa === "em_analise" || etapa === "autorizado") return "Central de Regulação — Diamantina";
  if (etapa === "agendado") return "Central de Agendamento";
  return `Atendido por ${prof}`;
}

export function buildHistorico(etapa: Etapa, ubsId: string, criado: Date, r: () => number, spanDias: number[]): Historico[] {
  const idx = ETAPAS.indexOf(etapa);
  const h: Historico[] = [];
  let d = criado;
  for (let i = 0; i <= idx; i++) {
    if (i > 0) d = addDays(d, spanDias[i - 1] ?? 2);
    h.push({ etapa: ETAPAS[i], data: iso(d), responsavel: responsavel(ETAPAS[i], ubsId, r) });
  }
  return h;
}

export function gerarDados(): DadosDemo {
  const r = rng(42);
  const now = new Date();
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const pacientes: Paciente[] = [
    { id: "p1", nome: "Maria das Graças Silva", idade: 53, cns: "700 0012 3456 7801", telefone: "(38) 99812-3401", bairro: "Centro", canal: "whatsapp" },
    { id: "p2", nome: "Carlos Almeida", idade: 41, cns: "700 0098 7654 3202", telefone: "(38) 99745-1102", bairro: "Bom Jesus", canal: "whatsapp", cuidadorDeIds: ["p3"] },
    { id: "p3", nome: "Aparecida Almeida", idade: 78, cns: "700 0055 1122 3303", telefone: "(38) 99745-1102", bairro: "Bom Jesus", canal: "whatsapp", parentesco: "Mãe" },
  ];
  for (let i = 4; i <= 40; i++) {
    pacientes.push({
      id: `p${i}`,
      nome: `${NOMES[(i * 7) % NOMES.length]} ${pick(SOBRENOMES)} ${pick(SOBRENOMES)}`,
      idade: 18 + Math.floor(r() * 70),
      cns: `700 00${String(10 + i).padStart(2, "0")} ${Math.floor(1000 + r() * 8999)} ${Math.floor(1000 + r() * 8999)}`,
      telefone: `(38) 99${Math.floor(100 + r() * 899)}-${Math.floor(1000 + r() * 8999)}`,
      bairro: pick(UBS_LIST).bairro,
      canal: r() > 0.25 ? "whatsapp" : r() > 0.5 ? "sms" : "app",
    });
  }

  const encs: Encaminhamento[] = [];
  let seq = 4700;
  const mk = (p: Partial<Encaminhamento> & { pacienteId: string; servicoId: string; etapaAtual: Etapa; criado: Date; spans?: number[]; ubs?: string; prioridade?: Prioridade }) => {
    const ubs = p.ubs ?? pacientes.find((x) => x.id === p.pacienteId)!.bairro;
    const ubsId = UBS_LIST.find((u) => u.bairro === ubs)?.id ?? p.ubs ?? "centro";
    const e: Encaminhamento = {
      id: `e${encs.length + 1}`,
      protocolo: `FZ-2026-00${seq++}`,
      pacienteId: p.pacienteId,
      servicoId: p.servicoId,
      ubsOrigemId: ubsId,
      etapaAtual: p.etapaAtual,
      prioridade: p.prioridade ?? (pick(["vermelho", "amarelo", "amarelo", "verde", "verde", "verde", "azul", "azul"]) as Prioridade),
      criadoEm: iso(p.criado),
      historico: buildHistorico(p.etapaAtual, ubsId, p.criado, r, p.spans ?? [1 + Math.floor(r() * 4), 2 + Math.floor(r() * 5), 2 + Math.floor(r() * 6), 7]),
      prazoExcedido: false,
      agendamento: p.agendamento,
      observacao: p.observacao,
    };
    encs.push(e);
    return e;
  };

  // Maria
  mk({ pacienteId: "p1", servicoId: "cardio", etapaAtual: "autorizado", criado: subDays(now, 12), spans: [6, 4], prioridade: "amarelo", ubs: "Centro", observacao: "Hipertensão de difícil controle." });
  mk({ pacienteId: "p1", servicoId: "usg", etapaAtual: "em_analise", criado: subDays(now, 4), spans: [2], prioridade: "verde", ubs: "Centro" });
  mk({ pacienteId: "p1", servicoId: "clinico", etapaAtual: "agendado", criado: subDays(now, 6), spans: [0, 1, 2], prioridade: "verde", ubs: "Centro",
    agendamento: { data: dia(addDays(now, 1)), hora: "14:00", ubsId: "centro", status: "pendente" } });
  // Aparecida (Carlos)
  mk({ pacienteId: "p3", servicoId: "oftalmo", etapaAtual: "solicitado", criado: subDays(now, 9), prioridade: "amarelo", ubs: "Bom Jesus", observacao: "Catarata bilateral, dificuldade visual progressiva." });
  mk({ pacienteId: "p3", servicoId: "cardio", etapaAtual: "agendado", criado: subDays(now, 20), spans: [3, 5, 4], prioridade: "amarelo", ubs: "Bom Jesus",
    agendamento: { data: dia(addDays(now, 5)), hora: "09:30", ubsId: "centro", status: "confirmada" } });

  const etapasPeso: Etapa[] = ["solicitado", "em_analise", "em_analise", "autorizado", "autorizado", "agendado", "agendado", "realizado"];
  const horas = ["07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "13:30", "14:00", "15:00", "16:00"];
  const confs: StatusConf[] = ["confirmada", "confirmada", "pendente", "pendente", "sem_resposta", "cancelada"];
  let ag48 = 0;
  while (encs.length < 120) {
    const etapa = pick(etapasPeso);
    const paciente = pacientes[3 + Math.floor(r() * 37)];
    const servico = r() < 0.31 ? "oftalmo" : pick(SERVICOS).id;
    const idadeDias = 2 + Math.floor(r() * 40);
    let agendamento: Agendamento | undefined;
    if (etapa === "agendado") {
      const near = ag48 < 12;
      const offset = near ? (ag48 % 2) : 3 + Math.floor(r() * 11);
      ag48++;
      agendamento = { data: dia(addDays(now, offset)), hora: pick(horas), ubsId: SERVICOS.find((s) => s.id === servico)!.especialidade ? "centro" : UBS_LIST.find((u) => u.bairro === paciente.bairro)!.id, status: near ? pick(confs) : "pendente" };
    }
    mk({ pacienteId: paciente.id, servicoId: servico, etapaAtual: etapa, criado: subDays(now, idadeDias), agendamento,
      spans: etapa === "agendado" || etapa === "realizado" ? [1, 2, Math.max(1, idadeDias - 5), 3] : undefined });
  }
  // fix future dates on historico (cap at now)
  for (const e of encs) {
    for (const h of e.historico) if (new Date(h.data) > now) h.data = iso(subDays(now, 0));
    e.prazoExcedido = calcPrazoExcedido(e, now);
  }
  recalcPosicoes(encs);

  const ofertas: Oferta[] = [];
  for (const u of UBS_LIST) {
    for (const s of SERVICOS) {
      if (s.especialidade && !["centro", "bomjesus"].includes(u.id)) continue;
      const cota = s.especialidade ? 4 + Math.floor(r() * 4) : 10 + Math.floor(r() * 10);
      const roll = r();
      const ocup = roll < 0.3 ? cota : roll < 0.55 ? cota - 1 - Math.floor(r() * 2) : Math.floor(cota * r() * 0.6);
      ofertas.push({ ubsId: u.id, servicoId: s.id, cotaDia: cota, ocupadasHoje: Math.max(0, ocup), cotaSemana: cota * 5, ocupadasSemana: Math.min(cota * 5, ocup + Math.floor(cota * 3 * r())), profissional: pick(PROFISSIONAIS) });
    }
  }
  // garantir oftalmo esgotado (demanda reprimida)
  ofertas.filter((o) => o.servicoId === "oftalmo").forEach((o) => { o.ocupadasHoje = o.cotaDia; o.ocupadasSemana = o.cotaSemana; });

  const h = (hAgo: number) => iso(new Date(now.getTime() - hAgo * 3600000));
  const notificacoes: Notificacao[] = [
    { id: "n1", pacienteId: "p1", tipo: "autorizado", titulo: "Pedido autorizado ✅", texto: "Sua consulta de Cardiologia foi autorizada. Falta agendar.", data: h(5), lida: false },
    { id: "n2", pacienteId: "p1", tipo: "confirmacao", titulo: "Confirme sua presença", texto: "Consulta de Clínico Geral amanhã às 14:00 na UBS Centro.", data: h(2), lida: false },
    { id: "n3", pacienteId: "p1", tipo: "agendado", titulo: "Consulta agendada 🗓️", texto: "Clínico Geral marcado na UBS Centro.", data: h(30), lida: true },
    { id: "n4", pacienteId: "p1", tipo: "info", titulo: "Pedido em análise", texto: "Seu Ultrassom está com a central de vagas.", data: h(60), lida: true },
    { id: "n5", pacienteId: "p3", tipo: "lembrete", titulo: "Lembrete de consulta", texto: "Cardiologia de Dona Aparecida em 5 dias, 09:30, UBS Centro.", data: h(8), lida: false },
    { id: "n6", pacienteId: "p3", tipo: "info", titulo: "Pedido demorando", texto: "O pedido de Oftalmologia passou do prazo normal. Já avisamos a Secretaria.", data: h(20), lida: false },
    { id: "n7", pacienteId: "p3", tipo: "remarcado", titulo: "Consulta remarcada", texto: "A consulta de Cardiologia mudou de horário para 09:30.", data: h(70), lida: true },
  ];
  const alertas: Alerta[] = [
    { id: "a1", tipo: "parado", severidade: "alta", titulo: "Oftalmologia parada há 9 dias", descricao: "Pedido FZ-2026-004703 (Aparecida A.) está em 'Solicitado' acima do prazo de 3 dias.", data: h(3), resolvido: false, encId: "e4" },
    { id: "a2", tipo: "ubs", severidade: "media", titulo: "UBS Bom Jesus acima do limite", descricao: "Fila de Clínico Geral 40% acima da média dos últimos 30 dias.", data: h(6), resolvido: false },
    { id: "a3", tipo: "integracao", severidade: "baixa", titulo: "Atraso na sincronização com o e-SUS Regulação", descricao: "Última sincronização levou 4 min (normal: 30 s). Restabelecida automaticamente.", data: h(14), resolvido: false },
    { id: "a4", tipo: "ajuda", severidade: "media", titulo: "Pedido de ajuda de paciente", descricao: "José F. pediu ajuda sobre um encaminhamento de Ortopedia.", data: h(26), resolvido: false },
  ];
  const atividades: Atividade[] = [
    { id: "t1", texto: "Vaga de Ortopedia da UBS Centro redistribuída para Rosa M. em 4 min", data: h(0.3) },
    { id: "t2", texto: "12 pacientes confirmaram presença por WhatsApp", data: h(1) },
    { id: "t3", texto: "UBS Palha abriu 4 vagas extras de Clínico Geral", data: h(2.5) },
    { id: "t4", texto: "Central de Regulação autorizou 18 encaminhamentos", data: h(4) },
    { id: "t5", texto: "Sincronização com o e-SUS Regulação concluída", data: h(5) },
  ];
  const abertos = encs.filter((e) => e.etapaAtual !== "realizado" && !e.cancelado).length;
  return { pacientes, encaminhamentos: encs, ofertas, notificacoes, alertas, atividades, baseFila: 1248 - abertos };
}

/** Lista de espera de um serviço: ordem por prioridade, depois data de criação. */
export function filaDeEspera(encs: Encaminhamento[], servicoId: string) {
  return encs
    .filter((e) => e.servicoId === servicoId && !e.cancelado && ["solicitado", "em_analise", "autorizado"].includes(e.etapaAtual))
    .sort((a, b) => PRIORIDADE_PESO[a.prioridade] - PRIORIDADE_PESO[b.prioridade] || a.criadoEm.localeCompare(b.criadoEm));
}

export function recalcPosicoes(encs: Encaminhamento[]) {
  for (const s of SERVICOS) {
    filaDeEspera(encs, s.id).forEach((e, i) => (e.posicaoFila = i + 1));
  }
  for (const e of encs) if (!["solicitado", "em_analise", "autorizado"].includes(e.etapaAtual) || e.cancelado) e.posicaoFila = undefined;
}

// Séries históricas para os gráficos
export const SERIE_FILA = [
  { mes: "Mai", fila: 2140, presencial: 310 },
  { mes: "Jun", fila: 2010, presencial: 290 },
  { mes: "Jul", fila: 1820, presencial: 210 },
  { mes: "Ago", fila: 1610, presencial: 160 },
  { mes: "Set", fila: 1420, presencial: 120 },
  { mes: "Out", fila: 1248, presencial: 90 },
];
export const ESPERA_ESPECIALIDADE = [
  { nome: "Oftalmologia", dias: 41 },
  { nome: "Ortopedia", dias: 29 },
  { nome: "Cardiologia", dias: 24 },
  { nome: "Ultrassom", dias: 19 },
  { nome: "Ginecologia", dias: 12 },
  { nome: "Odontologia", dias: 10 },
  { nome: "Pediatria", dias: 6 },
  { nome: "Clínico", dias: 4 },
];
export const SEMANAS = [
  { semana: "S1", compareceram: 412, faltas: 58, reaproveitadas: 18 },
  { semana: "S2", compareceram: 438, faltas: 49, reaproveitadas: 22 },
  { semana: "S3", compareceram: 451, faltas: 41, reaproveitadas: 26 },
  { semana: "S4", compareceram: 470, faltas: 37, reaproveitadas: 30 },
];
export const LOGS_ACESSO = [
  { quando: "Hoje 08:12", usuario: "recepcao.centro", acao: "Consultou encaminhamento FZ-2026-004703", ip: "10.0.2.14" },
  { quando: "Hoje 07:58", usuario: "regulacao.adm", acao: "Autorizou 6 encaminhamentos", ip: "10.0.1.3" },
  { quando: "Ontem 17:40", usuario: "secretaria.saude", acao: "Exportou relatório de demanda (anonimizado)", ip: "10.0.1.8" },
  { quando: "Ontem 15:02", usuario: "recepcao.palha", acao: "Registrou check-in de paciente", ip: "10.0.4.22" },
  { quando: "Ontem 09:15", usuario: "sistema", acao: "Sincronização e-SUS Regulação", ip: "—" },
];
