const INVENTORY_KEY = 'dekorar-inventory';
const ORDERS_KEY = 'dekorar-orders';
const moneyAdmin = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const dateAdmin = new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
const dateShortAdmin = new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit'});

const defaultInventory = [
  {id:'suvinil-rende-20l',name:'Suvinil Rende e Cobre Muito 20 L',category:'Tintas',image:'assets/product-suvinil.webp',lavras:18,tres:11,minimum:8},
  {id:'coral-rende-20l',name:'Coral Rende Muito 20 L',category:'Tintas',image:'assets/product-coral-rende.webp',lavras:7,tres:4,minimum:12},
  {id:'massa-coral-25kg',name:'Massa Corrida Coral 25 kg',category:'Preparação',image:'assets/product-massa-coral.webp',lavras:22,tres:17,minimum:10},
  {id:'massa-dkorar',name:'Massa Corrida Dkorar',category:'Preparação',image:'assets/product-dkorar.webp',lavras:34,tres:28,minimum:16},
  {id:'mactra-seca-parede',name:'Coral Mactra Seca Parede',category:'Tratamento',image:'assets/product-mactra.webp',lavras:3,tres:2,minimum:8},
  {id:'revestliso-ceramfix',name:'Revestliso Ceramfix 15 kg',category:'Revestimentos',image:'assets/product-revestliso.webp',lavras:0,tres:3,minimum:6},
  {id:'efeito-velvet',name:'Efeito Velvet Coral 2,1 L',category:'Decorativos',image:'assets/product-velvet.webp',lavras:6,tres:7,minimum:5}
];

const defaultOrders = [
  {id:'DK204817',createdAt:'2026-10-14T13:42:00-03:00',customer:{name:'Marcos Almeida',phone:'(35) 98845-2103',city:'Lavras'},items:[{name:'Massa Corrida Coral 25 kg',qty:4,price:79.9},{name:'Suvinil Rende e Cobre Muito 20 L',qty:2,price:319.9}],delivery:'Entrega Dekorar',payment:'Pix',total:959.4,status:'Separação',shipping:{carrier:'Entrega Dekorar',tracking:'',estimate:'2026-10-15',notes:'Entregar no período da tarde.'}},
  {id:'DK204652',createdAt:'2026-10-14T10:18:00-03:00',customer:{name:'Construtora Horizonte',phone:'(35) 99120-4488',city:'Três Corações'},items:[{name:'Massa Corrida Dkorar',qty:12,price:72.5}],delivery:'Entrega Dekorar',payment:'Cartão de crédito',total:870,status:'Pronto',shipping:{carrier:'Entrega Dekorar',tracking:'',estimate:'2026-10-15',notes:'Obra com acesso pela portaria lateral.'}},
  {id:'DK203991',createdAt:'2026-10-13T16:06:00-03:00',customer:{name:'Ana Paula Souza',phone:'(35) 98402-7190',city:'Varginha'},items:[{name:'Coral Mactra Seca Parede',qty:2,price:149.9}],delivery:'Correios',payment:'Pix',total:329.7,status:'Enviado',shipping:{carrier:'Correios',tracking:'BR784512963MG',estimate:'2026-10-17',notes:''}},
  {id:'DK203748',createdAt:'2026-10-13T09:25:00-03:00',customer:{name:'Roberto Mendes',phone:'(35) 99718-3302',city:'Lavras'},items:[{name:'Efeito Velvet Coral 2,1 L',qty:1,price:189.9}],delivery:'Retirada na Loja',payment:'Cartão de débito',total:189.9,status:'Novo',shipping:{carrier:'Retirada na Loja',tracking:'',estimate:'',notes:''}},
  {id:'DK202964',createdAt:'2026-10-12T11:15:00-03:00',customer:{name:'Fernanda Lima',phone:'(35) 99264-5501',city:'Três Corações'},items:[{name:'Coral Rende Muito 20 L',qty:1,price:329.9}],delivery:'Retirada na Loja',payment:'Pix',total:329.9,status:'Entregue',shipping:{carrier:'Retirada na Loja',tracking:'',estimate:'2026-10-12',notes:''}}
];

function readStorage(key,fallback) {
  try { const saved=JSON.parse(localStorage.getItem(key)); return Array.isArray(saved)?saved:fallback; }
  catch { return fallback; }
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }
function escapeHtml(value) { return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function safeNumber(value) { return Math.max(0,Number.parseInt(value,10)||0); }

let inventory=readStorage(INVENTORY_KEY,clone(defaultInventory));
let orders=readStorage(ORDERS_KEY,clone(defaultOrders));
const statusClasses={'Novo':'new','Separação':'packing','Pronto':'ready','Enviado':'shipping','Entregue':'done','Cancelado':'cancelled'};
const viewTitles={overview:'Visão Geral',inventory:'Estoque',orders:'Pedidos',shipping:'Envios & Retiradas'};
const orderDialog=document.querySelector('#orderDialog');
const productDialog=document.querySelector('#productDialog');
const orderForm=document.querySelector('[data-order-form]');
const productForm=document.querySelector('[data-product-form]');
const toastAdmin=document.querySelector('[data-admin-toast]');

function saveInventory() { localStorage.setItem(INVENTORY_KEY,JSON.stringify(inventory)); renderAll(); }
function saveOrders() { localStorage.setItem(ORDERS_KEY,JSON.stringify(orders)); renderAll(); }
function stockState(product) {
  const total=safeNumber(product.lavras)+safeNumber(product.tres);
  if(total===0) return {key:'out',label:'Sem Estoque'};
  if(total<=safeNumber(product.minimum)) return {key:'low',label:'Estoque Baixo'};
  return {key:'ok',label:'Regular'};
}
function showAdminToast(message) { toastAdmin.textContent=message; toastAdmin.classList.add('show'); clearTimeout(showAdminToast.timer); showAdminToast.timer=setTimeout(()=>toastAdmin.classList.remove('show'),2200); }

function setView(view) {
  const next=viewTitles[view]?view:'overview';
  document.querySelectorAll('[data-admin-tab]').forEach(button=>button.classList.toggle('active',button.dataset.adminTab===next));
  document.querySelectorAll('[data-admin-view]').forEach(section=>section.classList.toggle('active',section.dataset.adminView===next));
  document.querySelector('[data-view-title]').textContent=viewTitles[next];
  if(location.hash!==`#${next}`) history.replaceState(null,'',`#${next}`);
}

function renderMetrics() {
  const low=inventory.filter(product=>stockState(product).key!=='ok').length;
  const open=orders.filter(order=>!['Entregue','Cancelado'].includes(order.status)).length;
  const shipping=orders.filter(order=>order.status==='Enviado').length;
  document.querySelector('[data-metric-products]').textContent=inventory.length;
  document.querySelector('[data-metric-low]').textContent=low;
  document.querySelector('[data-metric-orders]').textContent=open;
  document.querySelector('[data-metric-shipping]').textContent=shipping;
  document.querySelectorAll('[data-low-count]').forEach(node=>node.textContent=low);
  document.querySelectorAll('[data-open-count]').forEach(node=>node.textContent=open);
  document.querySelectorAll('[data-shipping-count]').forEach(node=>node.textContent=shipping);

  const alerts=inventory.filter(product=>stockState(product).key!=='ok').slice(0,4);
  document.querySelector('[data-stock-alerts]').innerHTML=alerts.length?alerts.map(product=>{
    const state=stockState(product); const total=product.lavras+product.tres;
    return `<article class="stock-alert"><img src="${product.image}" width="54" height="54" alt=""><div><strong>${escapeHtml(product.name)}</strong><span>${total} unidades no total</span></div><span class="status-badge ${state.key}">${state.label}</span></article>`;
  }).join(''):'<div class="admin-empty">Nenhum item precisa de reposição.</div>';

  document.querySelector('[data-recent-orders]').innerHTML=orders.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,4).map(order=>`<button class="recent-order" type="button" data-manage-order="${escapeHtml(order.id)}"><span><strong>${escapeHtml(order.id)}</strong><small>${escapeHtml(order.customer.name)}</small></span><span><strong>${moneyAdmin.format(order.total)}</strong><small class="status-text ${statusClasses[order.status]||''}">${escapeHtml(order.status)}</small></span></button>`).join('');
}

function renderInventory() {
  const query=document.querySelector('[data-stock-search]').value.trim().toLocaleLowerCase('pt-BR');
  const filter=document.querySelector('[data-stock-filter]').value;
  const rows=inventory.filter(product=>{
    const matches=!query||`${product.name} ${product.category}`.toLocaleLowerCase('pt-BR').includes(query);
    const state=stockState(product).key;
    return matches&&(filter==='all'||filter===state);
  });
  document.querySelector('[data-inventory-rows]').innerHTML=rows.length?rows.map(product=>{
    const state=stockState(product); const total=product.lavras+product.tres;
    return `<tr><td><div class="table-product"><img src="${product.image}" width="52" height="52" alt=""><span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.category)}</small></span></div></td><td><div class="stock-stepper"><button type="button" data-stock-change="${product.id}" data-store="lavras" data-delta="-1" aria-label="Diminuir estoque em Lavras">−</button><input type="number" min="0" value="${product.lavras}" data-stock-input="${product.id}" data-store="lavras" aria-label="Estoque em Lavras"><button type="button" data-stock-change="${product.id}" data-store="lavras" data-delta="1" aria-label="Aumentar estoque em Lavras">+</button></div></td><td><div class="stock-stepper"><button type="button" data-stock-change="${product.id}" data-store="tres" data-delta="-1" aria-label="Diminuir estoque em Três Corações">−</button><input type="number" min="0" value="${product.tres}" data-stock-input="${product.id}" data-store="tres" aria-label="Estoque em Três Corações"><button type="button" data-stock-change="${product.id}" data-store="tres" data-delta="1" aria-label="Aumentar estoque em Três Corações">+</button></div></td><td>${product.minimum}</td><td><strong class="table-total">${total}</strong></td><td><span class="status-badge ${state.key}">${state.label}</span></td><td><button class="table-action" type="button" data-reset-stock="${product.id}" aria-label="Zerar estoque de ${escapeHtml(product.name)}">Zerar</button></td></tr>`;
  }).join(''):'<tr><td colspan="7"><div class="admin-empty">Nenhum produto encontrado.</div></td></tr>';
}

function renderOrders() {
  const query=document.querySelector('[data-order-search]').value.trim().toLocaleLowerCase('pt-BR');
  const filter=document.querySelector('[data-order-filter]').value;
  const visible=orders.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).filter(order=>{
    const matches=!query||`${order.id} ${order.customer.name} ${order.customer.phone}`.toLocaleLowerCase('pt-BR').includes(query);
    return matches&&(filter==='all'||order.status===filter);
  });
  document.querySelector('[data-order-rows]').innerHTML=visible.length?visible.map(order=>`<tr><td><strong class="order-id">${escapeHtml(order.id)}</strong><small>${order.items.length} ${order.items.length===1?'item':'itens'}</small></td><td><strong>${escapeHtml(order.customer.name)}</strong><small>${escapeHtml(order.customer.phone||'')}</small></td><td>${dateShortAdmin.format(new Date(order.createdAt))}</td><td>${escapeHtml(order.delivery)}</td><td><strong class="table-total">${moneyAdmin.format(order.total)}</strong></td><td><span class="status-badge ${statusClasses[order.status]||''}">${escapeHtml(order.status)}</span></td><td><button class="table-action primary" type="button" data-manage-order="${escapeHtml(order.id)}">Gerenciar</button></td></tr>`).join(''):'<tr><td colspan="7"><div class="admin-empty">Nenhum pedido encontrado.</div></td></tr>';
}

function renderShipping() {
  const queue=orders.filter(order=>!['Entregue','Cancelado'].includes(order.status)).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt));
  document.querySelector('[data-shipping-board]').innerHTML=queue.length?queue.map(order=>{
    const shipping=order.shipping||{};
    return `<article class="shipping-card"><div class="shipping-card-head"><span class="status-badge ${statusClasses[order.status]||''}">${escapeHtml(order.status)}</span><strong>${escapeHtml(order.id)}</strong></div><h3>${escapeHtml(order.customer.name)}</h3><p>${escapeHtml(order.customer.city||'Cidade não informada')} · ${escapeHtml(order.delivery)}</p><dl><div><dt>Transportadora</dt><dd>${escapeHtml(shipping.carrier||'Não definida')}</dd></div><div><dt>Rastreio</dt><dd>${escapeHtml(shipping.tracking||'Não informado')}</dd></div><div><dt>Previsão</dt><dd>${shipping.estimate?dateShortAdmin.format(new Date(`${shipping.estimate}T12:00:00`)):'Não informada'}</dd></div></dl><button class="btn btn-secondary full" type="button" data-manage-order="${escapeHtml(order.id)}">Atualizar Envio</button></article>`;
  }).join(''):'<div class="admin-empty">Não há pedidos aguardando envio ou retirada.</div>';
}

function renderAll() { renderMetrics(); renderInventory(); renderOrders(); renderShipping(); }

function openOrder(id) {
  const order=orders.find(item=>item.id===id); if(!order) return;
  order.shipping=order.shipping||{};
  orderForm.elements.orderId.value=order.id;
  orderForm.elements.status.value=order.status;
  orderForm.elements.carrier.value=order.shipping.carrier||'';
  orderForm.elements.tracking.value=order.shipping.tracking||'';
  orderForm.elements.estimate.value=order.shipping.estimate||'';
  orderForm.elements.notes.value=order.shipping.notes||'';
  document.querySelector('[data-order-summary]').innerHTML=`<div><span>Pedido</span><strong>${escapeHtml(order.id)}</strong></div><div><span>Cliente</span><strong>${escapeHtml(order.customer.name)}</strong></div><div><span>Itens</span><strong>${order.items.reduce((sum,item)=>sum+item.qty,0)}</strong></div><div><span>Total</span><strong>${moneyAdmin.format(order.total)}</strong></div><ul>${order.items.map(item=>`<li>${item.qty}× ${escapeHtml(item.name)}</li>`).join('')}</ul>`;
  orderDialog.showModal();
}

document.querySelectorAll('[data-admin-tab]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.adminTab)));
document.querySelectorAll('[data-go-view]').forEach(button=>button.addEventListener('click',()=>setView(button.dataset.goView)));
document.addEventListener('click',event=>{
  const manage=event.target.closest('[data-manage-order]'); if(manage) openOrder(manage.dataset.manageOrder);
  const change=event.target.closest('[data-stock-change]');
  if(change){ const product=inventory.find(item=>item.id===change.dataset.stockChange); if(product){ const store=change.dataset.store; product[store]=Math.max(0,safeNumber(product[store])+Number(change.dataset.delta)); saveInventory(); showAdminToast('Estoque atualizado.'); } }
  const reset=event.target.closest('[data-reset-stock]');
  if(reset){ const product=inventory.find(item=>item.id===reset.dataset.resetStock); if(product&&window.confirm(`Zerar o estoque de ${product.name} nas duas lojas?`)){ product.lavras=0; product.tres=0; saveInventory(); showAdminToast('Estoque zerado.'); } }
});
document.addEventListener('change',event=>{
  const input=event.target.closest('[data-stock-input]');
  if(input){ const product=inventory.find(item=>item.id===input.dataset.stockInput); if(product){ product[input.dataset.store]=safeNumber(input.value); saveInventory(); showAdminToast('Estoque atualizado.'); } }
});
document.querySelector('[data-stock-search]').addEventListener('input',renderInventory);
document.querySelector('[data-stock-filter]').addEventListener('change',renderInventory);
document.querySelector('[data-order-search]').addEventListener('input',renderOrders);
document.querySelector('[data-order-filter]').addEventListener('change',renderOrders);

document.querySelectorAll('[data-close-order]').forEach(button=>button.addEventListener('click',()=>orderDialog.close()));
document.querySelectorAll('[data-close-product]').forEach(button=>button.addEventListener('click',()=>productDialog.close()));
document.querySelector('[data-open-product]').addEventListener('click',()=>productDialog.showModal());
orderForm.addEventListener('submit',event=>{
  event.preventDefault();
  const data=new FormData(orderForm); const order=orders.find(item=>item.id===data.get('orderId')); if(!order) return;
  order.status=data.get('status'); order.shipping={carrier:data.get('carrier'),tracking:data.get('tracking').trim(),estimate:data.get('estimate'),notes:data.get('notes').trim()};
  saveOrders(); orderDialog.close(); showAdminToast('Pedido e envio atualizados.');
});
productForm.addEventListener('submit',event=>{
  event.preventDefault(); if(!productForm.reportValidity()) return;
  const data=new FormData(productForm); const name=data.get('name').trim();
  inventory.push({id:`custom-${Date.now()}`,name,category:data.get('category'),image:'assets/product-dkorar.webp',lavras:safeNumber(data.get('lavras')),tres:safeNumber(data.get('tres')),minimum:safeNumber(data.get('minimum'))});
  saveInventory(); productForm.reset(); productForm.elements.minimum.value='5'; productForm.elements.lavras.value='0'; productForm.elements.tres.value='0'; productDialog.close(); showAdminToast('Produto cadastrado no estoque.');
});

const now=new Date();
document.querySelector('[data-admin-date]').textContent=dateAdmin.format(now);
document.querySelector('[data-admin-time]').textContent=new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit'}).format(now);
setView(location.hash.slice(1)||'overview');
renderAll();
