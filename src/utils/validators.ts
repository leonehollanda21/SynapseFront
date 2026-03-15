export function validateSazonalizacao(q1: number, q2: number, q3: number, q4: number): boolean {
  const soma = q1 + q2 + q3 + q4;
  return Math.abs(soma - 1.0) < 0.001;
}

export function getSazonalizacaoTotal(q1: number, q2: number, q3: number, q4: number): number {
  return q1 + q2 + q3 + q4;
}

export function validateFlexibilidade(min: number, max: number): boolean {
  return min > 0 && max > 0 && min <= max;
}

export function validateVolume(volume: number): boolean {
  return volume > 0 && volume <= 500;
}

export function validateDatas(inicio: string, fim: string): boolean {
  return new Date(inicio) < new Date(fim);
}

export const TENSOES_VALIDAS = [110, 220, 380, 440, 11000, 13800, 34500, 138000];

export function validateTensao(tensao: number): boolean {
  return TENSOES_VALIDAS.includes(tensao);
}

export function validateDemanda(demanda: number): boolean {
  return demanda > 0;
}

export function validateCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpjLimpo)) return false;

  const digits = cnpjLimpo.split("").map(Number);
  const [a, b, c, d, e, f, g, h, i, j, k, l, v1, v2] = digits;

  let soma = a*5 + b*4 + c*3 + d*2 + e*9 + f*8 + g*7 + h*6 + i*5 + j*4 + k*3 + l*2;
  let resto = soma % 11;
  const d1 = resto < 2 ? 0 : 11 - resto;
  if (d1 !== v1) return false;

  soma = a*6 + b*5 + c*4 + d*3 + e*2 + f*9 + g*8 + h*7 + i*6 + j*5 + k*4 + l*3 + d1*2;
  resto = soma % 11;
  const d2 = resto < 2 ? 0 : 11 - resto;
  return d2 === v2;
}

export function formatCNPJ(cnpj: string): string {
  const digits = cnpj.replace(/\D/g, "");
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
