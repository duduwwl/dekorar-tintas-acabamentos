const moneyAdmin = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const dateAdmin = new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
const dateShortAdmin = new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit'});

function escapeHtml(value) { return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function safeNumber(value) { return Math.max(0,Number.parseInt(value,10)||0); }

let inventory=[];
let orders=[];
const DB=window.DekorarDB;
const statusClasses={'Novo':'new','Separação':'packing','Pronto':'ready','Enviado':'shipping','Entregue':'done','Cancelado':'cancelled'};
const viewTitles={overview:'Visão Geral',inventory:'Estoque',orders:'Pedidos',shipping:'Envios & Retiradas'};
const orderDialog=document.querySelector('#orderDialog');
const productDialog=document.querySelector('#productDialog');
const orderForm=document.querySelector('[data-order-form]');
const productForm=document.querySelector('[data-product-form]');
const toastAdmin=document.querySelector('[data-admin-toast]');

// Persistência agora é no banco (ver chamadas DB.adminSetStock / DB.adminUpdateOrder).
// Estas funções só re-renderizam a partir do estado em memória.
function saveInventory() { renderAll(); }
function saveOrders() { renderAll(); }
function dbFail(e) { if(String(e&&e.message).includes('401')){ requireLogin(); return; } showAdminToast('Erro ao salvar no banco.'); }
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
  if(change){ const product=inventory.find(item=>item.id===change.dataset.stockChange); if(product){ const store=change.dataset.store; product[store]=Math.max(0,safeNumber(product[store])+Number(change.dataset.delta)); saveInventory(); DB.adminSetStock(product.id,store,product[store]).then(()=>showAdminToast('Estoque atualizado.')).catch(dbFail); } }
  const reset=event.target.closest('[data-reset-stock]');
  if(reset){ const product=inventory.find(item=>item.id===reset.dataset.resetStock); if(product&&window.confirm(`Zerar o estoque de ${product.name} nas duas lojas?`)){ product.lavras=0; product.tres=0; saveInventory(); Promise.all([DB.adminSetStock(product.id,'lavras',0),DB.adminSetStock(product.id,'tres',0)]).then(()=>showAdminToast('Estoque zerado.')).catch(dbFail); } }
});
document.addEventListener('change',event=>{
  const input=event.target.closest('[data-stock-input]');
  if(input){ const product=inventory.find(item=>item.id===input.dataset.stockInput); if(product){ const store=input.dataset.store; product[store]=safeNumber(input.value); saveInventory(); DB.adminSetStock(product.id,store,product[store]).then(()=>showAdminToast('Estoque atualizado.')).catch(dbFail); } }
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
  saveOrders(); orderDialog.close();
  DB.adminUpdateOrder(order._id,order).then(()=>showAdminToast('Pedido e envio atualizados.')).catch(dbFail);
});
productForm.addEventListener('submit',event=>{
  event.preventDefault(); if(!productForm.reportValidity()) return;
  const data=new FormData(productForm);
  const p={name:data.get('name').trim(),category:data.get('category'),lavras:safeNumber(data.get('lavras')),tres:safeNumber(data.get('tres')),minimum:safeNumber(data.get('minimum'))};
  DB.adminAddProduct(p).then(id=>{
    inventory.push({id,name:p.name,category:p.category,image:'assets/img/dkorar-lata-cutout.webp',lavras:p.lavras,tres:p.tres,minimum:p.minimum});
    saveInventory(); showAdminToast('Produto cadastrado no estoque.');
  }).catch(dbFail);
  productForm.reset(); productForm.elements.minimum.value='5'; productForm.elements.lavras.value='0'; productForm.elements.tres.value='0'; productDialog.close();
});

const now=new Date();
document.querySelector('[data-admin-date]').textContent=dateAdmin.format(now);
document.querySelector('[data-admin-time]').textContent=new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit'}).format(now);

/* ---------- Login do painel (Supabase Auth) ---------- */
const loginOverlay=document.querySelector('[data-login-overlay]');
const loginForm=document.querySelector('[data-login-form]');
const loginError=document.querySelector('[data-login-error]');
function requireLogin(){ if(loginOverlay) loginOverlay.hidden=false; }
async function loadData(){
  inventory=await DB.adminGetInventory();
  orders=await DB.adminGetOrders();
}
async function start(){
  if(loginOverlay) loginOverlay.hidden=true;
  try{ await loadData(); }
  catch(e){ if(String(e&&e.message).includes('401')){ requireLogin(); return; } showAdminToast('Erro ao carregar do banco.'); }
  setView(location.hash.slice(1)||'overview');
  renderAll();
}
loginForm?.addEventListener('submit',async event=>{
  event.preventDefault(); if(loginError) loginError.textContent='';
  const data=new FormData(loginForm);
  const btn=loginForm.querySelector('button[type=submit]'); if(btn) btn.disabled=true;
  try{ await DB.signIn(data.get('email').trim(),data.get('password')); await start(); }
  catch{ if(loginError) loginError.textContent='E-mail ou senha incorretos.'; }
  finally{ if(btn) btn.disabled=false; }
});
document.querySelector('[data-logout]')?.addEventListener('click',()=>{ DB.signOut(); location.reload(); });

if(DB && DB.isAuthed()) start(); else requireLogin();
