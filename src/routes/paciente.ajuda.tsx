import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Phone, Smartphone, Type, Contrast, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useApp, usePacienteAtivo } from "@/store/app";
import { ubsDeReferencia } from "@/data/mock";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { Canal } from "@/data/mock";

export const Route = createFileRoute("/paciente/ajuda")({ component: Ajuda });

const FAQ = [
  ["Como agendo uma consulta na minha UBS?", "Você pode agendar o Clínico Geral (Médico de Saúde da Família) exclusivamente na sua UBS de Referência, definida pelo seu endereço/CEP. O agendamento é feito aqui no portal ou no WhatsApp."],
  ["Como agendo uma consulta com especialista?", "Consultas com especialistas não são agendadas diretamente. O pedido é feito pelo médico da sua UBS e o agendamento é realizado internamente pela Secretaria de Saúde / Central de Vagas. Acompanhe em \"Meus encaminhamentos\": quando a vaga for confirmada, mostramos data, hora e local."],
  ["E se eu não tiver internet?", "Você pode receber os avisos por SMS. Também pode pedir ajuda na recepção da UBS, que faz o cadastro por você."],
  ["Como confirmo minha presença?", "Um dia antes mandamos um lembrete. É só tocar em \"Sim, vou\" no WhatsApp ou em \"Confirmar presença\" aqui no Início."],
  ["Não vou poder ir. O que faço?", "Toque em \"Não vou poder ir\". Sua vaga vai para outra pessoa e você pode remarcar."],
  ["Meus dados estão seguros?", "Sim. Seguimos a LGPD: seus dados de saúde só são usados para acompanhar seus atendimentos, e todo acesso fica registrado."],
];

function Ajuda() {
  const { ativo } = usePacienteAtivo();
  const prefs = useApp((s) => s.prefs);
  const setPrefs = useApp((s) => s.setPrefs);
  const ref = ativo ? ubsDeReferencia(ativo) : null;
  const canais: { v: Canal; l: string; I: typeof Phone }[] = [{ v: "whatsapp", l: "WhatsApp", I: MessageCircle }, { v: "sms", l: "SMS", I: MessageSquare }, { v: "app", l: "Só no app", I: Smartphone }];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Ajuda</h1>
      <div className="grid gap-3">
        <Button asChild size="xl" variant="whatsapp"><Link to="/whatsapp"><MessageCircle />Falar pelo WhatsApp</Link></Button>
        {ref && <Button asChild size="xl" variant="outline"><a href={`tel:+55${ref.telefone.replace(/\D/g, "")}`}><Phone />Ligar para a {ref.nome} · {ref.telefone}</a></Button>}
      </div>

      <section>
        <h2 className="mb-2 text-lg">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-4">
          {FAQ.map(([q, a]) => (
            <AccordionItem key={q} value={q}>
              <AccordionTrigger className="text-left text-base font-bold">{q}</AccordionTrigger>
              <AccordionContent className="text-base">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg">Como quer receber avisos?</h2>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Canal de aviso">
          {canais.map((c) => (
            <button key={c.v} role="radio" aria-checked={prefs.canal === c.v} onClick={() => { setPrefs({ canal: c.v }); toast.success(`Avisos por ${c.l}`); }}
              className={cn("flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border-2 font-semibold", prefs.canal === c.v ? "border-primary bg-primary-soft text-primary-deep" : "bg-card")}>
              <c.I className="size-6" />{c.l}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg">Preferências</h2>
        <label className="flex min-h-16 items-center justify-between rounded-2xl border bg-card p-4 font-semibold"><span className="flex items-center gap-3"><Type className="size-6" />Letra grande</span><Switch checked={prefs.letraGrande} onCheckedChange={(v) => setPrefs({ letraGrande: v })} /></label>
        <label className="flex min-h-16 items-center justify-between rounded-2xl border bg-card p-4 font-semibold"><span className="flex items-center gap-3"><Contrast className="size-6" />Alto contraste</span><Switch checked={prefs.altoContraste} onCheckedChange={(v) => setPrefs({ altoContraste: v })} /></label>
      </section>
    </div>
  );
}
