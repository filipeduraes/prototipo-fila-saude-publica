import { create } from "zustand";
import { useApp, MENU, type WaMsg } from "@/store/app";
import { servicoById, ubsById, ubsDeReferencia, ETAPA_LABEL } from "@/data/mock";
import { fmtData } from "@/lib/format";

export const useWaTyping = create<{ typing: boolean }>(() => ({ typing: false }));

const MARIA = "p1";
type Bot = Omit<WaMsg, "id" | "time">;
const bot = (text: string, options?: Bot["options"]): Bot => ({ from: "bot", text, options });
const voltar = { label: "↩️ Menu", value: "menu" };

function reply(value: string): Bot[] {
  const s = useApp.getState();
  const [cmd, a, b] = value.split(":");
  switch (cmd) {
    case "menu":
      return [bot("Como posso ajudar? Escolha uma opção:", MENU)];
    case "vagas":
      return [
        bot(
          "Você pode agendar o *Clínico Geral* (Médico de Saúde da Família) na sua UBS de Referência, definida pelo seu endereço/CEP.\n\nConsultas com especialistas são encaminhadas pelo médico da UBS e agendadas pela Secretaria de Saúde / Central de Vagas — acompanhe em *Meus encaminhamentos* no portal.",
          [{ label: "🩺 Agendar Clínico Geral", value: "esp:clinico" }, voltar],
        ),
      ];
    case "esp": {
      // Agendamento direto é restrito ao Clínico Geral da UBS de Referência.
      if (a !== "clinico") {
        return [
          bot(
            `*${servicoById(a).nome}* não pode ser agendada diretamente.\n\nO pedido é feito pelo médico da sua UBS e o agendamento é realizado pela Secretaria de Saúde / Central de Vagas. Avisaremos por aqui quando a vaga for confirmada.`,
            [voltar],
          ),
        ];
      }
      const paciente = s.pacientes.find((p) => p.id === MARIA)!;
      const ref = ubsDeReferencia(paciente);
      const o = s.ofertas.find((x) => x.servicoId === "clinico" && x.ubsId === ref.id);
      const livres = o ? o.cotaDia - o.ocupadasHoje : 0;
      const linha = `${livres === 0 ? "🔴" : livres <= 3 ? "🟡" : "🟢"} ${ref.nome} (sua UBS de Referência): ${livres === 0 ? "sem vagas hoje" : `${livres} vaga${livres > 1 ? "s" : ""} hoje`}`;
      const opts =
        livres > 0
          ? [
              { label: `✅ Agendar na ${ref.nome}`, value: `res:clinico:${ref.id}` },
              { label: "📝 Entrar na lista de espera", value: `fila:clinico:${ref.id}` },
              voltar,
            ]
          : [{ label: "📝 Entrar na lista de espera", value: `fila:clinico:${ref.id}` }, voltar];
      return [
        bot(`*Clínico Geral* — sua UBS de Referência:\n\n${linha}`),
        bot(
          livres > 0
            ? "Quer agendar agora ou entrar na lista de espera?"
            : "Não há vagas hoje. Quer entrar na lista de espera?",
          opts,
        ),
      ];
    }
    case "res":
    case "fila": {
      try {
        const e = s.entrarFila({
          pacienteId: MARIA,
          servicoId: a,
          ubsId: b,
          reservar: cmd === "res",
        });
        return cmd === "res"
          ? [
              bot(
                `✅ Consulta agendada!\n\n📋 Protocolo: *${e.protocolo}*\n🏥 ${ubsById(e.ubsOrigemId).nome} (UBS de Referência)\n🗓️ ${fmtData(e.agendamento!.data)} às ${e.agendamento!.hora}\n\nVou te lembrar na véspera.`,
                [voltar],
              ),
            ]
          : [
              bot(
                `📝 Pronto! Você está na lista de espera.\n\n📋 Protocolo: *${e.protocolo}*\n🔢 Posição: *${e.posicaoFila}*\n⏳ Previsão: ${Math.ceil((e.posicaoFila ?? 1) / 6)} a ${Math.ceil((e.posicaoFila ?? 1) / 6) + 6} dias\n\nAvisaremos por aqui.`,
                [voltar],
              ),
            ];
      } catch {
        return [
          bot(
            "Agendamento direto disponível apenas para o Clínico Geral da sua UBS de Referência. Especialidades dependem de encaminhamento do médico da UBS.",
            [voltar],
          ),
        ];
      }
    }
    case "pedido": {
      const encs = s.encaminhamentos.filter(
        (e) => e.pacienteId === MARIA && !e.cancelado && e.etapaAtual !== "realizado",
      );
      const emoji: Record<string, string> = {
        solicitado: "📨",
        em_analise: "🔎",
        autorizado: "✅",
        agendado: "🗓️",
        realizado: "🏁",
      };
      const linhas = encs.map((e) => {
        const prox =
          e.etapaAtual === "autorizado"
            ? " → 🗓️ O agendamento será feito pela Central de Vagas. Até 7 dias."
            : e.etapaAtual === "em_analise"
              ? " → aguardando a central. Até 5 dias."
              : e.etapaAtual === "agendado" && e.agendamento
                ? ` → ${fmtData(e.agendamento.data)} às ${e.agendamento.hora}`
                : "";
        return `📋 ${servicoById(e.servicoId).nome} — ${emoji[e.etapaAtual]} ${ETAPA_LABEL[e.etapaAtual]}${prox}`;
      });
      return [
        bot(
          linhas.length
            ? `Seus pedidos:\n\n${linhas.join("\n\n")}`
            : "Você não tem pedidos em aberto.",
          [voltar],
        ),
      ];
    }
    case "presenca": {
      const e = s.encaminhamentos.find(
        (x) =>
          x.pacienteId === MARIA &&
          x.etapaAtual === "agendado" &&
          x.agendamento &&
          ["pendente", "confirmada", "sem_resposta"].includes(x.agendamento.status),
      );
      if (!e) return [bot("Você não tem consultas para confirmar agora. 🙂", [voltar])];
      const ag = e.agendamento!;
      return [
        bot(
          `⏰ Lembrete: sua consulta de *${servicoById(e.servicoId).nome}* é ${fmtData(ag.data)}, ${ag.hora}, ${ubsById(ag.ubsId).nome}. Você vai?`,
          [
            { label: "👍 Sim, vou", value: `sim:${e.id}` },
            { label: "❌ Não posso ir", value: `nao:${e.id}` },
          ],
        ),
      ];
    }
    case "sim":
      s.confirmarPresenca(a);
      return [
        bot("Ótimo! ✅ Presença confirmada. Leve seu cartão do SUS e documento com foto.", [
          voltar,
        ]),
      ];
    case "nao": {
      const e = s.encaminhamentos.find((x) => x.id === a)!;
      s.liberarVaga(a);
      const remarca = servicoById(e.servicoId).agendamentoDireto
        ? [
            {
              label: "🔁 Sim, remarcar",
              value: `fila:${e.servicoId}:${ubsDeReferencia(s.pacientes.find((p) => p.id === MARIA)!).id}`,
            },
            { label: "Não, obrigado", value: "menu" },
          ]
        : [{ label: "Central de Vagas cuida disso", value: "menu" }];
      return [bot("Tudo bem! 💚 Liberamos sua vaga para outra pessoa. Quer remarcar?", remarca)];
    }
    case "ubs": {
      const paciente = s.pacientes.find((p) => p.id === MARIA)!;
      const ref = ubsDeReferencia(paciente);
      return [
        bot(
          `🏥 *${ref.nome}* (sua UBS de Referência)\n📞 ${ref.telefone}\n🕖 ${ref.horario}\n📍 ${ref.bairro}\n\nUma pessoa da equipe vai responder aqui em horário de atendimento.`,
          [voltar],
        ),
      ];
    }
    case "quero": {
      // Maria confirma uma vaga ofertada pela Central de Vagas — não é agendamento direto com especialista.
      const e = s.encaminhamentos.find(
        (x) =>
          x.pacienteId === MARIA &&
          (x.etapaAtual === "em_analise" || x.etapaAtual === "solicitado"),
      );
      if (!e)
        return [
          bot(
            "No momento não há nenhuma vaga ofertada para você. Avisaremos assim que a Central de Vagas disponibilizar uma. 🙂",
            [voltar],
          ),
        ];
      const ag = s.aceitarOferta(e.id).agendamento!;
      return [
        bot(
          `🎉 A vaga é sua!\n\n📋 Protocolo: *${e.protocolo}*\n🩺 ${servicoById(e.servicoId).nome} — ${fmtData(ag.data)}, ${ag.hora}\n🏥 ${ubsById(ag.ubsId).nome}\n\nAgendamento feito pela Central de Vagas. Vou te lembrar no dia anterior.`,
          [voltar],
        ),
      ];
    }
    case "naoquero":
      return [
        bot("Sem problemas. Você continua na lista e a vaga vai para a próxima pessoa. 👍", [
          voltar,
        ]),
      ];
    default:
      return [bot("Não entendi 🤔. Escolha uma opção abaixo:", MENU)];
  }
}

function parseTexto(t: string) {
  const x = t.toLowerCase().trim();
  if (/^1|vaga/.test(x)) return "vagas";
  if (/^2|pedido|status/.test(x)) return "pedido";
  if (/^3|presen|confirm/.test(x)) return "presenca";
  if (/^4|ubs|atendente|falar/.test(x)) return "ubs";
  if (/^(oi|olá|ola|menu|inicio|início)/.test(x)) return "menu";
  return "?";
}

export function waSend(label: string, value?: string) {
  const { waPush } = useApp.getState();
  waPush({ from: "user", text: label });
  const v = value ?? parseTexto(label);
  useWaTyping.setState({ typing: true });
  setTimeout(() => {
    const msgs = reply(v);
    msgs.forEach((m, i) =>
      setTimeout(() => {
        useApp.getState().waPush(m);
        if (i === msgs.length - 1) useWaTyping.setState({ typing: false });
      }, i * 600),
    );
  }, 800);
}

export function waSimular(tipo: "lembrete" | "vaga" | "autorizado") {
  const { waPush } = useApp.getState();
  const s = useApp.getState();
  if (tipo === "lembrete") {
    reply("presenca").forEach(waPush);
    return;
  }
  if (tipo === "vaga") {
    const e = s.encaminhamentos.find(
      (x) =>
        x.pacienteId === MARIA && (x.etapaAtual === "em_analise" || x.etapaAtual === "solicitado"),
    );
    const servico = e ? servicoById(e.servicoId).nome : "Ultrassonografia";
    waPush(
      bot(
        `🎉 Uma vaga de *${servico}* foi ofertada pela Central de Vagas para amanhã, 09:00. Você tem 30 min para confirmar.`,
        [
          { label: "✅ Quero a vaga", value: "quero" },
          { label: "Não quero", value: "naoquero" },
        ],
      ),
    );
    return;
  }
  const e = s.encaminhamentos.find(
    (x) =>
      x.pacienteId === MARIA && (x.etapaAtual === "em_analise" || x.etapaAtual === "solicitado"),
  );
  if (e) s.avancar(e.id);
  waPush(
    bot(
      `✅ Boa notícia, Maria! Seu pedido de *${e ? servicoById(e.servicoId).nome : "Ultrassonografia"}* foi autorizado.\n🗓️ O agendamento será feito pela Secretaria de Saúde / Central de Vagas. Avisaremos assim que a vaga for confirmada.`,
      [{ label: "📋 Ver meus pedidos", value: "pedido" }, voltar],
    ),
  );
}
