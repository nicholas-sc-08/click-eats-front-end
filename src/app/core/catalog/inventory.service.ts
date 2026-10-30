import { Injectable, signal } from '@angular/core';
export interface ProductLimit { enabled:boolean;quantity:number; }
@Injectable({providedIn:'root'}) export class InventoryService {
 readonly limits=signal<Record<string,ProductLimit>>(this.load());
 private load():Record<string,ProductLimit>{try{return JSON.parse(localStorage.getItem('clickeat.inventory')||'{}') as Record<string,ProductLimit>;}catch{return {};}}
 limitFor(name:string):ProductLimit{return this.limits()[name]??{enabled:false,quantity:20};}
 save(name:string,limit:ProductLimit):void{this.limits.update(values=>{const next={...values,[name]:limit};try{localStorage.setItem('clickeat.inventory',JSON.stringify(next));}catch{/* Mantém os dados em memória nesta sessão. */}return next;});}
 available(name:string):boolean{const limit=this.limitFor(name);return !limit.enabled||limit.quantity>0;}
}
