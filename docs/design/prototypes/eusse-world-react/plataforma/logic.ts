// @ts-nocheck
/* Estado, datos de ejemplo y lógica de la plataforma mayorista.
   Reemplace las constantes PROVS / PRODS / SEED_* por datos de su API. */
import React from 'react';

export interface PlataformaProps {
  /** Diseño del detalle de producto: A = todo en una página, B = paso a paso */
  productDetailVariant?: 'A' | 'B';
  /** Diseño de órdenes del panel: A = tabla + panel lateral, B = lista + detalle */
  ordersVariant?: 'A' | 'B';
  /** Compra mínima por proveedor (por defecto 6) */
  minimumPerProvider?: number;
}

const C = { negro:['Negro','#1d1f20'], blanco:['Blanco','#f4f4f2'], gris:['Gris jaspe','#a7a9ac'], marino:['Azul marino','#26344b'], arena:['Arena','#d8c7a6'], oliva:['Verde oliva','#5d6b3f'], vino:['Vino','#6b2737'], cielo:['Azul cielo','#a9c8e6'], indigo:['Índigo','#2f4466'], clasico:['Azul clásico','#4f6f96'], caqui:['Caqui','#a8946a'] };
const ROPA = ['XS','S','M','L','XL','XXL'], CALZ = ['36','37','38','39','40','41','42','43'], JEAN = ['28','30','32','34','36'];
const PROVS = [
  { id:'p1', name:'Textiles Andinos', city:'Medellín', country:'CO', lead:'5–7 días', since:'2019', about:'Confección de prendas básicas en algodón peinado para tiendas y marcas propias.' },
  { id:'p2', name:'Urbano Wear', city:'Bogotá', country:'CO', lead:'7–10 días', since:'2020', about:'Camisas y pantalones casuales con patronaje propio y tela nacional.' },
  { id:'p3', name:'Paso Firme Calzado', city:'Cali', country:'CO', lead:'8–12 días', since:'2017', about:'Tenis urbanos y deportivos fabricados en serie corta.' },
  { id:'p4', name:'Norte Denim', city:'Medellín', country:'CO', lead:'6–9 días', since:'2018', about:'Jeans y shorts en denim rígido y stretch, lavados en planta propia.' },
  { id:'p5', name:'Pura Vida Basics', city:'San José', country:'CR', lead:'5–8 días', since:'2021', about:'Prendas deportivas en tela técnica de secado rápido.' },
  { id:'p6', name:'Gulf Sourcing Co.', city:'Miami', country:'US', lead:'10–14 días', since:'2016', about:'Abastecimiento de marcas y básicos premium desde Estados Unidos.' },
];
const PRINT = {
  p2:{ on:true, types:[['Bordado',2.2]], sizes:[['8 × 8 cm',0],['12 × 12 cm',0.8]], places:['Pecho','Espalda'] },
  p3:{ on:false }, p4:{ on:false },
  p5:{ on:true, types:[['DTF',1.1],['Sublimación',0.8]], sizes:[['15 × 15 cm',0],['28 × 35 cm',1]], places:['Frente','Espalda'] },
  p6:{ on:true, types:[['DTF',1.4],['Serigrafía',1]], sizes:[['10 × 10 cm',0],['25 × 30 cm',0.9]], places:['Frente','Espalda'] },
};
const PRODS = [
  ['a1','p1','Camiseta básica 180 g','Camisetas',4.8,['negro','blanco','gris','marino','arena'],ROPA],
  ['a2','p1','Camiseta oversize 220 g','Camisetas',6.2,['blanco','negro','arena','oliva'],ROPA],
  ['a3','p1','Sudadera capucha perchada','Sudaderas',13.5,['gris','negro','marino','vino'],ROPA],
  ['a4','p1','Sudadera cuello redondo','Sudaderas',11.9,['arena','gris','negro'],ROPA],
  ['a5','p1','Camiseta polo piqué','Camisetas',7.4,['blanco','marino','negro','vino'],ROPA],
  ['b1','p2','Camisa oxford manga larga','Camisas',9.8,['cielo','blanco','marino'],ROPA],
  ['b2','p2','Camisa de lino','Camisas',11.2,['blanco','arena','cielo'],ROPA],
  ['b3','p2','Jogger cargo','Pantalones',12.4,['negro','oliva','caqui'],ROPA],
  ['b4','p2','Pantalón drill clásico','Pantalones',13.9,['caqui','marino','negro'],JEAN],
  ['c1','p3','Tenis urbano en lona','Tenis',15.5,['blanco','negro','marino'],CALZ],
  ['c2','p3','Tenis running liviano','Tenis',22,['negro','gris','cielo'],CALZ],
  ['c3','p3','Tenis plataforma','Tenis',19.8,['blanco','arena'],CALZ],
  ['d1','p4','Jean slim stretch','Pantalones',14.2,['indigo','negro','clasico'],JEAN],
  ['d2','p4','Jean mom fit','Pantalones',15.1,['clasico','indigo'],JEAN],
  ['d3','p4','Short denim','Pantalones',9.6,['clasico','negro'],JEAN],
  ['e1','p5','Camiseta dry-fit','Camisetas',5.9,['negro','blanco','cielo','gris'],ROPA],
  ['e2','p5','Hoodie con cremallera','Sudaderas',16.4,['negro','gris','marino'],ROPA],
  ['f1','p6','Hoodie heavyweight 400 g','Sudaderas',18.9,['negro','gris','arena','oliva'],ROPA],
  ['f2','p6','Camiseta algodón pima','Camisetas',8.7,['blanco','negro','marino'],ROPA],
  ['f3','p6','Tenis clásico en cuero','Tenis',24.5,['blanco','negro'],CALZ],
].map(([id,prov,name,cat,price,cols,sizes]) => ({ id, prov, name, cat, price, sizes, colors: cols.map(k => ({ n:C[k][0], hex:C[k][1] })) }));
const PBY = Object.fromEntries(PRODS.map(p => [p.id, p]));
const VBY = Object.fromEntries(PROVS.map(p => [p.id, p]));
const CATS = ['Todos','Camisetas','Camisas','Sudaderas','Pantalones','Tenis'];
const STATUS = ['Nueva','Confirmada','En producción','Enviada'];
const SCHIP = [['#d6ebff','#2c455d'],['#e0e0e2','#1d1f20'],['#1d2d3d','#d6ebff'],['#5980a6','#f2f2f3']];
const ADV = ['Confirmar orden','Pasar a producción','Marcar como enviada'];
const money = v => 'US$ ' + v.toFixed(2);
const lum = h => { const n = parseInt(h.slice(1),16); return (0.299*(n>>16) + 0.587*(n>>8&255) + 0.114*(n&255)) / 255; };
const fgFor = h => lum(h) > 0.6 ? '#1d1f20' : '#f2f2f3';
const opt = (label, on, onClick, extra) => ({ label, extra, onClick, bg: on ? '#1d2d3d' : 'transparent', fg: on ? '#f2f2f3' : '#1d1f20', bd: on ? '#1d2d3d' : 'rgba(29,31,32,.2)' });
const track = st => STATUS.map((l,i) => ({ label:l, bar: i <= st ? '#5980a6' : '#d9d9dc', fg: i <= st ? '#1d1f20' : '#98989b' }));
const SEED_P = [
  { id:'EW-10482', merchant:'Tienda La 70', contact:'Laura Gómez', phone:'+57 300 412 8890', address:'Cl. 70 # 45-12, local 3', city:'Medellín, CO', date:'23 oct', status:0, total:118.8, items:[{ name:'Camiseta básica 180 g', color:'Negro', hex:'#1d1f20', sizes:'S×2  M×4  L×4  XL×2', qty:12, print:'DTF · 20 × 25 cm · Frente' }, { name:'Sudadera capucha perchada', color:'Gris jaspe', hex:'#a7a9ac', sizes:'M×3  L×3', qty:6, print:'Sin estampado' }] },
  { id:'EW-10479', merchant:'Moda Express Cartago', contact:'Andrés Solís', phone:'+506 8812 4410', address:'Av. 2, frente al parque', city:'Cartago, CR', date:'22 oct', status:0, total:74.4, items:[{ name:'Camiseta oversize 220 g', color:'Arena', hex:'#d8c7a6', sizes:'S×3  M×3  L×3  XL×3', qty:12, print:'Sin estampado' }] },
  { id:'EW-10471', merchant:'Boutique Granada', contact:'María José Ruiz', phone:'+505 8455 0912', address:'Calle La Calzada, 120 m al este', city:'Granada, NI', date:'20 oct', status:1, total:96.6, items:[{ name:'Camiseta polo piqué', color:'Azul marino', hex:'#26344b', sizes:'M×4  L×4  XL×2', qty:10, print:'Bordado · 10 × 10 cm · Frente' }] },
  { id:'EW-10458', merchant:'Urban Spot Bogotá', contact:'Felipe Rojas', phone:'+57 315 220 1874', address:'Cra. 13 # 63-40', city:'Bogotá, CO', date:'18 oct', status:2, total:283.2, items:[{ name:'Sudadera cuello redondo', color:'Negro', hex:'#1d1f20', sizes:'S×4  M×6  L×6  XL×4', qty:20, print:'Serigrafía · 30 × 40 cm · Espalda' }] },
  { id:'EW-10433', merchant:'Tienda La 70', contact:'Laura Gómez', phone:'+57 300 412 8890', address:'Cl. 70 # 45-12, local 3', city:'Medellín, CO', date:'11 oct', status:3, total:86.4, items:[{ name:'Camiseta básica 180 g', color:'Blanco', hex:'#f4f4f2', sizes:'M×6  L×6  XL×6', qty:18, print:'Sin estampado' }] },
];
const SEED_M = [
  { id:'EW-10455', prov:'Textiles Andinos', date:'19 oct', status:2, qty:12, total:88.2 },
  { id:'EW-10391', prov:'Urbano Wear', date:'02 oct', status:3, qty:18, total:201.6 },
];
const EXTRACT = [
  { page:2, name:'Camiseta básica cuello redondo 180 g', cat:'Camisetas', price:'4.80', colors:'Negro, Blanco, Gris jaspe, Azul marino', sizes:'XS–XXL', flag:'' },
  { page:3, name:'Camiseta oversize 220 g', cat:'Camisetas', price:'6.20', colors:'Blanco, Negro, Arena, Verde oliva', sizes:'S–XXL', flag:'' },
  { page:4, name:'Camiseta manga larga', cat:'Camisetas', price:'', colors:'Negro, Blanco', sizes:'S–XL', flag:'Precio no detectado' },
  { page:5, name:'Sudadera capucha perchada', cat:'Sudaderas', price:'13.50', colors:'Gris jaspe, Negro, Azul marino, Vino', sizes:'S–XXL', flag:'' },
  { page:6, name:'Sudadera cuello redondo', cat:'Sudaderas', price:'11.90', colors:'Arena, Gris jaspe, Negro', sizes:'S–XL', flag:'' },
  { page:7, name:'Polo piqué', cat:'Camisetas', price:'7.40', colors:'Blanco, Azul marino, Negro, Vino', sizes:'S, M, L ?', flag:'Revisar tallas' },
  { page:8, name:'Jogger perchado', cat:'Pantalones', price:'10.90', colors:'Negro, Gris jaspe', sizes:'S–XL', flag:'' },
];
const PC0 = () => ({ on:true,
  types:[{ n:'DTF', desc:'Full color, ideal para diseños detallados', price:'1.20', on:true }, { n:'Serigrafía', desc:'Hasta 3 tintas, mejor en volumen', price:'0.90', on:true }, { n:'Bordado', desc:'Hilo sobre la prenda, acabado premium', price:'2.40', on:true }, { n:'Sublimación', desc:'Solo telas de poliéster claras', price:'0.80', on:false }],
  sizes:[{ n:'10 × 10 cm', price:'0', on:true }, { n:'20 × 25 cm', price:'0.60', on:true }, { n:'30 × 40 cm', price:'1.20', on:true }],
  places:[{ n:'Frente', on:true }, { n:'Espalda', on:true }, { n:'Manga', on:true }, { n:'Pecho izquierdo', on:false }] });
const SCREENS = [['auth','Registro'],['shop','Tienda · proveedores'],['provider','Perfil del proveedor'],['product','Detalle de producto'],['cart','Carrito'],['checkout','Checkout'],['orders','Mis pedidos'],['panel:resumen','Panel · resumen'],['panel:orders','Panel · órdenes'],['panel:catalog','Panel · catálogo PDF'],['panel:print','Panel · estampados']];

export class PlataformaLogic extends React.Component<PlataformaProps, any> {
  state = {
    screen:'auth', role:'merchant', authMode:'register', q:'', cat:'Todos', provId:'p1', provCat:'Todos', prodId:'a1',
    cfg:{ color:0, qty:{}, print:false, type:0, size:1, place:0, file:'', fileName:'', step:1 },
    cart:[], mOrders:SEED_M, pOrders:SEED_P, lastIds:[], pay:0, paying:false,
    tab:'resumen', orderSel:'EW-10482', drawer:false, sFilter:-1,
    up:{ stage:0, pct:0, file:'' }, ex:[], published:false, pc:PC0(),
    pdVar:null, panelVar:null, jump:false, toast:''
  };
  componentWillUnmount() { clearInterval(this.iv); clearTimeout(this.tt); }
  go(screen, extra) { this.setState({ screen, jump:false, ...(extra || {}) }); window.scrollTo(0, 0); }
  say(t) { clearTimeout(this.tt); this.setState({ toast:t }); this.tt = setTimeout(() => this.setState({ toast:'' }), 2600); }
  printFor(pid) {
    if (pid === 'p1') { const pc = this.state.pc; const types = pc.types.filter(t => t.on), sizes = pc.sizes.filter(t => t.on), places = pc.places.filter(t => t.on);
      return { on: pc.on && types.length > 0 && sizes.length > 0, types: types.map(t => ({ n:t.n, price:+t.price || 0 })), sizes: sizes.map(t => ({ n:t.n, price:+t.price || 0 })), places: places.length ? places.map(t => t.n) : ['Frente'] }; }
    const p = PRINT[pid]; if (!p || !p.on) return { on:false, types:[], sizes:[], places:[] };
    return { on:true, types:p.types.map(([n,price]) => ({ n, price })), sizes:p.sizes.map(([n,price]) => ({ n, price })), places:p.places };
  }
  provView(pv) {
    const prods = PRODS.filter(p => p.prov === pv.id);
    return { ...pv, loc:`${pv.city}, ${pv.country}`, initials: pv.name.split(' ').map(w => w[0]).slice(0,2).join(''), count: prods.length, cats:[...new Set(prods.map(p => p.cat))].join(' · ') };
  }
  unitOf(p, print) { if (!print) return p.price; const pc = this.printFor(p.prov); const t = pc.types[print.type], s = pc.sizes[print.size]; return p.price + (t ? t.price : 0) + (s ? s.price : 0); }
  openProduct(id) { this.go('product', { prodId:id, cfg:{ color:0, qty:{}, print:false, type:0, size:Math.min(1, this.printFor(PBY[id].prov).sizes.length - 1), place:0, file:'', fileName:'', step:1 } }); }
  setCfg(o) { this.setState(s => ({ cfg:{ ...s.cfg, ...o } })); }
  setQty(z, d) { this.setState(s => { const q = { ...s.cfg.qty }; q[z] = Math.max(0, (q[z] || 0) + d); return { cfg:{ ...s.cfg, qty:q } }; }); }
  jumpTo(key) {
    const [sc, tab] = key.split(':');
    if (sc === 'panel') return this.go('panel', { role:'provider', tab, drawer:false });
    if (sc === 'product') return this.openProduct(this.state.prodId || 'a1');
    if ((sc === 'cart' || sc === 'checkout') && !this.state.cart.length) {
      const demo = [{ key:'d1', pid:'a1', color:0, qty:{ S:2, M:3, L:3 }, print:{ type:0, size:1, place:0, file:'', fileName:'' } }, { key:'d2', pid:'b1', color:0, qty:{ M:2, L:2 }, print:null }];
      return this.go(sc, { role:'merchant', cart:demo });
    }
    this.go(sc, { role: sc === 'auth' ? this.state.role : 'merchant' });
  }
  startUpload(name) {
    clearInterval(this.iv);
    this.setState({ up:{ stage:1, pct:0, file:name }, published:false });
    this.iv = setInterval(() => this.setState(s => {
      let { stage, pct } = s.up; pct += stage === 3 ? 3 : 6;
      if (pct >= 100) { stage++; pct = 0; }
      if (stage >= 4) { clearInterval(this.iv); return { up:{ ...s.up, stage:4, pct:100 }, ex: EXTRACT.map((r,i) => ({ ...r, key:i })) }; }
      return { up:{ ...s.up, stage, pct } };
    }), 70);
  }
  editEx(key, field, val) { this.setState(s => ({ ex: s.ex.map(r => r.key === key ? { ...r, [field]:val, flag: field === 'price' && r.flag === 'Precio no detectado' && val ? '' : r.flag } : r) })); }
  editPc(list, i, o) { this.setState(s => ({ pc:{ ...s.pc, [list]: s.pc[list].map((t,j) => j === i ? { ...t, ...o } : t) } })); }

  renderVals() {
    const s = this.state, cfg = s.cfg;
    const pdVar = s.pdVar || this.props.productDetailVariant || 'A';
    const panelVar = s.panelVar || this.props.ordersVariant || 'A';
    const minQ = this.props.minimumPerProvider ?? 6;
    const isMerchantScreen = ['shop','provider','product','cart','checkout','success','orders'].includes(s.screen);

    const roleOpts = [['merchant','Comerciante','Compro al por mayor para vender en mi tienda.'],['provider','Proveedor','Vendo prendas al por mayor y subo mi catálogo.']].map(([k,l,sub]) => { const on = s.role === k; return { label:l, sub, onClick:() => this.setState({ role:k }), bg: on ? '#1d2d3d' : 'transparent', fg: on ? '#f2f2f3' : '#1d1f20', bd: on ? '#1d2d3d' : 'rgba(29,31,32,.2)', dot: on ? '#b5d9fd' : 'rgba(29,31,32,.4)', dotFill: on ? '#b5d9fd' : 'transparent' }; });
    const reg = s.authMode === 'register';

    // shop
    const ql = s.q.trim().toLowerCase();
    const provCards = PROVS.map(pv => this.provView(pv)).filter(pv => {
      const prods = PRODS.filter(p => p.prov === pv.id);
      if (s.cat !== 'Todos' && !prods.some(p => p.cat === s.cat)) return false;
      if (ql && !(pv.name.toLowerCase().includes(ql) || prods.some(p => p.name.toLowerCase().includes(ql) || p.cat.toLowerCase().includes(ql)))) return false;
      return true;
    }).map(pv => { const prods = PRODS.filter(p => p.prov === pv.id); const cs = prods.flatMap(p => p.colors.map(c => c.hex)); const u = [...new Set(cs)]; const pr = this.printFor(pv.id);
      return { ...pv, c1:u[0], c1fg:fgFor(u[0]), c2:u[1] || u[0], c3:u[2] || u[0], printShort: pr.on ? pr.types.map(t => t.n).slice(0,2).join(', ') : 'No', onOpen:() => this.go('provider', { provId:pv.id, provCat:'Todos' }) }; });

    // provider
    const prov = this.provView(VBY[s.provId] || PROVS[0]);
    const ppr = this.printFor(prov.id);
    const provPrint = { on:ppr.on, off:!ppr.on, types:ppr.types.map(t => ({ label:t.n, extra: t.price ? '+' + money(t.price) : 'incluido' })), sizes:ppr.sizes.map(t => ({ label:t.n })), placesText:ppr.places.join(' · ') };
    const provAll = PRODS.filter(p => p.prov === prov.id);
    const provCats = ['Todos', ...new Set(provAll.map(p => p.cat))];
    const provProducts = provAll.filter(p => s.provCat === 'Todos' || p.cat === s.provCat).map(p => ({ ...p, hex:p.colors[0].hex, fg:fgFor(p.colors[0].hex), priceText:money(p.price), sizeRange:`${p.sizes[0]}–${p.sizes[p.sizes.length-1]}`, dots:p.colors, printable:ppr.on && p.cat !== 'Tenis' && p.cat !== 'Pantalones', onOpen:() => this.openProduct(p.id) }));
    const qtyOf = it => Object.values(it.qty).reduce((a,b) => a + b, 0);
    const provQty = pid => s.cart.filter(i => PBY[i.pid].prov === pid).reduce((a,i) => a + qtyOf(i), 0);
    const pq = provQty(prov.id);
    const provCart = { has: pq > 0, qty: pq, pct: Math.min(100, pq / minQ * 100) + '%', bar: pq >= minQ ? '#5d6b3f' : '#5980a6' };

    // product
    const pd = PBY[s.prodId] || PRODS[0];
    const pdProv = this.provView(VBY[pd.prov]);
    const pdPrint = this.printFor(pd.prov);
    const printAvail = pdPrint.on && pd.cat !== 'Tenis' && pd.cat !== 'Pantalones';
    const col = pd.colors[cfg.color] || pd.colors[0];
    const totalQty = Object.values(cfg.qty).reduce((a,b) => a + b, 0);
    const printing = printAvail && cfg.print;
    const unit = this.unitOf(pd, printing ? cfg : null);
    const curT = pdPrint.types[cfg.type], curS = pdPrint.sizes[cfg.size];
    const inCart = provQty(pd.prov);
    const after = inCart + totalQty;
    const minNote = after >= minQ ? { text:`Con este artículo completas ${after} de ${minQ} mínimos con ${pdProv.name}.`, color:'#5d6b3f' } : { text:`Mínimo ${minQ} artículos con ${pdProv.name}. Llevarías ${after}; faltan ${minQ - after}. Puedes completar con otros productos del proveedor.`, color:'#5d5d60' };
    const sizesSummary = Object.entries(cfg.qty).filter(([,v]) => v).map(([k,v]) => `${k}×${v}`).join('  ') || '—';
    const place = pdPrint.places[cfg.place] || 'Frente';
    const sw = ['24%','36%','48%'][Math.min(2, Math.round(cfg.size * 2 / Math.max(1, pdPrint.sizes.length - 1)))] || '36%';
    const mock = place === 'Manga' ? { left:'70%', top:'30%', w:'14%' } : place.startsWith('Pecho') ? { left:'56%', top:'24%', w:'16%' } : { left:`calc(50% - ${parseInt(sw)/2}%)`, top: place === 'Espalda' ? '18%' : '24%', w:sw };
    const colorOpts = pd.colors.map((c,i) => ({ ...c, onClick:() => this.setCfg({ color:i }), ring: i === cfg.color ? '#5980a6' : 'rgba(29,31,32,.2)', bg: i === cfg.color ? '#e9e9ea' : 'transparent', bd: i === cfg.color ? '#1d1f20' : 'rgba(29,31,32,.2)' }));
    const sizeRows = pd.sizes.map(z => { const q = cfg.qty[z] || 0; return { size:z, qty:q, inc:() => this.setQty(z,1), dec:() => this.setQty(z,-1), bg: q ? '#d6ebff' : 'transparent', bd: q ? '#5980a6' : 'rgba(29,31,32,.16)' }; });
    const typeOpts = pdPrint.types.map((t,i) => ({ ...opt(t.n, i === cfg.type, () => this.setCfg({ type:i }), t.price ? '+' + money(t.price) : 'incluido'), i }));
    const sizeOpts = pdPrint.sizes.map((t,i) => ({ ...opt(t.n, i === cfg.size, () => this.setCfg({ size:i }), t.price ? '+' + money(t.price) : 'incluido'), i }));
    const placeOpts = pdPrint.places.map((n,i) => opt(n, i === cfg.place, () => this.setCfg({ place:i })));
    const printSummary = printing ? `${curT ? curT.n : ''} · ${curS ? curS.n : ''} · ${place}` : 'Sin estampado';
    const steps = [
      { n:'1', title:'Color', summary: col.n, k:1 },
      { n:'2', title:'Tallas y cantidades', summary: totalQty ? `${totalQty} u. · ${sizesSummary}` : 'Sin cantidades', k:2 },
      { n:'3', title:'Estampado', summary: printAvail ? printSummary : 'No disponible', k:3 },
    ].map(st => { const on = cfg.step === st.k, done = cfg.step > st.k; return { ...st, onClick:() => this.setCfg({ step:st.k }), nbg: on ? '#1d2d3d' : done ? '#5980a6' : 'transparent', nfg: on || done ? '#f2f2f3' : '#5d5d60', nbd: on ? '#1d2d3d' : done ? '#5980a6' : 'rgba(29,31,32,.25)', rot: on ? '180deg' : '0deg' }; });

    // cart
    const groups = PROVS.map(pv => {
      const items = s.cart.filter(i => PBY[i.pid].prov === pv.id); if (!items.length) return null;
      const v = this.provView(pv); const qty = items.reduce((a,i) => a + qtyOf(i), 0);
      const sub = items.reduce((a,i) => a + qtyOf(i) * this.unitOf(PBY[i.pid], i.print), 0);
      const pr = this.printFor(pv.id); const ok = qty >= minQ;
      return { ...v, qty, ok, sub, subtotalText:money(sub), ship: 12 + Math.ceil(qty / 12) * 4, pct: Math.min(100, qty / minQ * 100) + '%', bar: ok ? '#5d6b3f' : '#5980a6', note: ok ? `Mínimo cumplido · ${qty} artículos` : `${qty} de ${minQ} · faltan ${minQ - qty}`, noteColor: ok ? '#5d6b3f' : '#8a4b1f', addMore:() => this.go('provider', { provId:pv.id, provCat:'Todos' }),
        items: items.map(i => { const p = PBY[i.pid], c = p.colors[i.color], q = qtyOf(i), u = this.unitOf(p, i.print);
          return { name:p.name, colorName:c.n, hex:c.hex, qty:q, unitText:money(u), totalText:money(u * q), sizesText:Object.entries(i.qty).filter(([,v]) => v).map(([k,v]) => `${k}×${v}`).join('  '), printText: i.print ? `${pr.types[i.print.type]?.n} · ${pr.sizes[i.print.size]?.n} · ${pr.places[i.print.place] || ''}${i.print.fileName ? ' · ' + i.print.fileName : ''}` : 'Sin estampado', hasFile: !!(i.print && i.print.file), file: i.print ? i.print.file : '', fileBg: i.print && i.print.file ? `url(${i.print.file})` : 'none', remove:() => this.setState(st => ({ cart: st.cart.filter(x => x.key !== i.key) })) }; }) };
    }).filter(Boolean).map(g => ({ ...g, shipText:money(g.ship) }));
    const cartQty = s.cart.reduce((a,i) => a + qtyOf(i), 0);
    const cartSub = groups.reduce((a,g) => a + g.sub, 0);
    const shipTot = groups.reduce((a,g) => a + g.ship, 0);
    const bad = groups.filter(g => !g.ok);
    const cartOk = groups.length > 0 && !bad.length;

    // panel
    const po = s.pOrders;
    const filtered = po.filter(o => s.sFilter < 0 || o.status === s.sFilter);
    const sel = po.find(o => o.id === s.orderSel) || po[0];
    const rowOf = o => { const [sbg,sfg] = SCHIP[o.status]; const on = sel && o.id === sel.id; const qty = o.items.reduce((a,i) => a + i.qty, 0);
      return { ...o, qty, totalText:money(o.total), statusText:STATUS[o.status], sbg, sfg, rowBg: on && (panelVar === 'B' || s.drawer) ? '#e3ebf3' : 'transparent', rowBd: on ? '#5980a6' : 'transparent', onClick:() => this.setState({ tab:'orders', orderSel:o.id, drawer:true, screen:'panel' }), onSelect:() => this.setState({ orderSel:o.id }) }; };
    const od = sel ? { ...sel, totalText:money(sel.total), track:track(sel.status), canAdvance: sel.status < 3, advanceLabel: ADV[sel.status] || '', items: sel.items.map(i => ({ ...i, hasFile: !!i.file, fileBg: i.file ? `url(${i.file})` : 'none' })) } : {};
    const newCount = po.filter(o => o.status === 0).length;
    const prodCount = po.filter(o => o.status === 2).length;
    const merchants = new Set(po.map(o => o.merchant)).size;
    const month = po.reduce((a,o) => a + o.total, 0);
    const navItems = [['resumen','Resumen'],['orders','Órdenes'],['catalog','Catálogo'],['print','Estampados']];
    const flagged = s.ex.filter(r => r.flag).length;
    const upStepsL = ['Subiendo archivo','Leyendo páginas','Extrayendo productos'];
    const pc = s.pc;
    const pcView = this.printFor('p1');
    const tg = on => ({ bg: on ? '#5980a6' : '#d9d9dc', bd: on ? '#5980a6' : '#c4c4c8', jc: on ? 'flex-end' : 'flex-start', knob:'#f2f2f3' });

    return {
      isAuth: s.screen === 'auth', isMerchant: isMerchantScreen, isShop: s.screen === 'shop', isProvider: s.screen === 'provider', isProduct: s.screen === 'product', isCart: s.screen === 'cart', isCheckout: s.screen === 'checkout', isSuccess: s.screen === 'success', isOrders: s.screen === 'orders', isPanel: s.screen === 'panel',
      roleOpts, isRegister: reg, authEyebrow: reg ? 'Crear cuenta' : 'Bienvenido de nuevo', authTitle: reg ? (s.role === 'merchant' ? 'Empieza a comprar' : 'Empieza a vender') : 'Inicia sesión',
      bizLabel: s.role === 'merchant' ? 'Nombre de tu tienda' : 'Razón social', bizPh: s.role === 'merchant' ? 'Tienda La 70' : 'Textiles Andinos S.A.S.',
      authCta: reg ? 'Crear cuenta' : 'Entrar', authSwitchText: reg ? '¿Ya tienes cuenta?' : '¿Aún no tienes cuenta?', authSwitchCta: reg ? 'Inicia sesión' : 'Regístrate',
      toggleAuthMode: () => this.setState({ authMode: reg ? 'login' : 'register' }),
      submitAuth: () => s.role === 'merchant' ? this.go('shop') : this.go('panel', { tab:'resumen' }),
      goShop: () => this.go('shop'), goOrders: () => this.go('orders'), goCart: () => this.go('cart'), goAuth: () => this.go('auth'), goProv: () => this.go('provider', { provId:pd.prov, provCat:'Todos' }), goCheckout: () => this.go('checkout'),
      q: s.q, onSearch: e => this.setState({ q:e.target.value, screen:'shop' }), cartQty,
      catChips: CATS.map(c => opt(c, s.cat === c, () => this.setState({ cat:c }))), provCards, noProvs: !provCards.length, provCountText: `${provCards.length} proveedores`,
      prov: s.screen === 'product' ? pdProv : prov, provPrint, provCart, provProducts, provCatChips: provCats.map(c => opt(c, s.provCat === c, () => this.setState({ provCat:c }))),
      openPdf: () => this.say('Se abre el catálogo PDF original del proveedor.'),
      pd, pdIsA: pdVar === 'A', pdIsB: pdVar === 'B', pdVarOpts: ['A','B'].map(v => ({ label:v, onClick:() => this.setState({ pdVar:v }), bg: pdVar === v ? '#1d2d3d' : 'transparent', fg: pdVar === v ? '#f2f2f3' : '#1d1f20' })),
      pdHex: col.hex, pdFg: fgFor(col.hex), pdColorName: col.n, colorOpts, sizeRows, typeOpts, sizeOpts, placeOpts, printAvail, printNA: !printAvail, mock,
      cfg: { ...cfg, print: printing, fileBg: cfg.file ? `url(${cfg.file})` : 'none', hasFile: !!cfg.file, noFile: !cfg.file, fileLabel: cfg.fileName ? cfg.fileName : 'Sube la imagen de tu estampado', qtyText: `${totalQty} ${totalQty === 1 ? 'unidad' : 'unidades'}`, sizesSummary, printSummary, sizeLabel: curS ? curS.n : '' },
      tg: tg(printing), togglePrint: () => this.setCfg({ print: !cfg.print }), printOff: () => this.setCfg({ print:false }), printOnFn: () => this.setCfg({ print:true }),
      pOff: opt('', !printing), pOn: opt('', printing),
      onTypeSel: e => this.setCfg({ type:+e.target.value }), onSizeSel: e => this.setCfg({ size:+e.target.value }),
      onPrintFile: e => { const f = e.target.files && e.target.files[0]; if (f) this.setCfg({ file:URL.createObjectURL(f), fileName:f.name }); },
      unitText: money(unit), basePriceText: money(pd.price), unitNote: printing ? '(incluye estampado)' : '', lineText: money(unit * totalQty), minNote,
      canAdd: totalQty > 0, cantAdd: totalQty === 0,
      addToCart: () => { const item = { key:Date.now() + '', pid:pd.id, color:cfg.color, qty:{ ...cfg.qty }, print: printing ? { type:cfg.type, size:cfg.size, place:cfg.place, file:cfg.file, fileName:cfg.fileName } : null };
        this.setState(st => ({ cart:[...st.cart, item], cfg:{ ...st.cfg, qty:{}, step:1 } })); this.say(after >= minQ ? `Agregado. Mínimo con ${pdProv.name} cumplido.` : `Agregado. Te faltan ${minQ - after} artículos con ${pdProv.name}.`); },
      steps, stepIs1: cfg.step === 1, stepIs2: cfg.step === 2, stepIs3: cfg.step === 3,
      toStep2: () => this.setCfg({ step:2 }), toStep3: () => this.setCfg({ step:3 }), step2Next: 'Continuar a estampado',
      fillCurve: () => { const q = {}; pd.sizes.forEach(z => { if (['S','M','L','XL'].includes(z)) q[z] = z === 'M' || z === 'L' ? 2 : 1; }); if (!Object.keys(q).length) pd.sizes.slice(1,5).forEach(z => q[z] = 1); this.setCfg({ qty:q }); },
      clearQty: () => this.setCfg({ qty:{} }),
      groups, groupCount: groups.length, cartEmpty: !groups.length, cartTitle: cartQty ? `${cartQty} artículos` : 'Vacío', cartSubtotalText: money(cartSub), cartOk, cartBlocked: !cartOk,
      blockedText: groups.length ? `Completa el mínimo de ${minQ} artículos con ${bad.map(g => g.name).join(', ')}.` : 'Agrega productos para continuar.',
      payOpts: [['Tarjeta','Crédito o débito'],['PSE','Débito bancario'],['Nequi','Billetera'],['Bancolombia','Botón de pago']].map(([l,sub],i) => ({ ...opt(l, s.pay === i, () => this.setState({ pay:i })), sub })),
      payIsCard: s.pay === 0, payNotCard: s.pay !== 0, payNote: 'Al pagar, Wompi te redirige para autorizar la transacción y vuelves aquí automáticamente.',
      shipTotalText: money(shipTot), grandText: money(cartSub + shipTot), paying: s.paying, payCta: s.paying ? 'Procesando…' : `Pagar ${money(cartSub + shipTot)}`,
      pay: () => { if (s.paying || !cartOk) return; this.setState({ paying:true }); setTimeout(() => {
        let n = 10483 + Math.floor(Math.random() * 20); const ids = [];
        const mNew = groups.map(g => { const id = 'EW-' + (n++); ids.push(id); return { id, prov:g.name, date:'23 oct', status:0, qty:g.qty, total:g.sub + g.ship }; });
        const g1 = groups.find(g => g.id === 'p1'); const pNew = g1 ? [{ id: ids[groups.indexOf(g1)], merchant:'Tienda La 70', contact:'Laura Gómez', phone:'+57 300 412 8890', address:'Cl. 70 # 45-12, local 3', city:'Medellín, CO', date:'23 oct', status:0, total:g1.sub + g1.ship, items:g1.items.map(i => ({ name:i.name, color:i.colorName, hex:i.hex, sizes:i.sizesText, qty:i.qty, print:i.printText, file:i.file })) }] : [];
        this.setState(st => ({ paying:false, cart:[], lastIds:ids, mOrders:[...mNew, ...st.mOrders], pOrders:[...pNew, ...st.pOrders] })); this.go('success'); }, 1300); },
      lastIds: s.lastIds,
      mOrders: s.mOrders.map(o => ({ ...o, totalText:money(o.total), statusText:STATUS[o.status], sbg:SCHIP[o.status][0], sfg:SCHIP[o.status][1], track:track(o.status) })),
      panelNav: navItems.map(([k,l]) => { const on = s.tab === k; const badge = k === 'orders' ? newCount : k === 'catalog' && s.up.stage === 4 && !s.published ? flagged : 0; return { label:l, onClick:() => this.setState({ tab:k, drawer:false }), bg: on ? '#2c455d' : 'transparent', fg: on ? '#f2f2f3' : '#b5d9fd', bd: on ? '#b5d9fd' : 'transparent', hasBadge: badge > 0, badge }; }),
      panelTitle: (navItems.find(n => n[0] === s.tab) || navItems[0])[1], todayText: 'Viernes, 23 de octubre',
      tabResumen: s.tab === 'resumen', tabOrders: s.tab === 'orders', tabCatalog: s.tab === 'catalog', tabPrint: s.tab === 'print',
      greetSub: newCount ? `Tienes ${newCount} ${newCount === 1 ? 'orden nueva' : 'órdenes nuevas'} por confirmar.` : 'Todo al día.',
      kpis: [{ label:'Órdenes nuevas', value:String(newCount), sub:'Por confirmar' }, { label:'En producción', value:String(prodCount), sub:'En taller' }, { label:'Ventas de octubre', value:money(month).replace('US$ ',''), sub:'US$ · pagos aprobados' }, { label:'Comerciantes', value:String(merchants), sub:'Han comprado este mes' }],
      recentRows: po.slice(0,5).map(rowOf), toOrdersTab: () => this.setState({ tab:'orders', drawer:false }),
      todos: [ ...po.filter(o => o.status === 0).map(o => ({ title:`Confirmar ${o.id}`, sub:`${o.merchant} · ${o.items.reduce((a,i) => a + i.qty, 0)} u.`, onClick:() => this.setState({ tab:'orders', orderSel:o.id, drawer:true }) })), { title:'Revisar estampados activos', sub:'4 técnicas configuradas', onClick:() => this.setState({ tab:'print' }) }, { title:'Actualizar catálogo de temporada', sub:'Último PDF: 14 sep', onClick:() => this.setState({ tab:'catalog' }) } ],
      statusFilters: [{ k:-1, l:'Todas' }, ...STATUS.map((l,k) => ({ k, l }))].map(f => ({ ...opt(f.l, s.sFilter === f.k, () => this.setState({ sFilter:f.k })), count: f.k < 0 ? po.length : po.filter(o => o.status === f.k).length })),
      panelVarOpts: ['A','B'].map(v => ({ label:v, onClick:() => this.setState({ panelVar:v, drawer:false }), bg: panelVar === v ? '#1d2d3d' : 'transparent', fg: panelVar === v ? '#f2f2f3' : '#1d1f20' })),
      pvIsA: panelVar === 'A', pvIsB: panelVar === 'B', orderRows: filtered.map(rowOf), od, drawerOpen: s.drawer && panelVar === 'A', closeDrawer: () => this.setState({ drawer:false }),
      advanceOrder: () => { if (!sel) return; this.setState(st => ({ pOrders: st.pOrders.map(o => o.id === sel.id ? { ...o, status: Math.min(3, o.status + 1) } : o) })); this.say(`${sel.id}: ${STATUS[Math.min(3, sel.status + 1)]}. Avisamos al comerciante.`); },
      catalogStatus: s.published ? 'Publicado hoy' : 'Último PDF publicado: 14 sep', upIdle: s.up.stage === 0, upWorking: s.up.stage > 0 && s.up.stage < 4, upReview: s.up.stage === 4,
      up: s.up, upLabel: upStepsL[s.up.stage - 1] || '', upPctText: Math.round(((s.up.stage - 1) * 100 + s.up.pct) / 3) + '%',
      upSteps: upStepsL.map((l,i) => { const done = s.up.stage > i + 1, cur = s.up.stage === i + 1; return { label:l, mark: done ? '✓' : '', fg: done || cur ? '#1d1f20' : '#98989b', bd: done ? '#5980a6' : cur ? '#5980a6' : '#c4c4c8', bg: done ? '#5980a6' : 'transparent' }; }),
      onPdf: e => { const f = e.target.files && e.target.files[0]; if (!f) return; if (!/pdf$/i.test(f.name) && f.type !== 'application/pdf') return this.say('Solo se aceptan archivos PDF.'); this.startUpload(f.name); },
      demoPdf: () => this.startUpload('Catalogo_Textiles_Andinos_2026.pdf'), resetUpload: () => { clearInterval(this.iv); this.setState({ up:{ stage:0, pct:0, file:'' }, ex:[], published:false }); },
      reviewText: s.published ? `Catálogo publicado · ${s.ex.length} productos visibles para comerciantes.` : `Detectamos ${s.ex.length} productos en ${s.up.file}. Revisa los marcados antes de publicar.`,
      exRows: s.ex.map(r => ({ ...r, bg: r.flag ? '#fbf3ea' : 'transparent', priceBd: r.flag === 'Precio no detectado' ? '#c27a3a' : 'rgba(29,31,32,.14)', flagShort: r.flag ? 'Revisar' : 'OK', flagFg: r.flag ? '#8a4b1f' : '#5d6b3f', onName: e => this.editEx(r.key,'name',e.target.value), onPrice: e => this.editEx(r.key,'price',e.target.value), onCat: e => this.editEx(r.key,'cat',e.target.value), remove: () => this.setState(st => ({ ex: st.ex.filter(x => x.key !== r.key) })) })),
      flagsText: flagged ? `${flagged} ${flagged === 1 ? 'producto necesita' : 'productos necesitan'} revisión.` : 'Todo listo para publicar.', flagsColor: flagged ? '#8a4b1f' : '#5d6b3f',
      publishCta: s.published ? 'Publicado' : `Publicar ${s.ex.length} productos`, publish: () => { if (flagged) return this.say('Corrige los productos marcados antes de publicar.'); this.setState({ published:true }); this.say('Catálogo publicado. Ya está visible en la tienda.'); },
      pc, pcOff: !pc.on, pcTg: tg(pc.on), pcToggle: () => this.setState(st => ({ pc:{ ...st.pc, on: !st.pc.on } })),
      pcTypes: pc.types.map((t,i) => ({ ...t, cbg: t.on ? '#5980a6' : 'transparent', cbd: t.on ? '#5980a6' : 'rgba(29,31,32,.3)', fg: t.on ? '#1d1f20' : '#98989b', toggle:() => this.editPc('types', i, { on:!t.on }), onPrice: e => this.editPc('types', i, { price:e.target.value }) })),
      pcSizes: pc.sizes.map((t,i) => ({ ...t, cbg: t.on ? '#5980a6' : 'transparent', cbd: t.on ? '#5980a6' : 'rgba(29,31,32,.3)', toggle:() => this.editPc('sizes', i, { on:!t.on }), onName: e => this.editPc('sizes', i, { n:e.target.value }), onPrice: e => this.editPc('sizes', i, { price:e.target.value }), remove:() => this.setState(st => ({ pc:{ ...st.pc, sizes: st.pc.sizes.filter((_,j) => j !== i) } })) })),
      pcAddSize: () => this.setState(st => ({ pc:{ ...st.pc, sizes:[...st.pc.sizes, { n:'Nuevo tamaño', price:'0', on:true }] } })),
      pcPlaces: pc.places.map((p,i) => opt(p.n, p.on, () => this.editPc('places', i, { on:!p.on }))),
      pcPreview: { types: pcView.types.map(t => ({ label:t.n, extra: t.price ? '+' + money(t.price) : 'incluido' })), sizes: pcView.sizes.map(t => ({ label:t.n, extra: t.price ? '+' + money(t.price) : 'incluido' })), placesText: pcView.places.join(' · ') },
      pcSave: () => this.say('Cambios guardados. Los comerciantes ya ven tus opciones de estampado.'),
      hasToast: !!s.toast, toast: s.toast,
      jump: s.jump, toggleJump: () => this.setState({ jump: !s.jump }),
      jumpList: SCREENS.map(([k,l],i) => { const cur = k === s.screen || k === `panel:${s.tab}` && s.screen === 'panel'; return { n:String(i + 1).padStart(2,'0'), label:l, onClick:() => this.jumpTo(k), bg: cur ? '#d6ebff' : 'transparent' }; }),
    };
  }
}