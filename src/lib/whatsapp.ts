import { create } from "zustand";
import { useApp, MENU, type WaMsg } from "@/store/app";
import { SERVICOS, servicoById, ubsById, ETAPA_LABEL } from "@/data/mock";
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
      return [bot("Qual atendimento você procura?", ["clinico", "pediatria", "cardio", "oftalmo", "usg", "sangue"].map((id) => ({ label: servicoById(id).nome, value: `esp:${id}` })))];
    case "esp": {
      const of = s.ofertas.filter((o) => o.servicoId === a);
      const linhas = of.map((o) => {
        const livres = o.cotaDia - o.ocupadasHoje;
        return `${livres === 0 ? "🔴" : livres <= 3 ? "🟡" : "🟢"} ${ubsById(o.ubsId).nome}: ${livres === 0 ? "esgotado hoje" : `${livres} vaga${livres > 1 ? "s" : ""} hoje`}`;
      });
      const comVaga = of.find((o) => o.cotaDia - o.ocupadasHoje > 0);
      const opts = comVaga
        ? [{ label: `✅ Reservar na ${ubsById(comVaga.ubsId).nome}`, value: `res:${a}:${comVaga.ubsId}` }, { label: "📝 Entrar na lista de espera", value: `fila:${a}:${of[0].ubsId}` }, voltar]
        : [{ label: "📝 Sim, entrar na lista", value: `fila:${a}:${of[0].ubsId}` }, voltar];
      return [bot(`*${servicoById(a).nome}* — vagas agora:\n\n${linhas.join("\n")}`), bot(comVaga ? "Quer reservar uma vaga ou entrar na lista de espera?" : "Não há vagas hoje. Quer entrar na lista de espera?", opts)];
    }
    case "res":
    case "fila": {
      const e = s.entrarFila({ pacienteId: MARIA, servicoId: a, ubsId: b, reservar: cmd === "res" });
      return cmd === "res"
        ? [bot(`✅ Vaga reservada!\n\n📋 Protocolo: *${e.protocolo}*\n🏥 ${ubsById(b).nome}\n🗓️ ${fmtData(e.agendamento!.data)} às ${e.agendamento!.hora}\n\nVou te lembrar um dia antes. Não precisa ir de madrugada!`, [voltar])]
        : [bot(`📝 Pronto! Você está na lista de espera.\n\n📋 Protocolo: *${e.protocolo}*\n🔢 Posição: *${e.posicaoFila}*\n⏳ Previsão: ${Math.ceil((e.posicaoFila ?? 1) / 6)} a ${Math.ceil((e.posicaoFila ?? 1) / 6) + 6} dias\n\nAvisaremos por aqui. Não precisa ir à UBS.`, [voltar])];
    }
    case "pedido": {
      const encs = s.encaminhamentos.filter((e) => e.pacienteId === MARIA && !e.cancelado && e.etapaAtual !== "realizado");
      const emoji: Record<string, string> = { solicitado: "📨", em_analise: "🔎", autorizado: "✅", agendado: "🗓️", realizado: "🏁" };
      const linhas = encs.map((e) => {
        const prox = e.etapaAtual === "autorizado" ? " → 🗓️ Falta agendar. Previsão: até 7 dias." : e.etapaAtual === "em_analise" ? " → aguardando a central. Até 5 dias." : e.etapaAtual === "agendado" && e.agendamento ? ` → ${fmtData(e.agendamento.data)} às ${e.agendamento.hora}` : "";
        return `📋 ${servicoById(e.servicoId).nome} — ${emoji[e.etapaAtual]} ${ETAPA_LABEL[e.etapaAtual]}${prox}`;
      });
      return [bot(linhas.length ? `Seus pedidos:\n\n${linhas.join("\n\n")}` : "Você não tem pedidos em aberto.", [voltar])];
    }
    case "presenca": {
      const e = s.encaminhamentos.find((x) => x.pacienteId === MARIA && x.etapaAtual === "agendado" && x.agendamento && ["pendente", "confirmada", "sem_resposta"].includes(x.agendamento.status));
      if (!e) return [bot("Você não tem consultas para confirmar agora. 🙂", [voltar])];
      const ag = e.agendamento!;
      return [bot(`⏰ Lembrete: sua consulta de *${servicoById(e.servicoId).nome}* é ${fmtData(ag.data)}, ${ag.hora}, ${ubsById(ag.ubsId).nome}. Você vai?`, [{ label: "👍 Sim, vou", value: `sim:${e.id}` }, { label: "❌ Não posso ir", value: `nao:${e.id}` }])];
    }
    case "sim":
      s.confirmarPresenca(a);
      return [bot("Ótimo! ✅ Presença confirmada. Leve seu cartão do SUS e documento com foto.", [voltar])];
    case "nao": {
      const e = s.encaminhamentos.find((x) => x.id === a)!;
      s.liberarVaga(a);
      return [bot("Tudo bem! 💚 Liberamos sua vaga para outra pessoa. Quer remarcar?", [{ label: "🔁 Sim, remarcar", value: `fila:${e.servicoId}:${e.agendamento!.ubsId}` }, { label: "Não, obrigado", value: "menu" }])];
    }
    case "ubs":
      return [bot("🏥 UBS Centro\n📞 (38) 3531-0001\n🕖 07h às 19h\n\nUma pessoa da equipe vai responder aqui em horário de atendimento.", [voltar])];
    case "quero": {
      const e = s.entrarFila({ pacienteId: MARIA, servicoId: "oftalmo", ubsId: "centro", reservar: true });
      return [bot(`🎉 A vaga é sua!\n\n📋 Protocolo: *${e.protocolo}*\n👁️ Oftalmologia — amanhã, UBS Centro.\n\nVou te lembrar no dia anterior.`, [voltar])];
    }
    case "naoquero":
      return [bot("Sem problemas. Você continua na lista e a vaga vai para a próxima pessoa. 👍", [voltar])];
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
    msgs.forEach((m, i) => setTimeout(() => { useApp.getState().waPush(m); if (i === msgs.length - 1) useWaTyping.setState({ typing: false }); }, i * 600));
  }, 800);
}

export function waSimular(tipo: "lembrete" | "vaga" | "autorizado") {
  const { waPush } = useApp.getState();
  if (tipo === "lembrete") { reply("presenca").forEach(waPush); return; }
  if (tipo === "vaga") {
    waPush(bot("🎉 Uma vaga de *Oftalmologia* abriu para amanhã 9h na UBS Centro. Você tem 30 min para confirmar.", [{ label: "✅ Quero a vaga", value: "quero" }, { label: "Não quero", value: "naoquero" }]));
    return;
  }
  const s = useApp.getState();
  const e = s.encaminhamentos.find((x) => x.pacienteId === MARIA && (x.etapaAtual === "em_analise" || x.etapaAtual === "solicitado"));
  if (e) s.avancar(e.id);
  waPush(bot(`✅ Boa notícia, Maria! Seu pedido de *${e ? servicoById(e.servicoId).nome : "Ultrassonografia"}* foi autorizado.\n🗓️ Agora falta agendar. Previsão: até 7 dias.`, [{ label: "📋 Ver meus pedidos", value: "pedido" }, voltar]));
}

export const SERVICOS_WA = SERVICOS;
