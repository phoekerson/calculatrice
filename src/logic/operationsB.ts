export function calculateProduct(a: number, b: number): number {
  return a * b;
}

export function calculateDivision(a: number, b: number): number {
  if (b === 0) return NaN;
  return a / b;
}
