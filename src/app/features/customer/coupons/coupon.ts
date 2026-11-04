import { Coupon } from '../../../core/coupons/coupon.service';

export interface CouponResult {
  valid: boolean;
  code: string | null;
  discount: number;
  message: string;
}

export function calculateCoupon(codeValue: string, subtotal: number, deliveryFee: number, coupons: readonly Coupon[] = [], now = new Date()): CouponResult {
  const code = codeValue.trim().toUpperCase();
  if (subtotal <= 0) return { valid: false, code: null, discount: 0, message: 'Adicione itens à sacola antes de aplicar um cupom.' };
  const coupon=coupons.find(item=>item.code===code);
  if(!coupon)return {valid:false,code:null,discount:0,message:'Não encontramos esse cupom. Confira o código e tente novamente.'};
  if(!coupon.active)return {valid:false,code:null,discount:0,message:'Este cupom está temporariamente indisponível.'};
  if(Date.parse(coupon.startsAt)>now.getTime())return {valid:false,code:null,discount:0,message:'Este cupom ainda não começou.'};
  if(coupon.endsAt&&Date.parse(coupon.endsAt)<now.getTime())return {valid:false,code:null,discount:0,message:'Este cupom expirou.'};
  if(coupon.usageLimit!==null&&coupon.used>=coupon.usageLimit)return {valid:false,code:null,discount:0,message:'Este cupom atingiu o limite de usos.'};
  if(subtotal<coupon.minimumSubtotal)return {valid:false,code:null,discount:0,message:`Este cupom exige subtotal mínimo de R$ ${coupon.minimumSubtotal.toFixed(2).replace('.',',')}.`};
  const discount=coupon.discountType==='free-delivery'?deliveryFee:coupon.discountType==='percent'?Math.min(subtotal,Math.round(subtotal*coupon.discountValue)/100):Math.min(subtotal,coupon.discountValue);
  const display=coupon.discountType==='free-delivery'?'entrega grátis':coupon.discountType==='percent'?`${coupon.discountValue}% de desconto`:`R$ ${discount.toFixed(2).replace('.',',')} de desconto`;
  return {valid:true,code,discount,message:`Cupom ${code} aplicado: ${display}.`};
}
