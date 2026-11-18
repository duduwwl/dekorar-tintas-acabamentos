/* Dekorar — cliente Supabase (REST, sem dependência externa).
   Chave publishable: segura no front porque o RLS está ligado no banco.
   Lê o catálogo do banco e grava pedidos e leads. */
(() => {
  'use strict';
  const URL = 'https://thigiczpwmyugwlynfwy.supabase.co';
  const KEY = 'sb_publishable_Z6T93Bsb3a7l3tJ0T0Qchw_xSW8Xybw';
  const rest = `${URL}/rest/v1`;
  const headers = (extra) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...extra });
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }));

  const dbIds = new Set();  // ids de produto que existem no banco (preenchido no boot)

  async function getProducts() {
    const cols = 'id,brand,name,category,price,image,description,package,indication';
    const r = await fetch(`${rest}/products?select=${cols}&active=eq.true`, { headers: headers() });
    if (!r.ok) throw new Error(`products ${r.status}`);
    const rows = await r.json();
    return rows.map(p => ({ ...p, price: Number(p.price) }));
  }

  // Grava pedido + itens. Gera o id do pedido no cliente (anon não lê de volta).
  async function createOrder(order) {
    const oid = uuid();
    const row = {
      id: oid,
      order_number: order.id,
      customer_name: order.customer.name,
      customer_phone: order.customer.phone,
      customer_city: order.customer.city,
      delivery: order.delivery,
      payment: order.payment,
      total: order.total,
      status: order.status || 'Novo',
      shipping_carrier: order.shipping?.carrier || null,
      shipping_notes: order.address || order.shipping?.notes || null,
      created_at: order.createdAt || new Date().toISOString()
    };
    const ro = await fetch(`${rest}/orders`, { method: 'POST', headers: headers({ Prefer: 'return=minimal' }), body: JSON.stringify(row) });
    if (!ro.ok) throw new Error(`orders ${ro.status}`);
    const items = (order.items || []).map(it => ({
      order_id: oid,
      // itens do tintométrico (id composto) e produtos só do catálogo local não têm linha no banco: sem FK
      product_id: /@/.test(it.id) || (dbIds.size && !dbIds.has(it.id)) ? null : it.id,
      product_name: it.name,
      qty: it.qty,
      unit_price: it.price
    }));
    if (items.length) {
      const ri = await fetch(`${rest}/order_items`, { method: 'POST', headers: headers({ Prefer: 'return=minimal' }), body: JSON.stringify(items) });
      if (!ri.ok) throw new Error(`order_items ${ri.status}`);
    }
    return oid;
  }

  async function createLead(lead) {
    const row = { name: lead.name || 'Visitante do site', phone: lead.phone || null, message: lead.message || null, source: lead.source || 'site' };
    const r = await fetch(`${rest}/leads`, { method: 'POST', headers: headers({ Prefer: 'return=minimal' }), body: JSON.stringify(row) });
    if (!r.ok) throw new Error(`leads ${r.status}`);
  }

  /* ---------- Autenticação do admin (Supabase Auth / GoTrue) ---------- */
  const TOKEN_KEY = 'dekorar-admin-token';
  const token = () => { try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } };
  const authHeaders = (extra) => headers({ Authorization: `Bearer ${token()}`, ...extra });

  async function signIn(email, password) {
    const r = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
      method: 'POST', headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const j = await r.json();
    if (!r.ok || !j.access_token) throw new Error(j.error_description || j.msg || 'login');
    try { sessionStorage.setItem(TOKEN_KEY, j.access_token); } catch { /* sem sessão */ }
    return true;
  }
  const signOut = () => { try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* */ } };
  const isAuthed = () => !!token();

  /* ---------- Dados do painel admin (exige login) ---------- */
  async function adminGetInventory() {
    const r = await fetch(`${rest}/inventory?select=product_id,store_id,quantity,minimum,products(name,category,image)`, { headers: authHeaders() });
    if (!r.ok) throw new Error(`inventory ${r.status}`);
    const rows = await r.json();
    const map = new Map();
    rows.forEach(x => {
      const p = map.get(x.product_id) || { id: x.product_id, name: x.products?.name || x.product_id, category: x.products?.category || '', image: x.products?.image || '', lavras: 0, tres: 0, minimum: x.minimum };
      p[x.store_id] = x.quantity;
      p.minimum = x.minimum;
      map.set(x.product_id, p);
    });
    return [...map.values()];
  }

  async function adminGetOrders() {
    const cols = 'id,order_number,created_at,customer_name,customer_phone,customer_city,delivery,payment,total,status,shipping_carrier,shipping_tracking,shipping_estimate,shipping_notes,order_items(product_name,qty,unit_price)';
    const r = await fetch(`${rest}/orders?select=${cols}&order=created_at.desc`, { headers: authHeaders() });
    if (!r.ok) throw new Error(`orders ${r.status}`);
    const rows = await r.json();
    return rows.map(o => ({
      _id: o.id,
      id: o.order_number || o.id,
      createdAt: o.created_at,
      customer: { name: o.customer_name, phone: o.customer_phone, city: o.customer_city },
      items: (o.order_items || []).map(it => ({ name: it.product_name, qty: it.qty, price: Number(it.unit_price) })),
      delivery: o.delivery, payment: o.payment, total: Number(o.total), status: o.status,
      shipping: { carrier: o.shipping_carrier || '', tracking: o.shipping_tracking || '', estimate: o.shipping_estimate || '', notes: o.shipping_notes || '' }
    }));
  }

  async function adminSetStock(productId, store, quantity) {
    const r = await fetch(`${rest}/inventory?product_id=eq.${encodeURIComponent(productId)}&store_id=eq.${store}`, {
      method: 'PATCH', headers: authHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ quantity, updated_at: new Date().toISOString() })
    });
    if (!r.ok) throw new Error(`stock ${r.status}`);
  }

  async function adminUpdateOrder(uuid, o) {
    const r = await fetch(`${rest}/orders?id=eq.${uuid}`, {
      method: 'PATCH', headers: authHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({
        status: o.status,
        shipping_carrier: o.shipping?.carrier || null,
        shipping_tracking: o.shipping?.tracking || null,
        shipping_estimate: o.shipping?.estimate || null,
        shipping_notes: o.shipping?.notes || null
      })
    });
    if (!r.ok) throw new Error(`order ${r.status}`);
  }

  async function adminAddProduct(p) {
    const id = `custom-${Date.now()}`;
    const rp = await fetch(`${rest}/products`, {
      method: 'POST', headers: authHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ id, brand: 'Diversos', name: p.name, category: p.category, price: 0, image: 'assets/img/dkorar-lata-cutout.webp', active: true })
    });
    if (!rp.ok) throw new Error(`product ${rp.status}`);
    const inv = [
      { product_id: id, store_id: 'lavras', quantity: p.lavras, minimum: p.minimum },
      { product_id: id, store_id: 'tres', quantity: p.tres, minimum: p.minimum }
    ];
    const ri = await fetch(`${rest}/inventory`, { method: 'POST', headers: authHeaders({ Prefer: 'return=minimal' }), body: JSON.stringify(inv) });
    if (!ri.ok) throw new Error(`product-inv ${ri.status}`);
    return id;
  }

  window.DekorarDB = {
    getProducts, createOrder, createLead,
    signIn, signOut, isAuthed,
    adminGetInventory, adminGetOrders, adminSetStock, adminUpdateOrder, adminAddProduct
  };

  /* ---------- Boot: hidrata o catálogo do banco e só então carrega os consumidores ----------
     data-consumer no próprio <script> lista os scripts a injetar depois dos produtos. */
  const self = document.currentScript;
  const consumers = (self?.dataset.consumer || '').split(/\s+/).filter(Boolean);

  function loadNext(list, i) {
    if (i >= list.length) return;
    const s = document.createElement('script');
    s.src = list[i];
    s.onload = s.onerror = () => loadNext(list, i + 1);  // segue mesmo se um falhar
    document.body.appendChild(s);
  }

  // marcas que saíram da loja: escondidas no site mesmo que ainda estejam ativas no banco
  const REMOVED_BRANDS = ['Anjo', 'Deca', 'Ceusa', 'Lumavi'];
  // produtos substituídos: "Pedras Naturais Dkorar" virou a linha Pedras Especiais (12 cores)
  const REMOVED_IDS = ['dkorar-pedras-naturais'];

  function reorderToLocal(dbRows) {
    const local = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
    if (!local.length) return dbRows;
    const byId = new Map(dbRows.map(p => [p.id, p]));
    const ordered = [];
    // marca e nome seguem o catálogo local (ex.: Mactra deixou de aparecer como Coral)
    // produtos que só existem no catálogo local (ainda sem linha no banco) entram na posição do catálogo
    local.forEach(p => { const row = byId.get(p.id); if (row) { ordered.push({ ...row, brand: p.brand, name: p.name }); byId.delete(p.id); } else ordered.push(p); });
    byId.forEach(row => { if (!REMOVED_IDS.includes(row.id)) ordered.push(row); });  // produtos novos no banco vão para o fim
    return ordered;
  }

  async function boot() {
    if (consumers.length) {
      try {
        const rows = await Promise.race([
          getProducts(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000))
        ]);
        if (Array.isArray(rows) && rows.length) {
          rows.forEach(p => dbIds.add(p.id));
          window.PRODUCTS = reorderToLocal(rows.filter(p => !REMOVED_BRANDS.includes(p.brand)));
        }
      } catch { /* banco indisponível: segue com o catálogo local (catalog-data.js) */ }
      loadNext(consumers, 0);
    }
  }
  boot();
})();
