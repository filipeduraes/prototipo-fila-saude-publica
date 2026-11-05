import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Clapperboard, X, ListPlus, RefreshCw, BellRing, RotateCcw, Users, Smartphone, LayoutDashboard, Home } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function DemoPanel() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  async function cenarioFila() {
    setOpen(false);
    const s = useApp.getState();
    s.login("p1");
    navigate({ to: "/paciente/vagas" });
    toast.info("Maria abre o portal e procura Oftalmologia (esgotada)…");
    await wait(1500);
    const e = useApp.getState().entrarFila({ pacienteId: "p1", servicoId: "oftalmo", ubsId: "centro", reservar: false });
    toast.success(`Maria entrou na lista de espera — protocolo ${e.protocolo}, posição ${e.posicaoFila}`);
    await wait(2200);
    navigate({ to: "/gestao" });
    toast("Painel da Secretaria: a fila aumentou em tempo real 📈");
  }

  async function cenarioRedistribuir() {
    setOpen(false);
    const s = useApp.getState();
    const alvo = s.encaminhamentos.find((e) => e.agendamento && ["confirmada", "pendente"].includes(e.agendamento.status) && e.pacienteId !== "p1" && e.etapaAtual === "agendado");
    if (!alvo) return toast.error("Nenhuma consulta disponível para o cenário. Restaure os dados.");
    navigate({ to: "/gestao/faltas" });
    const auto = s.autoRedistribuir;
    if (auto) s.toggleAuto();
    await wait(800);
    useApp.getState().liberarVaga(alvo.id);
    toast.warning("Paciente cancelou pelo WhatsApp → vaga LIBERADA");
    await wait(2000);
    const r = useApp.getState().redistribuir(alvo.id);
    if (auto) useApp.getState().toggleAuto();
    if (r) toast.success(`Vaga redistribuída · Mensagem enviada por WhatsApp para ${r.nome}`);
    await wait(1500);
    useApp.getState().waPush({ from: "bot", text: `🎉 Uma vaga abriu para você! Confirme em até 30 min.`, options: [{ label: "✅ Quero a vaga", value: "quero" }, { label: "Não quero", value: "naoquero" }] });
    toast("Veja a mensagem no simulador de WhatsApp 📱", { action: { label: "Abrir", onClick: () => navigate({ to: "/whatsapp" }) } });
  }

  async function cenarioParado() {
    setOpen(false);
    const s = useApp.getState();
    s.login("p2");
    s.acompanhar("p3");
    navigate({ to: "/paciente/pedidos" });
    toast.warning("Carlos vê que o pedido de Dona Aparecida está parado…");
    await wait(1800);
    const e = useApp.getState().encaminhamentos.find((x) => x.pacienteId === "p3" && x.servicoId === "oftalmo");
    if (e) useApp.getState().pedirAjuda(e.id);
    toast.success("Pedido de ajuda enviado à Secretaria");
    await wait(1800);
    navigate({ to: "/gestao/alertas" });
    toast.error("Novo alerta no painel: encaminhamento parado + pedido de ajuda");
  }

  const go = (to: "/" | "/paciente" | "/whatsapp" | "/gestao") => { setOpen(false); navigate({ to }); };

  return (
    <div className="fixed bottom-24 right-4 z-50 md:bottom-6">
      {open && (
        <div role="dialog" aria-label="Modo demonstração" className="mb-3 w-80 rounded-2xl border bg-card p-4 shadow-lift animate-in fade-in slide-in-from-bottom-2">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold">🎬 Modo demonstração</p>
            <button onClick={() => setOpen(false)} aria-label="Fechar" className="rounded-lg p-1 hover:bg-muted"><X className="size-4" /></button>
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cenários</p>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={cenarioFila}><ListPlus />Maria entra na lista de espera</Button>
            <Button variant="outline" className="h-auto w-full justify-start whitespace-normal py-2 text-left" onClick={cenarioRedistribuir}><RefreshCw />Paciente cancela → vaga liberada → redistribuída</Button>
            <Button variant="outline" className="w-full justify-start" onClick={cenarioParado}><BellRing />Pedido parado alerta a Secretaria</Button>
            <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => { useApp.getState().reset(); toast.success("Dados de demonstração restaurados"); }}><RotateCcw />Resetar dados</Button>
          </div>
          <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trocar perfil</p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="secondary" onClick={() => go("/")}><Home />Início</Button>
            <Button size="sm" variant="secondary" onClick={() => go("/paciente")}><Users />Paciente</Button>
            <Button size="sm" variant="secondary" onClick={() => go("/whatsapp")}><Smartphone />WhatsApp</Button>
            <Button size="sm" variant="secondary" onClick={() => go("/gestao")}><LayoutDashboard />Secretaria</Button>
          </div>
        </div>
      )}
      <div className="flex justify-end">
        <Button variant="hero" size="lg" className="rounded-full" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <Clapperboard />Demo
        </Button>
      </div>
    </div>
  );
}
