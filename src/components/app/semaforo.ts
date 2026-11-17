export type Semaforo = "verde" | "amarelo" | "vermelho";

/** Converte o número de vagas livres no semáforo de disponibilidade. */
export const semaforo = (livres: number): Semaforo =>
  livres <= 0 ? "vermelho" : livres <= 3 ? "amarelo" : "verde";
