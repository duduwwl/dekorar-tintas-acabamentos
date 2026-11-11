/* Dekorar — cliente Supabase (REST, sem dependência externa).
   Chave publishable: segura no front porque o RLS está ligado no banco.
   Lê o catálogo do banco e grava pedidos e leads. */
(() => {
  'use strict';
  const URL = 'https://nweqwzicallwafkkcauc.supabase.co';
  const KEY = 'sb_publishable_i2zhF0Wc6qaqSaQy1fXEoA_pxOPMxOs';
  const rest = `${URL}/rest/v1`;
  const headers = (extra) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...extra });
  const uuid = () => (crypto.randomUUID ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }));

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
      product_id: /@/.test(it.id) ? null : it.id,  // itens do tintométrico têm id composto: sem FK
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

  window.DekorarDB = { getProducts, createOrder, createLead };

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

  function reorderToLocal(dbRows) {
    const local = Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [];
    if (!local.length) return dbRows;
    const byId = new Map(dbRows.map(p => [p.id, p]));
    const ordered = [];
    local.forEach(p => { const row = byId.get(p.id); if (row) { ordered.push(row); byId.delete(p.id); } });
    byId.forEach(row => ordered.push(row));  // produtos novos no banco vão para o fim
    return ordered;
  }

  async function boot() {
    if (consumers.length) {
      try {
        const rows = await Promise.race([
          getProducts(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 3000))
        ]);
        if (Array.isArray(rows) && rows.length) window.PRODUCTS = reorderToLocal(rows);
      } catch { /* banco indisponível: segue com o catálogo local (catalog-data.js) */ }
      loadNext(consumers, 0);
    }
  }
  boot();
})();
