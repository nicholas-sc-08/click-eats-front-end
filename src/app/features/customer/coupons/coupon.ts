export type CouponCode = 'PRIMEIRACOMPRA' | 'ALMOCO10' | 'FRETEGRATIS';

export interface CouponResult {
  valid: boolean;
  code: CouponCode | null;
  discount: number;
  message: string;
}

export function calculateCoupon(codeValue: string, subtotal: number, deliveryFee: number): CouponResult {
  const code = codeValue.trim().toUpperCase() as CouponCode;
  if (subtotal <= 0) return { valid: false, code: null, discount: 0, message: 'Adicione itens à sacola antes de aplicar um cupom.' };

  if (code === 'PRIMEIRACOMPRA') {
    if (subtotal < 35) return { valid: false, code: null, discount: 0, message: 'Este cupom exige subtotal mínimo de R$ 35,00.' };
    return { valid: true, code, discount: Math.min(15, subtotal), message: 'Cupom PRIMEIRACOMPRA aplicado: R$ 15,00 de desconto.' };
  }
  if (code === 'ALMOCO10') {
    if (subtotal < 50) return { valid: false, code: null, discount: 0, message: 'Este cupom exige subtotal mínimo de R$ 50,00.' };
    return { valid: true, code, discount: Math.min(10, subtotal), message: 'Cupom ALMOCO10 aplicado: R$ 10,00 de desconto.' };
  }
  if (code === 'FRETEGRATIS') {
    return { valid: true, code, discount: deliveryFee, message: 'Cupom FRETEGRATIS aplicado: entrega grátis.' };
  }
  return { valid: false, code: null, discount: 0, message: 'Não encontramos esse cupom. Confira o código e tente novamente.' };
}
