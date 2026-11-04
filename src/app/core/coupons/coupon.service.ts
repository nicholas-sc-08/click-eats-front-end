import { Injectable, signal } from '@angular/core';

export type CouponDiscountType='fixed'|'percent'|'free-delivery';
export interface Coupon { id:string;code:string;title:string;description:string;discountType:CouponDiscountType;discountValue:number;minimumSubtotal:number;startsAt:string;endsAt:string|null;usageLimit:number|null;used:number;active:boolean; }

const SEED:Coupon[]=[
  {id:'coupon-first-order',code:'PRIMEIRACOMPRA',title:'Primeira compra',description:'R$ 15 de desconto em pedidos acima de R$ 35.',discountType:'fixed',discountValue:15,minimumSubtotal:35,startsAt:'2026-01-01T00:00',endsAt:null,usageLimit:null,used:124,active:true},
  {id:'coupon-lunch-10',code:'ALMOCO10',title:'Almoço feliz',description:'R$ 10 de desconto em pedidos acima de R$ 50.',discountType:'fixed',discountValue:10,minimumSubtotal:50,startsAt:'2026-01-01T00:00',endsAt:null,usageLimit:500,used:184,active:true},
  {id:'coupon-free-delivery',code:'FRETEGRATIS',title:'Frete grátis',description:'Taxa de entrega grátis em restaurantes participantes.',discountType:'free-delivery',discountValue:0,minimumSubtotal:0,startsAt:'2026-01-01T00:00',endsAt:null,usageLimit:null,used:326,active:true},
];
const STORAGE_KEY='clickeat.coupons';

@Injectable({providedIn:'root'})
export class CouponService {
  readonly coupons=signal<Coupon[]>(this.load());
  save(coupon:Omit<Coupon,'id'|'used'>&{id?:string;used?:number}):void{const id=coupon.id||`coupon-${Date.now()}`;this.coupons.update(items=>{const next=[...items];const index=next.findIndex(item=>item.id===id);const saved:Coupon={...coupon,id,used:coupon.used??0};if(index<0)next.unshift(saved);else next[index]=saved;this.persist(next);return next;});}
  remove(id:string):void{this.coupons.update(items=>{const next=items.filter(item=>item.id!==id);this.persist(next);return next;});}
  consume(code:string):boolean{const normalized=code.trim().toUpperCase();let consumed=false;this.coupons.update(items=>{const index=items.findIndex(item=>item.code===normalized);if(index<0||!this.isAvailable(items[index]))return items;const next=[...items];next[index]={...next[index],used:next[index].used+1};consumed=true;this.persist(next);return next;});return consumed;}
  isAvailable(coupon:Coupon,now=new Date()):boolean{if(!coupon.active)return false;const starts=Date.parse(coupon.startsAt);if(Number.isFinite(starts)&&now.getTime()<starts)return false;if(coupon.endsAt){const ends=Date.parse(coupon.endsAt);if(Number.isFinite(ends)&&now.getTime()>ends)return false;}return coupon.usageLimit===null||coupon.used<coupon.usageLimit;}
  availabilityLabel(coupon:Coupon):string{if(!coupon.active)return 'Inativo';const now=Date.now();const starts=Date.parse(coupon.startsAt);if(Number.isFinite(starts)&&now<starts)return 'Agendado';if(coupon.endsAt&&now>Date.parse(coupon.endsAt))return 'Expirado';if(coupon.usageLimit!==null&&coupon.used>=coupon.usageLimit)return 'Esgotado';return 'Ativo';}
  private load():Coupon[]{try{const stored=localStorage.getItem(STORAGE_KEY);if(!stored)return SEED;const parsed:unknown=JSON.parse(stored);if(!Array.isArray(parsed))return SEED;const valid=parsed.filter((item):item is Coupon=>this.isCoupon(item));return valid.length?valid:SEED;}catch{return SEED;}}
  private isCoupon(value:unknown):value is Coupon{if(!value||typeof value!=='object')return false;const coupon=value as Partial<Coupon>;return typeof coupon.id==='string'&&typeof coupon.code==='string'&&typeof coupon.title==='string'&&typeof coupon.description==='string'&&(coupon.discountType==='fixed'||coupon.discountType==='percent'||coupon.discountType==='free-delivery')&&typeof coupon.discountValue==='number'&&typeof coupon.minimumSubtotal==='number'&&typeof coupon.startsAt==='string'&&(typeof coupon.endsAt==='string'||coupon.endsAt===null)&&(typeof coupon.usageLimit==='number'||coupon.usageLimit===null)&&typeof coupon.used==='number'&&typeof coupon.active==='boolean';}
  private persist(items:Coupon[]):void{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(items));}catch{/* A configuração segue disponível na sessão atual. */}}
}
