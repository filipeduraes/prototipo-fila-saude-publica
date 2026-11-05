import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Phone, Smartphone, Type, Contrast, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { Canal } from "@/data/mock";

export const Route = createFileRoute("/paciente/ajuda")({ component: Ajuda });

const FAQ = [
  ["Preciso ir de madrugada à UBS?", "Não. Você vê as vagas aqui ou no WhatsApp e entra na lista de espera de casa. Avisamos quando chegar sua vez."],
  ["E se eu não tiver internet?", "Você pode receber os avisos por SMS. Também pode pedir ajuda na recepção da UBS, que faz o cadastro por você."],
  ["Como confirmo minha presença?", "Um dia antes mandamos um lembrete. É só tocar em \"Sim, vou\" no WhatsApp ou em \"Confirmar presença\" aqui no Início."],
  ["Não vou poder ir. O que faço?", "Toque em \"Não vou poder ir\". Sua vaga vai para outra pessoa e você pode remarcar."],
  ["Meus dados estão seguros?", "Sim. Seguimos a LGPD: seus dados de saúde só são usados para acompanhar seus atendimentos, e todo acesso fica registrado."],
];

function Ajuda() {
  const prefs = useApp((s) => s.prefs);
  const setPrefs = useApp((s) => s.setPrefs);
  const canais: { v: Canal; l: string; I: typeof Phone }[] = [{ v: "whatsapp", l: "WhatsApp", I: MessageCircle }, { v: "sms", l: "SMS", I: MessageSquare }, { v: "app", l: "Só no app", I: Smartphone }];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl">Ajuda</h1>
      <div className="grid gap-3">
        <Button asChild size="xl" variant="whatsapp"><Link to="/whatsapp"><MessageCircle />Falar pelo WhatsApp</Link></Button>
        <Button asChild size="xl" variant="outline"><a href="tel:+553835310001"><Phone />Ligar para a UBS</a></Button>
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
