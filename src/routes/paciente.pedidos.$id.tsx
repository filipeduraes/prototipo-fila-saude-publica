import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, AlertTriangle, LifeBuoy, Share2, Trash2, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/store/app";
import { servicoById, ubsById } from "@/data/mock";
import { TimelineStepper } from "@/components/app/TimelineStepper";
import { EtapaBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/paciente/pedidos/$id")({ component: Detalhe });

function FakeQR({ seed }: { seed: string }) {
  const cells = Array.from({ length: 21 * 21 }, (_, i) => {
    const x = i % 21, y = Math.floor(i / 21);
    const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
    if (finder) { const fx = x % 14 % 7, fy = y % 14 % 7; return fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4); }
    return ((x * 31 + y * 17 + seed.charCodeAt(i % seed.length)) * 2654435761) % 7 < 3;
  });
  return <div className="mx-auto grid w-48 grid-cols-[repeat(21,1fr)] rounded-lg bg-card p-2" aria-label="QR code simulado">{cells.map((c, i) => <span key={i} className={c ? "aspect-square bg-foreground" : "aspect-square"} />)}</div>;
}

function Detalhe() {
  const { id } = Route.useParams();
  const enc = useApp((s) => s.encaminhamentos.find((e) => e.id === id));
  const pedirAjuda = useApp((s) => s.pedirAjuda);
  const cancelar = useApp((s) => s.cancelarPedido);
  const navigate = useNavigate();
  const [share, setShare] = useState(false);
  if (!enc) return <div className="text-center"><p className="font-semibold">Pedido não encontrado.</p><Button asChild className="mt-4"><Link to="/paciente/pedidos">Voltar</Link></Button></div>;
  const link = `https://filazero.app/p/${enc.protocolo.toLowerCase()}`;

  return (
    <div className="space-y-5">
      <Link to="/paciente/pedidos" className="inline-flex min-h-11 items-center gap-1 font-semibold text-primary"><ArrowLeft className="size-5" />Meus pedidos</Link>
      <div>
        <h1 className="text-2xl">{servicoById(enc.servicoId).nome}</h1>
        <p className="text-muted-foreground">{enc.protocolo} · {ubsById(enc.ubsOrigemId).nome}</p>
        <div className="mt-2"><EtapaBadge etapa={enc.etapaAtual} /></div>
      </div>

      {enc.prazoExcedido && (
        <div className="rounded-2xl border-2 border-warning bg-warning-soft p-4 text-warning-foreground" role="alert">
          <p className="flex items-start gap-2 font-bold"><AlertTriangle className="mt-0.5 size-6 shrink-0" />Seu pedido está demorando mais que o normal. Já avisamos a Secretaria.</p>
          {enc.ajudaPedida ? (
            <p className="mt-3 flex items-center gap-2 font-semibold"><CheckCircle2 className="size-5" />Pedido de ajuda enviado. Vamos te responder por WhatsApp.</p>
          ) : (
            <Button size="xl" variant="warning" className="mt-3 w-full" onClick={() => { pedirAjuda(enc.id); toast.success("Pedido de ajuda enviado para a Secretaria de Saúde"); }}><LifeBuoy />Pedir ajuda</Button>
          )}
        </div>
      )}

      <section className="rounded-2xl border bg-card p-5"><TimelineStepper enc={enc} /></section>

      <div className="grid gap-3">
        <Button size="xl" variant="outline" onClick={() => setShare(true)}><Share2 />Compartilhar com familiar</Button>
        {enc.etapaAtual !== "realizado" && (
          <AlertDialog>
            <AlertDialogTrigger asChild><Button size="xl" variant="ghost" className="text-destructive"><Trash2 />Cancelar pedido</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Cancelar este pedido?</AlertDialogTitle><AlertDialogDescription>Você sai da fila de {servicoById(enc.servicoId).nome}. Se precisar, a UBS faz um novo pedido.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Voltar</AlertDialogCancel><AlertDialogAction onClick={() => { cancelar(enc.id); toast("Pedido cancelado"); navigate({ to: "/paciente/pedidos" }); }}>Sim, cancelar</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Dialog open={share} onOpenChange={setShare}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Compartilhar pedido</DialogTitle><DialogDescription>O familiar poderá ver as etapas, sem acesso a dados clínicos.</DialogDescription></DialogHeader>
          <FakeQR seed={enc.protocolo} />
          <div className="flex items-center gap-2 rounded-xl bg-muted p-3 text-sm"><span className="flex-1 truncate">{link}</span>
            <Button size="sm" onClick={() => { navigator.clipboard?.writeText(link); toast.success("Link copiado"); }}><Copy />Copiar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
