import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export function maskDoc(v: string) {
  const d = onlyDigits(v).slice(0, 15);
  if (d.length <= 11) {
    return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return d.replace(/(\d{3})(\d{4})(\d{4})(\d{0,4})/, "$1 $2 $3 $4").trim();
}
export function maskPhone(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function isValidCPF(v: string) {
  const c = onlyDigits(v);
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const calc = (n: number) => {
    let s = 0;
    for (let i = 0; i < n; i++) s += Number(c[i]) * (n + 1 - i);
    const r = (s * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(9) === Number(c[9]) && calc(10) === Number(c[10]);
}
export const isValidCNS = (v: string) => /^[12789]\d{14}$/.test(onlyDigits(v));
export const isValidDoc = (v: string) => isValidCPF(v) || isValidCNS(v);
export function isValidPhone(v: string) {
  const d = onlyDigits(v);
  return d.length === 11 && Number(d.slice(0, 2)) >= 11 && d[2] === "9";
}

export const fmtData = (s: string) => format(s.length === 10 ? parseISO(s) : new Date(s), "dd/MM/yyyy");
export const fmtDataHora = (s: string) => format(new Date(s), "dd/MM/yyyy 'às' HH:mm");
export const fmtDiaSemana = (s: string) => format(parseISO(s), "EEEE, dd 'de' MMMM", { locale: ptBR });
export const fmtRel = (s: string) => formatDistanceToNow(new Date(s), { locale: ptBR, addSuffix: true });
export const fmtNum = (n: number) => n.toLocaleString("pt-BR");
export const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function mascararNome(nome: string) {
  const p = nome.split(" ");
  return [p[0], ...p.slice(1).map((x) => (x.length <= 3 ? "" : x[0] + "."))].filter(Boolean).join(" ");
}
export const primeiroNome = (nome: string) => nome.split(" ")[0];
