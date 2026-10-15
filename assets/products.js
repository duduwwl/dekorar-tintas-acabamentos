const PRODUCTS = [
  {id:'suvinil-rende-20l',name:'Suvinil Rende e Cobre Muito 20 L',category:'Tintas',price:319.90,image:'assets/product-suvinil.webp',description:'Tinta para áreas internas e externas, na cor Neve, com proposta de bom rendimento e cobertura.',package:'20 litros',indication:'Pintura de paredes internas e externas'},
  {id:'coral-rende-20l',name:'Coral Rende Muito 20 L',category:'Tintas',price:329.90,image:'assets/product-coral-rende.webp',description:'Tinta concentrada Coral, na cor Gelo, indicada para projetos que buscam rendimento na pintura.',package:'20 litros',indication:'Pintura de paredes internas'},
  {id:'massa-coral-25kg',name:'Massa Corrida Coral 25 kg',category:'Preparação',price:79.90,image:'assets/product-massa-coral.webp',description:'Massa corrida para nivelar e preparar superfícies internas antes da aplicação da tinta.',package:'25 kg',indication:'Preparação de paredes internas'},
  {id:'massa-dkorar',name:'Massa Corrida Dkorar',category:'Preparação',price:null,image:'assets/product-dkorar.webp',description:'Produto da linha própria Dkorar para preparação de obras de pequeno, médio e grande porte.',package:'Consulte as opções',indication:'Nivelamento e preparação de paredes'},
  {id:'mactra-seca-parede',name:'Coral Mactra Seca Parede',category:'Tratamento',price:null,image:'assets/product-mactra.webp',description:'Linha de tratamento para paredes com sinais de umidade, mofo, bolhas, salitre e reboco deteriorado.',package:'Kit de tratamento',indication:'Tratamento de paredes com umidade'},
  {id:'revestliso-ceramfix',name:'Revestliso Ceramfix 15 kg',category:'Revestimentos',price:null,image:'assets/product-revestliso.webp',description:'Revestimento colorido de camada fina para acabamento e textura em áreas internas ou externas.',package:'15 kg',indication:'Revestimento e textura de paredes'},
  {id:'efeito-velvet',name:'Efeito Velvet Coral 2,1 L',category:'Decorativos',price:null,image:'assets/product-velvet.webp',description:'Acabamento decorativo Velvet ou Nuage para criar paredes com efeito visual sofisticado.',package:'2,1 litros',indication:'Efeito decorativo para paredes'}
];
const money = new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'});
const state = { category:'Todos', maxPrice:500, priceStatus:'all', query:'', sort:'featured' };
let cart = JSON.parse(localStorage.getItem('dekorar-cart') || '{}');
const grid = document.querySelector('[data-product-grid]');
const count = document.querySelector('[data-results-count]');
const categoryRoot = document.querySelector('[data-category-filters]');
const priceRange = document.querySelector('#priceRange');
const priceLabel = document.querySelector('[data-price-label]');
const search = document.querySelector('#search');
const sort = document.querySelector('#sort');
const cartDialog = document.querySelector('#cartDialog');
const checkoutDialog = document.querySelector('#checkoutDialog');
const productDialog = document.querySelector('#productDialog');
const toast = document.querySelector('[data-toast]');
let activeProduct = null;
let activeQuantity = 1;

function readUrl() {
  const params = new URLSearchParams(location.search);
  const category = params.get('categoria');
  if (category && ['Todos',...new Set(PRODUCTS.map(p=>p.category))].includes(category)) state.category=category;
  state.query = params.get('busca') || '';
  state.sort = params.get('ordem') || 'featured';
  const maximum = Number(params.get('max'));
  if (maximum >= 50 && maximum <= 500) state.maxPrice = maximum;
  const status = params.get('preco');
  if (['all','priced','quote'].includes(status)) state.priceStatus = status;
  search.value=state.query; sort.value=state.sort;
  priceRange.value=String(state.maxPrice); priceLabel.textContent=money.format(state.maxPrice);
  const statusInput=document.querySelector(`input[name="priceStatus"][value="${state.priceStatus}"]`);
  if(statusInput) statusInput.checked=true;
}
function syncUrl() {
  const params=new URLSearchParams();
  if(state.category!=='Todos') params.set('categoria',state.category);
  if(state.query) params.set('busca',state.query);
  if(state.sort!=='featured') params.set('ordem',state.sort);
  if(state.maxPrice!==500) params.set('max',String(state.maxPrice));
  if(state.priceStatus!=='all') params.set('preco',state.priceStatus);
  history.replaceState(null,'',`${location.pathname}${params.size?'?'+params:''}`);
}
function renderCategories() {
  const categories=['Todos',...new Set(PRODUCTS.map(p=>p.category))];
  categoryRoot.innerHTML=categories.map((category,index)=>`<label><input type="radio" name="category" value="${category}" ${state.category===category?'checked':''}> ${category}</label>`).join('');
  categoryRoot.addEventListener('change',event=>{ state.category=event.target.value; syncUrl(); renderProducts(); });
}
function productCard(product) {
  const price=product.price===null?'Sob consulta':money.format(product.price);
  return `<button class="product-card" type="button" data-product="${product.id}" aria-label="Ver detalhes de ${product.name}">
    <span class="product-card-image"><img src="${product.image}" width="1024" height="1024" alt="${product.name}" loading="eager"></span>
    <span class="product-card-body"><span class="product-category">${product.category}</span><strong class="product-name">${product.name}</strong><span class="product-description">${product.description}</span><span class="product-card-footer"><strong>${price}</strong><span>Ver detalhes</span></span></span>
  </button>`;
}
function renderProducts() {
  const normalized=state.query.trim().toLocaleLowerCase('pt-BR');
  let products=PRODUCTS.filter(product=>{
    const matchesCategory=state.category==='Todos'||product.category===state.category;
    const matchesQuery=!normalized||`${product.name} ${product.category} ${product.description}`.toLocaleLowerCase('pt-BR').includes(normalized);
    const matchesStatus=state.priceStatus==='all'||(state.priceStatus==='priced'&&product.price!==null)||(state.priceStatus==='quote'&&product.price===null);
    const matchesPrice=product.price===null||product.price<=state.maxPrice;
    return matchesCategory&&matchesQuery&&matchesStatus&&matchesPrice;
  });
  if(state.sort==='price-asc') products.sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
  if(state.sort==='price-desc') products.sort((a,b)=>(b.price??-1)-(a.price??-1));
  if(state.sort==='name') products.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
  count.textContent=`${products.length} ${products.length===1?'produto encontrado':'produtos encontrados'}`;
  grid.innerHTML=products.length?products.map(productCard).join(''):'<div class="empty-state"><h2>Nenhum produto encontrado</h2><p>Tente limpar os filtros ou buscar outro termo.</p></div>';
}
function saveCart() { localStorage.setItem('dekorar-cart',JSON.stringify(cart)); updateCart(); }
function cartItems() { return Object.entries(cart).map(([id,qty])=>({product:PRODUCTS.find(p=>p.id===id),qty})).filter(item=>item.product); }
function subtotal() { return cartItems().reduce((sum,item)=>sum+item.product.price*item.qty,0); }
function updateCart() {
  const totalQty=Object.values(cart).reduce((sum,qty)=>sum+qty,0);
  document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=totalQty);
  const lines=document.querySelector('[data-cart-lines]');
  const items=cartItems();
  lines.innerHTML=items.length?items.map(({product,qty})=>`<article class="cart-line"><img src="${product.image}" width="72" height="82" alt=""><div><h3>${product.name}</h3><small>${money.format(product.price)}</small><div class="qty"><button type="button" data-qty="${product.id}" data-delta="-1" aria-label="Diminuir quantidade">−</button><span>${qty}</span><button type="button" data-qty="${product.id}" data-delta="1" aria-label="Aumentar quantidade">+</button></div></div><button class="icon-button" type="button" data-remove="${product.id}" aria-label="Remover ${product.name}">×</button></article>`).join(''):'<div class="empty-state"><h2>Seu carrinho está vazio</h2><p>Adicione um produto com preço divulgado para continuar.</p></div>';
  document.querySelector('[data-cart-total]').textContent=money.format(subtotal());
  document.querySelector('[data-checkout]').disabled=!items.length;
}
function showToast(message) { toast.textContent=message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer=setTimeout(()=>toast.classList.remove('show'),2400); }
function setProductQuantity(value) {
  activeQuantity=Math.max(1,Math.min(99,Number(value)||1));
  document.querySelector('[data-product-quantity]').value=String(activeQuantity);
  document.querySelector('[data-product-quantity-label]').textContent=String(activeQuantity);
  const action=document.querySelector('[data-product-action]');
  if(activeProduct?.price!==null) action.textContent=`Adicionar ${activeQuantity} ao carrinho`;
  else if(activeProduct) action.href=`https://wa.me/5535984336650?text=${encodeURIComponent(`Olá, quero consultar ${activeQuantity} unidade(s) de ${activeProduct.name}.`)}`;
}
function openProduct(product) {
  activeProduct=product; activeQuantity=1;
  document.querySelector('[data-product-image]').src=product.image;
  document.querySelector('[data-product-image]').alt=product.name;
  document.querySelector('[data-product-category]').textContent=product.category;
  document.querySelector('[data-product-name]').textContent=product.name;
  document.querySelector('[data-product-description]').textContent=product.description;
  document.querySelector('[data-product-package]').textContent=product.package;
  document.querySelector('[data-product-indication]').textContent=product.indication;
  document.querySelector('[data-product-price]').textContent=product.price===null?'Preço sob consulta':money.format(product.price);
  document.querySelector('[data-product-price-note]').textContent=product.price===null?'Consulte disponibilidade e valor atualizado com a equipe.':'Preço unitário. Confirme estoque antes de finalizar.';
  const action=document.querySelector('[data-product-action]');
  if(product.price===null){
    action.textContent='Consultar no WhatsApp';
    action.href=`https://wa.me/5535984336650?text=${encodeURIComponent(`Olá, quero consultar ${activeQuantity} unidade(s) de ${product.name}.`)}`;
    action.target='_blank'; action.rel='noreferrer';
  } else {
    action.textContent='Adicionar 1 ao carrinho'; action.href='#'; action.removeAttribute('target'); action.removeAttribute('rel');
  }
  setProductQuantity(1);
  productDialog.showModal();
}
grid.addEventListener('click',event=>{ const button=event.target.closest('[data-product]'); if(!button)return; const product=PRODUCTS.find(item=>item.id===button.dataset.product); if(product) openProduct(product); });
document.querySelector('[data-close-product]').addEventListener('click',()=>productDialog.close());
document.querySelector('[data-product-quantity-controls]').addEventListener('click',event=>{ const button=event.target.closest('[data-product-quantity-delta]'); if(!button)return; setProductQuantity(activeQuantity+Number(button.dataset.productQuantityDelta)); });
document.querySelector('[data-product-quantity]').addEventListener('input',event=>setProductQuantity(event.target.value));
document.querySelector('[data-product-action]').addEventListener('click',event=>{
  if(!activeProduct)return;
  if(activeProduct.price===null){ productDialog.close(); return; }
  event.preventDefault(); cart[activeProduct.id]=(cart[activeProduct.id]||0)+activeQuantity; saveCart(); productDialog.close(); showToast(`${activeQuantity} produto(s) adicionado(s) ao carrinho.`);
});
productDialog.addEventListener('click',event=>{ if(event.target===productDialog) productDialog.close(); });
document.querySelector('[data-cart-lines]').addEventListener('click',event=>{
  const qty=event.target.closest('[data-qty]'); const remove=event.target.closest('[data-remove]');
  if(qty){ const id=qty.dataset.qty; cart[id]=(cart[id]||0)+Number(qty.dataset.delta); if(cart[id]<=0) delete cart[id]; saveCart(); }
  if(remove){ delete cart[remove.dataset.remove]; saveCart(); }
});
document.querySelectorAll('[data-open-cart]').forEach(button=>button.addEventListener('click',()=>cartDialog.showModal()));
document.querySelector('[data-close-cart]').addEventListener('click',()=>cartDialog.close());
document.querySelector('[data-close-checkout]').addEventListener('click',()=>checkoutDialog.close());
document.querySelector('[data-checkout]').addEventListener('click',()=>{ cartDialog.close(); renderCheckout(); checkoutDialog.showModal(); });
search.addEventListener('input',()=>{ state.query=search.value; syncUrl(); renderProducts(); });
sort.addEventListener('change',()=>{ state.sort=sort.value; syncUrl(); renderProducts(); });
priceRange.addEventListener('input',()=>{ state.maxPrice=Number(priceRange.value); priceLabel.textContent=money.format(state.maxPrice); syncUrl(); renderProducts(); });
document.querySelectorAll('input[name="priceStatus"]').forEach(input=>input.addEventListener('change',()=>{ state.priceStatus=input.value; syncUrl(); renderProducts(); }));
document.querySelector('[data-clear-filters]').addEventListener('click',()=>{ state.category='Todos'; state.maxPrice=500; state.priceStatus='all'; state.query=''; state.sort='featured'; search.value=''; sort.value='featured'; priceRange.value='500'; priceLabel.textContent=money.format(500); document.querySelector('input[name="priceStatus"][value="all"]').checked=true; renderCategories(); syncUrl(); renderProducts(); });
document.querySelector('[data-toggle-filters]').addEventListener('click',event=>{ const open=document.querySelector('#filters').classList.toggle('open'); event.currentTarget.setAttribute('aria-expanded',String(open)); });

const form=document.querySelector('#checkoutForm');
const shippingCost=29.90;
function renderCheckout() {
  const items=cartItems(); const delivery=form.elements.delivery.value; const shipping=delivery==='correios'?shippingCost:0;
  document.querySelector('[data-checkout-items]').innerHTML=items.map(({product,qty})=>`<div class="summary-line"><span>${qty}× ${product.name}</span><strong>${money.format(product.price*qty)}</strong></div>`).join('');
  document.querySelector('[data-summary-subtotal]').textContent=money.format(subtotal());
  document.querySelector('[data-summary-shipping]').textContent=delivery==='correios'?`${money.format(shipping)} estimado`:'Grátis';
  document.querySelector('[data-summary-total]').textContent=money.format(subtotal()+shipping);
}
form.addEventListener('change',event=>{
  if(event.target.name==='delivery'){
    const address=document.querySelector('[data-address-fields]'); const delivery=event.target.value;
    address.hidden=delivery==='pickup'; address.querySelectorAll('input').forEach(input=>input.required=delivery==='correios'&&input.name!=='complement'); renderCheckout();
  }
  if(event.target.name==='payment'){
    const card=document.querySelector('[data-card-fields]'); const needsCard=event.target.value!=='pix'; card.hidden=!needsCard; card.querySelectorAll('input').forEach(input=>input.required=needsCard);
  }
});
form.addEventListener('submit',event=>{
  event.preventDefault();
  if(!form.reportValidity()) return;
  const data=new FormData(form); const order=`DK${Date.now().toString().slice(-6)}`; const delivery=data.get('delivery'); const payment=data.get('payment');
  const lines=cartItems().map(({product,qty})=>`${qty}x ${product.name} — ${money.format(product.price*qty)}`).join('\n');
  const total=subtotal()+(delivery==='correios'?shippingCost:0);
  const message=`Olá, quero confirmar o pedido ${order}.\n\n${lines}\n\nEntrega: ${delivery==='correios'?'Correios':'Retirada na loja'}\nPagamento: ${payment==='pix'?'Pix':payment==='credit'?'Cartão de crédito':'Cartão de débito'}\nTotal estimado: ${money.format(total)}\n\nCliente: ${data.get('name')} — ${data.get('phone')}`;
  let storedOrders=[];
  try { storedOrders=JSON.parse(localStorage.getItem('dekorar-orders')||'[]'); if(!Array.isArray(storedOrders)) storedOrders=[]; }
  catch { storedOrders=[]; }
  storedOrders.unshift({id:order,createdAt:new Date().toISOString(),customer:{name:data.get('name'),phone:data.get('phone'),email:data.get('email'),city:data.get('city')||'Retirada na loja'},items:cartItems().map(({product,qty})=>({name:product.name,qty,price:product.price})),delivery:delivery==='correios'?'Correios':'Retirada na Loja',payment:payment==='pix'?'Pix':payment==='credit'?'Cartão de crédito':'Cartão de débito',total,status:'Novo',shipping:{carrier:delivery==='correios'?'Correios':'Retirada na Loja',tracking:'',estimate:'',notes:''}});
  localStorage.setItem('dekorar-orders',JSON.stringify(storedOrders));
  document.querySelector('[data-checkout-content]').innerHTML=`<div class="success"><div class="success-mark">✓</div><h2>Pedido ${order} pronto</h2><p>Envie o resumo à equipe da Dekorar para confirmar estoque, frete e pagamento.</p><a class="btn btn-primary" href="https://wa.me/5535984336650?text=${encodeURIComponent(message)}" target="_blank" rel="noreferrer">Confirmar no WhatsApp</a></div>`;
});
readUrl(); renderCategories(); renderProducts(); updateCart();
