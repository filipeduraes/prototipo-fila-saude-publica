import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, UserRound, ChevronRight, Users } from "lucide-react";
import { toast } from "sonner";
import { useApp, usePacienteAtivo } from "@/store/app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { isValidDoc, maskDoc } from "@/lib/format";

export const Route = createFileRoute("/paciente/familia")({ component: Familia });

function Familia() {
  const { titular } = usePacienteAtivo();
  const pacientes = useApp((s) => s.pacientes);
  const encs = useApp((s) => s.encaminhamentos);
  const acompanhar = useApp((s) => s.acompanhar);
  const addFamiliar = useApp((s) => s.addFamiliar);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ nome: "", parentesco: "", doc: "", idade: "", ok: false });
  const [err, setErr] = useState<Record<string, string>>({});
  if (!titular) return null;
  const fams = pacientes.filter((p) => titular.cuidadorDeIds?.includes(p.id));

  function salvar(e: React.FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (f.nome.trim().split(" ").length < 2) er.nome = "Digite o nome completo.";
    if (!f.parentesco.trim()) er.parentesco = "Informe o parentesco.";
    if (!isValidDoc(f.doc)) er.doc = "CPF ou Cartão do SUS inválido.";
    if (!f.ok) er.ok = "É preciso a autorização do titular.";
    setErr(er);
    if (Object.keys(er).length) return;
    addFamiliar(titular!.id, { nome: f.nome.trim(), parentesco: f.parentesco.trim(), cns: f.doc, idade: Number(f.idade) || 0 });
    toast.success(`${f.nome.split(" ")[0]} foi adicionado(a)`);
    setOpen(false);
    setF({ nome: "", parentesco: "", doc: "", idade: "", ok: false });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl">Acompanhar familiar</h1>
      <p className="text-muted-foreground">Veja os pedidos e receba avisos em nome de quem você cuida.</p>
      {fams.length === 0 && (
        <div className="rounded-2xl border border-dashed p-8 text-center"><Users className="mx-auto size-12 text-muted-foreground" /><p className="mt-2 font-semibold">Nenhum familiar ainda</p></div>
      )}
      {fams.map((p) => {
        const n = encs.filter((e) => e.pacienteId === p.id && !e.cancelado && e.etapaAtual !== "realizado").length;
        return (
          <button key={p.id} onClick={() => { acompanhar(p.id); toast(`Acompanhando ${p.nome.split(" ")[0]}`); navigate({ to: "/paciente" }); }}
            className="flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left shadow-soft transition-transform hover:-translate-y-0.5">
            <span className="grid size-14 place-items-center rounded-full bg-primary-soft text-primary"><UserRound className="size-7" /></span>
            <span className="flex-1"><span className="block text-lg font-bold">{p.idade >= 60 ? "Dona " : ""}{p.nome.split(" ")[0]} – {p.parentesco?.toLowerCase()}{p.idade ? `, ${p.idade} anos` : ""}</span><span className="text-muted-foreground">{n} pedido{n !== 1 && "s"} em aberto</span></span>
            <ChevronRight className="size-6 text-muted-foreground" />
          </button>
        );
      })}
      <Button size="xl" variant="outline" className="w-full" onClick={() => setOpen(true)}><UserPlus />Adicionar familiar</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Adicionar familiar</DialogTitle><DialogDescription>Os avisos dessa pessoa também chegarão para você.</DialogDescription></DialogHeader>
          <form onSubmit={salvar} className="space-y-3" noValidate>
            {([["nome", "Nome completo", "text"], ["parentesco", "Parentesco (ex.: mãe)", "text"], ["idade", "Idade", "number"]] as const).map(([k, l, t]) => (
              <div key={k}>
                <Label htmlFor={k}>{l}</Label>
                <Input id={k} type={t} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className="mt-1 h-12" />
                {err[k] && <p className="mt-1 text-sm font-semibold text-destructive">{err[k]}</p>}
              </div>
            ))}
            <div>
              <Label htmlFor="docf">CPF ou Cartão do SUS</Label>
              <Input id="docf" inputMode="numeric" value={f.doc} onChange={(e) => setF({ ...f, doc: maskDoc(e.target.value) })} className="mt-1 h-12" />
              {err.doc && <p className="mt-1 text-sm font-semibold text-destructive">{err.doc}</p>}
            </div>
            <div className="flex gap-3 rounded-xl bg-muted p-3">
              <Checkbox id="aut" checked={f.ok} onCheckedChange={(v) => setF({ ...f, ok: !!v })} className="mt-0.5 size-5" />
              <Label htmlFor="aut" className="font-normal leading-snug">O titular autorizou que eu acompanhe seus atendimentos (termo de autorização).</Label>
            </div>
            {err.ok && <p className="text-sm font-semibold text-destructive">{err.ok}</p>}
            <Button type="submit" size="xl" className="w-full">Salvar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
