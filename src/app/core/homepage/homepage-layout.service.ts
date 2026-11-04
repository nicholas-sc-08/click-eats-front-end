import { Injectable, signal } from '@angular/core';

export type HomeSectionId = 'search' | 'banner' | 'delivery' | 'categories' | 'restaurants';
export interface HomeSection { id:HomeSectionId;label:string;description:string; }
export interface HomeBannerSlide { id:string;eyebrow:string;lineOne:string;lineTwo:string;highlight:string;description:string;coupon:string;footnote:string; }

const DEFAULT_SECTIONS:HomeSection[]=[
  {id:'search',label:'Busca',description:'Campo de pesquisa de restaurantes e pratos'},
  {id:'banner',label:'Carrossel promocional',description:'Ofertas e destaques da página inicial'},
  {id:'delivery',label:'Pedido em andamento',description:'Acompanhamento do pedido atual'},
  {id:'categories',label:'Categorias',description:'Atalhos para tipos de comida'},
  {id:'restaurants',label:'Restaurantes',description:'Lojas recomendadas para o cliente'},
];
const DEFAULT_SLIDES:HomeBannerSlide[]=[
  {id:'welcome-offer',eyebrow:'✳ SÓ HOJE',lineOne:'Seu próximo',lineTwo:'pedido favorito',highlight:'tem desconto.',description:'Use PRIMEIRACOMPRA e ganhe R$ 15 de desconto no seu pedido.',coupon:'PRIMEIRACOMPRA',footnote:'*Em pedidos acima de R$ 35'},
  {id:'free-delivery',eyebrow:'✦ ENTREGA ESPECIAL',lineOne:'Uma pausa',lineTwo:'com sabor',highlight:'e frete grátis.',description:'Descubra novos sabores e aproveite sua próxima entrega por nossa conta.',coupon:'BEMVINDO',footnote:'*Consulte lojas participantes'},
];
const STORAGE_KEY='clickeat.homepage-layout';

@Injectable({providedIn:'root'})
export class HomepageLayoutService {
  private readonly initial=this.load();
  readonly sections=signal<HomeSection[]>(this.initial.sections);
  readonly slides=signal<HomeBannerSlide[]>(this.initial.slides);
  moveSection(id:HomeSectionId,direction:-1|1):void{const current=this.sections();const index=current.findIndex(section=>section.id===id);const target=index+direction;if(index<0||target<0||target>=current.length)return;const next=[...current];[next[index],next[target]]=[next[target],next[index]];this.sections.set(next);this.persist();}
  reorderSections(ids:HomeSectionId[]):void{const current=this.sections();if(ids.length!==current.length||new Set(ids).size!==current.length)return;const byId=new Map(current.map(section=>[section.id,section]));this.sections.set(ids.map(id=>byId.get(id)).filter((item):item is HomeSection=>!!item));this.persist();}
  saveSlide(slide:HomeBannerSlide):void{this.slides.update(current=>{const index=current.findIndex(item=>item.id===slide.id);const next=[...current];if(index<0)next.push(slide);else next[index]=slide;return next;});this.persist();}
  removeSlide(id:string):void{this.slides.update(current=>current.filter(slide=>slide.id!==id));this.persist();}
  moveSlide(id:string,direction:-1|1):void{const current=this.slides();const index=current.findIndex(slide=>slide.id===id);const target=index+direction;if(index<0||target<0||target>=current.length)return;const next=[...current];[next[index],next[target]]=[next[target],next[index]];this.slides.set(next);this.persist();}
  private load():{sections:HomeSection[];slides:HomeBannerSlide[]}{try{const stored=localStorage.getItem(STORAGE_KEY);if(stored){const data=JSON.parse(stored) as {sections?:HomeSection[];slides?:HomeBannerSlide[]};return {sections:this.validSections(data.sections),slides:this.validSlides(data.slides)};}}catch{/* Recomeça com conteúdo demonstrativo se o armazenamento estiver inválido. */}return {sections:DEFAULT_SECTIONS,slides:DEFAULT_SLIDES};}
  private validSections(value?:HomeSection[]):HomeSection[]{if(!Array.isArray(value))return DEFAULT_SECTIONS;const ids=new Set<HomeSectionId>(['search','banner','delivery','categories','restaurants']);const valid=value.filter(item=>ids.has(item?.id));return valid.length===ids.size&&new Set(valid.map(item=>item.id)).size===ids.size?valid:DEFAULT_SECTIONS;}
  private validSlides(value?:HomeBannerSlide[]):HomeBannerSlide[]{if(!Array.isArray(value))return DEFAULT_SLIDES;const valid=value.filter(item=>item&&typeof item.id==='string'&&typeof item.lineOne==='string'&&typeof item.lineTwo==='string'&&typeof item.highlight==='string'&&typeof item.description==='string'&&typeof item.coupon==='string'&&typeof item.footnote==='string'&&typeof item.eyebrow==='string');return valid.length?valid:DEFAULT_SLIDES;}
  private persist():void{try{localStorage.setItem(STORAGE_KEY,JSON.stringify({sections:this.sections(),slides:this.slides()}));}catch{/* Mantém a configuração em memória até o fim da sessão. */}}
}
