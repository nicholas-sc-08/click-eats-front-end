import { MenuItem, Restaurant } from '../../../models/catalog.models';

export const RESTAURANTS: Restaurant[] = [
  { name: 'Brasa & Ponto', desc: 'Hambúrguer artesanal · Pinheiros', price: 38.9, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1100&q=85', tag: 'MAIS PEDIDO', rating: '4,9' },
  { name: 'Forno da Vila', desc: 'Pizza napolitana · Vila Madalena', price: 46.5, image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=1100&q=85', tag: 'FRETE GRÁTIS', rating: '4,8' },
  { name: 'Casa Nori', desc: 'Japonesa contemporânea · Pinheiros', price: 52, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1100&q=85', tag: 'NOVO NO BAIRRO', rating: '4,9' },
  { name: 'Quintal Brasileiro', desc: 'Comida brasileira · Sumaré', price: 34.9, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1100&q=85', tag: 'BEM AVALIADO', rating: '4,7' },
  { name: 'Doce Estação', desc: 'Doceria artesanal · Vila Madalena', price: 24.9, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1100&q=85', tag: 'DOCES ARTESANAIS', rating: '4,9' },
  { name: 'Verde Perto', desc: 'Comida leve · Pinheiros', price: 32.9, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1100&q=85', tag: 'LEVE E FRESCO', rating: '4,8' },
];

export const MENU_BY_RESTAURANT: Record<string, MenuItem[]> = {
  'Brasa & Ponto': [
    { name: 'Brasa Clássico', desc: 'Pão brioche, burger 160g, queijo prato, cebola caramelizada e molho da casa.', price: 38.9, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=85', tag: 'O FAVORITO' },
    { name: 'Duplo Cheddar', desc: 'Dois burgers na chapa, cheddar cremoso, picles e molho levemente defumado.', price: 46.9, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?auto=format&fit=crop&w=500&q=85', tag: 'BEM SERVIDO' },
    { name: 'Fritas da casa', desc: 'Batatas crocantes com páprica, alecrim e maionese artesanal.', price: 18.5, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=85', tag: 'ACOMPANHAMENTO' },
  ],
  'Forno da Vila': [
    { name: 'Margherita da Vila', desc: 'Tomate italiano, fior di latte, manjericão fresco e azeite.', price: 49.9, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=85', tag: 'CLÁSSICA' },
    { name: 'Calabresa artesanal', desc: 'Calabresa artesanal, cebola roxa, muçarela e orégano fresco.', price: 54.9, image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=85', tag: 'MAIS PEDIDA' },
    { name: 'Tiramisù da casa', desc: 'Creme de mascarpone, café espresso e cacau 100%.', price: 19.9, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=85', tag: 'SOBREMESA' },
  ],
  'Casa Nori': [
    { name: 'Combinado Nori', desc: '10 peças: salmão, atum, peixe branco e seleções do chef.', price: 58, image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=85', tag: 'DO CHEF' },
    { name: 'Temaki de salmão', desc: 'Salmão fresco, arroz temperado, cebolinha e gergelim.', price: 32.9, image: 'https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=500&q=85', tag: 'FEITO NA HORA' },
    { name: 'Guioza crocante', desc: 'Seis unidades recheadas com legumes e carne suína.', price: 24.9, image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=85', tag: 'ENTRADA' },
  ],
  'Quintal Brasileiro': [
    { name: 'Prato do Quintal', desc: 'Arroz soltinho, feijão da casa, carne grelhada, farofa e salada.', price: 36.9, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=85', tag: 'ALMOÇO COMPLETO' },
    { name: 'Frango com quiabo', desc: 'Receita de família com angu cremoso e cheiro-verde.', price: 34.9, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=85', tag: 'RECEITA DA CASA' },
    { name: 'Pudim de leite', desc: 'Pudim artesanal com calda de caramelo feita na casa.', price: 12.9, image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=85', tag: 'SOBREMESA' },
  ],
  'Doce Estação': [
    { name: 'Bolo de chocolate', desc: 'Massa fofinha, ganache meio amarga e frutas vermelhas.', price: 19.9, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=85', tag: 'FEITO HOJE' },
    { name: 'Cheesecake de frutas', desc: 'Cream cheese leve, base crocante e calda artesanal.', price: 22.9, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=500&q=85', tag: 'MAIS PEDIDO' },
    { name: 'Cookie recheado', desc: 'Cookie de baunilha com chocolate belga derretido.', price: 12.9, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=500&q=85', tag: 'QUENTINHO' },
  ],
  'Verde Perto': [
    { name: 'Bowl da horta', desc: 'Folhas frescas, abacate, grão-de-bico, tomate e molho cítrico.', price: 32.9, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=85', tag: 'VEGETARIANO' },
    { name: 'Frango & quinoa', desc: 'Frango grelhado, quinoa, legumes assados e molho de ervas.', price: 38.9, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=85', tag: 'PROTEÍNA' },
    { name: 'Suco verde', desc: 'Abacaxi, hortelã, couve e limão espremido na hora.', price: 14.9, image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=500&q=85', tag: 'NATURAL' },
  ],
};

export function deliveryEstimate(name: string): string {
  if (name === 'Brasa & Ponto' || name === 'Quintal Brasileiro' || name === 'Verde Perto') return '25–35';
  if (name === 'Doce Estação') return '20–30';
  return '30–40';
}

export function restaurantEmoji(name: string): string {
  if (name === 'Brasa & Ponto') return '🍔';
  if (name === 'Forno da Vila') return '🍕';
  if (name === 'Casa Nori') return '🍣';
  if (name === 'Doce Estação') return '🍰';
  if (name === 'Verde Perto') return '🥗';
  return '🍲';
}
