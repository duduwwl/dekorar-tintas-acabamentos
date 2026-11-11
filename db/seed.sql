-- Seed gerado de catalog-data.js e admin.js. Não editar à mão.
begin;

insert into public.stores (id, name, city) values
  ('lavras','Dekorar Lavras','Lavras'),
  ('tres','Dekorar Três Corações','Três Corações')
on conflict (id) do nothing;

insert into public.products (id, brand, name, category, price, image, description, package, indication) values
  ('dkorar-premium', 'Dkorar', 'Tinta Dkorar Premium', 'Tintas', 289.9, 'assets/img/dkorar-lata-cutout.webp', 'Linha própria da Dekorar para quem quer acabamento superior e mais durabilidade.', 'Lata quadrada 18 litros', 'Pintura com acabamento superior'),
  ('dkorar-economica', 'Dkorar', 'Tinta Dkorar Econômica', 'Tintas', 189.9, 'assets/img/dkorar-lata-cutout.webp', 'Linha própria com ótimo custo-benefício para a pintura do dia a dia.', 'Lata quadrada 18 litros', 'Pintura do dia a dia'),
  ('dkorar-especiais-acrilica', 'Dkorar', 'Dkorar Tintas Especiais Acrílica', 'Tintas', 249.9, 'assets/img/pack-dkorar-bege.webp', 'Tinta acrílica da linha Dkorar Tintas Especiais, na embalagem bege da marca, para paredes internas e externas.', 'Balde bege', 'Pintura de paredes internas e externas'),
  ('coral-decora-seda', 'Coral', 'Coral Decora Seda', 'Tintas', 459.9, 'assets/img/pack-coral-decora-seda.webp', 'Tinta acrílica premium com acabamento seda.', 'Lata de 16 L e outras', 'Paredes internas'),
  ('coral-decora-matte', 'Coral', 'Coral Decora Matte Extra Fosco', 'Tintas', 449.9, 'assets/img/pack-coral-decora-matte.webp', 'Tinta acrílica premium com acabamento extra fosco.', 'Balde e outras embalagens', 'Paredes internas'),
  ('coral-super-lavavel', 'Coral', 'Coral Super Lavável', 'Tintas', 389.9, 'assets/img/pack-coral-super-lavavel.webp', 'Tinta com proteção antimanchas e antibactérias, fácil de limpar.', 'Balde e outras embalagens', 'Paredes internas'),
  ('coral-sol-chuva', 'Coral', 'Coral Proteção Sol & Chuva', 'Tintas', 499.9, 'assets/img/pack-coral-sol-chuva.webp', 'Pintura impermeabilizante com película emborrachada para fachadas.', 'Lata de 18 L e outras', 'Fachadas e áreas externas'),
  ('coral-rende-20l', 'Coral', 'Coral Rende Muito 20 L', 'Tintas', 329.9, 'assets/img/pack-coral-rende.webp', 'Tinta concentrada Coral, na cor Gelo, indicada para projetos que buscam rendimento na pintura.', '20 litros', 'Pintura de paredes internas'),
  ('coral-master', 'Coral', 'Coral Master', 'Tintas', 299.9, 'assets/img/pack-coral-master.webp', 'Tinta acrílica Coral de boa cobertura para o dia a dia da obra, em lata e balde.', 'Lata de 18 L e balde', 'Paredes internas e externas'),
  ('suvinil-rende-20l', 'Suvinil', 'Suvinil Rende e Cobre Muito 20 L', 'Tintas', 319.9, 'assets/img/pack-suvinil.webp', 'Tinta para áreas internas e externas, na cor Neve, com proposta de bom rendimento e cobertura.', '20 litros', 'Pintura de paredes internas e externas'),
  ('suvinil-toque-seda', 'Suvinil', 'Suvinil Toque de Seda', 'Tintas', 429.9, 'assets/img/pack-suvinil-toque-seda.webp', 'Tinta acrílica premium Suvinil com acabamento acetinado, para paredes internas.', 'Lata de 16 L', 'Paredes internas'),
  ('anjo-fosco-total', 'Anjo', 'Anjo Acrílica Premium Fosco Total', 'Tintas', 349.9, 'assets/img/pack-anjo-fosco-total.webp', 'Tinta acrílica premium Anjo para paredes e gesso, acabamento fosco.', 'Lata', 'Paredes e gesso'),
  ('anjo-anjomais', 'Anjo', 'Anjo AnjoMais', 'Tintas', 259.9, 'assets/img/pack-anjomais.jpg', 'Tinta acrílica Anjo para paredes e gesso, com bom rendimento, para áreas internas e externas.', 'Lata de 18 L', 'Paredes e gesso, áreas internas e externas'),
  ('coralit-ultra', 'Coral', 'Esmalte Coralit UltraResistência', 'Esmaltes', 129.9, 'assets/img/pack-coralit-ultra.webp', 'Esmalte sintético Coral para madeira e metal, nos acabamentos brilhante, acetinado e fosco.', 'Galão e quarto de galão', 'Madeira e metal'),
  ('coralit-total', 'Coral', 'Esmalte Coralit Total', 'Esmaltes', 119.9, 'assets/img/pack-coralit-total.webp', 'Esmalte base água de ultra aderência para madeira, metal, alumínio, galvanizados e PVC.', 'Consulte as opções', 'Madeira, metal e PVC'),
  ('suvinil-multi', 'Suvinil', 'Esmalte Suvinil Multissuperfícies', 'Esmaltes', 139.9, 'assets/img/pack-suvinil-multi.webp', 'Esmalte base água para madeira, metal, azulejo, vidro e alvenaria, em áreas internas e externas.', 'Galão', 'Várias superfícies'),
  ('suvinil-cor-protecao', 'Suvinil', 'Esmalte Suvinil Cor & Proteção', 'Esmaltes', 109.9, 'assets/img/pack-suvinil-cor-protecao.webp', 'Esmalte sintético premium Suvinil para madeira e metal, interior e exterior.', 'Galão de 3,6 L', 'Madeira e metal'),
  ('dkorar-grafiato', 'Dkorar', 'Grafiato Dkorar', 'Texturas e efeitos', 139.9, 'assets/img/dkorar-lata-cutout.webp', 'Textura de acabamento resistente que ajuda a disfarçar imperfeições da parede.', 'Consulte as opções', 'Textura para paredes'),
  ('dkorar-textura-lisa', 'Dkorar', 'Textura Lisa Dkorar', 'Texturas e efeitos', 119.9, 'assets/img/dkorar-lata-cutout.webp', 'Textura simples e elegante para qualquer ambiente.', 'Consulte as opções', 'Textura para paredes'),
  ('dkorar-pedras-naturais', 'Dkorar', 'Pedras Naturais Dkorar', 'Texturas e efeitos', 169.9, 'assets/img/dkorar-lata-cutout.webp', 'Acabamento com o aspecto rústico da pedra, para áreas internas e externas.', 'Consulte as opções', 'Revestimento decorativo'),
  ('dkorar-lamato', 'Dkorar', 'Lamato Dkorar', 'Texturas e efeitos', 159.9, 'assets/img/dkorar-lata-cutout.webp', 'Efeito moderno para paredes de destaque.', 'Consulte as opções', 'Efeito decorativo'),
  ('dkorar-especiais-textura', 'Dkorar', 'Dkorar Tintas Especiais Textura', 'Texturas e efeitos', 129.9, 'assets/img/pack-dkorar-bege.webp', 'Textura da linha Dkorar Tintas Especiais, na embalagem bege, para acabamentos decorativos.', 'Balde bege', 'Textura para paredes'),
  ('efeito-velvet', 'Coral', 'Coral Decora Efeitos Especiais Velvet 2,1 L', 'Texturas e efeitos', 149.9, 'assets/img/pack-velvet.webp', 'Acabamento decorativo Velvet ou Nuage, aplicado com desempenadeira para criar paredes com efeito visual sofisticado.', '2,1 litros', 'Efeito decorativo para paredes internas'),
  ('massa-dkorar', 'Dkorar', 'Massa Corrida Dkorar', 'Massas e preparação', 64.9, 'assets/img/dkorar-lata-cutout.webp', 'Produto da linha própria Dkorar para preparação de obras de pequeno, médio e grande porte.', 'Consulte as opções', 'Nivelamento e preparação de paredes'),
  ('dkorar-massa-acrilica', 'Dkorar', 'Massa Acrílica Dkorar', 'Massas e preparação', 99.9, 'assets/img/dkorar-lata-cutout.webp', 'Massa para nivelar superfícies internas e externas.', 'Consulte as opções', 'Preparação de paredes internas e externas'),
  ('dkorar-especiais-massa', 'Dkorar', 'Dkorar Tintas Especiais Massa Corrida', 'Massas e preparação', 69.9, 'assets/img/pack-dkorar-bege.webp', 'Massa corrida da linha Dkorar Tintas Especiais, na embalagem bege, para nivelar a parede antes da pintura.', 'Balde bege', 'Nivelamento de paredes internas'),
  ('dkorar-fundo-preparador', 'Dkorar', 'Fundo Preparador Dkorar', 'Massas e preparação', 109.9, 'assets/img/dkorar-lata-cutout.webp', 'A base certa para a parede antes da pintura.', 'Consulte as opções', 'Preparação antes da pintura'),
  ('dkorar-selador', 'Dkorar', 'Selador Dkorar', 'Massas e preparação', 94.9, 'assets/img/dkorar-lata-cutout.webp', 'Protege a parede e ajuda a pintura a durar mais.', 'Consulte as opções', 'Selagem da parede'),
  ('massa-coral-25kg', 'Coral', 'Massa Corrida Coral 25 kg', 'Massas e preparação', 79.9, 'assets/img/pack-massa-coral.webp', 'Massa corrida para nivelar e preparar superfícies internas antes da aplicação da tinta.', '25 kg', 'Preparação de paredes internas'),
  ('dkorar-borracha-liquida', 'Dkorar', 'Borracha Líquida Dkorar', 'Impermeabilização', 219.9, 'assets/img/dkorar-lata-cutout.webp', 'Impermeabilização que veda fissuras e protege lajes, muros e outras superfícies.', 'Consulte as opções', 'Impermeabilização'),
  ('mactra-seca-parede', 'Coral', 'Coral Mactra Seca Parede', 'Impermeabilização', 129.9, 'assets/img/pack-mactra.webp', 'Sistema de spray e massa para tratar paredes com umidade de rodapé, mofo, bolhas e salitre.', 'Spray 0,75 L e massa 4,5 kg', 'Tratamento de paredes com umidade'),
  ('anjo-emborrachada', 'Anjo', 'Tinta Emborrachada Anjo', 'Impermeabilização', 399.9, 'assets/img/pack-anjo-emborrachada.webp', 'Tinta elástica e impermeável para paredes e lajes, com conforto térmico e acústico.', 'Lata de 3,6 L e balde de 18 L', 'Paredes e lajes, áreas externas e internas'),
  ('revestliso-ceramfix', 'Ceramfix', 'Massa Revestliso Camada Fina Ceramfix 15 kg', 'Revestimentos', 89.9, 'assets/img/pack-revestliso.webp', 'Argamassa mineral de camada fina para acabamento liso em paredes e tetos, interno ou externo.', '15 kg', 'Revestimento liso de paredes e tetos'),
  ('acotone-corante', 'Acotone', 'Corante Acotone Concentrado 720 ml', 'Sistema tintométrico', 39.9, 'assets/img/pack-acotone.webp', 'Corante concentrado para o sistema tintométrico da loja: a cor escolhida na máquina sai na hora.', 'Sachê de 720 ml', 'Preparo de cores no sistema tintométrico')
on conflict (id) do update set brand=excluded.brand, name=excluded.name, category=excluded.category, price=excluded.price, image=excluded.image, description=excluded.description, package=excluded.package, indication=excluded.indication;

insert into public.inventory (product_id, store_id, quantity, minimum) values
  ('dkorar-premium', 'lavras', 0, 8),
  ('dkorar-premium', 'tres', 0, 8),
  ('dkorar-economica', 'lavras', 0, 8),
  ('dkorar-economica', 'tres', 0, 8),
  ('dkorar-especiais-acrilica', 'lavras', 0, 8),
  ('dkorar-especiais-acrilica', 'tres', 0, 8),
  ('coral-decora-seda', 'lavras', 0, 8),
  ('coral-decora-seda', 'tres', 0, 8),
  ('coral-decora-matte', 'lavras', 0, 8),
  ('coral-decora-matte', 'tres', 0, 8),
  ('coral-super-lavavel', 'lavras', 0, 8),
  ('coral-super-lavavel', 'tres', 0, 8),
  ('coral-sol-chuva', 'lavras', 0, 8),
  ('coral-sol-chuva', 'tres', 0, 8),
  ('coral-rende-20l', 'lavras', 7, 12),
  ('coral-rende-20l', 'tres', 4, 12),
  ('coral-master', 'lavras', 0, 8),
  ('coral-master', 'tres', 0, 8),
  ('suvinil-rende-20l', 'lavras', 18, 8),
  ('suvinil-rende-20l', 'tres', 11, 8),
  ('suvinil-toque-seda', 'lavras', 0, 8),
  ('suvinil-toque-seda', 'tres', 0, 8),
  ('anjo-fosco-total', 'lavras', 0, 8),
  ('anjo-fosco-total', 'tres', 0, 8),
  ('anjo-anjomais', 'lavras', 0, 8),
  ('anjo-anjomais', 'tres', 0, 8),
  ('coralit-ultra', 'lavras', 0, 8),
  ('coralit-ultra', 'tres', 0, 8),
  ('coralit-total', 'lavras', 0, 8),
  ('coralit-total', 'tres', 0, 8),
  ('suvinil-multi', 'lavras', 0, 8),
  ('suvinil-multi', 'tres', 0, 8),
  ('suvinil-cor-protecao', 'lavras', 0, 8),
  ('suvinil-cor-protecao', 'tres', 0, 8),
  ('dkorar-grafiato', 'lavras', 0, 8),
  ('dkorar-grafiato', 'tres', 0, 8),
  ('dkorar-textura-lisa', 'lavras', 0, 8),
  ('dkorar-textura-lisa', 'tres', 0, 8),
  ('dkorar-pedras-naturais', 'lavras', 0, 8),
  ('dkorar-pedras-naturais', 'tres', 0, 8),
  ('dkorar-lamato', 'lavras', 0, 8),
  ('dkorar-lamato', 'tres', 0, 8),
  ('dkorar-especiais-textura', 'lavras', 0, 8),
  ('dkorar-especiais-textura', 'tres', 0, 8),
  ('efeito-velvet', 'lavras', 6, 5),
  ('efeito-velvet', 'tres', 7, 5),
  ('massa-dkorar', 'lavras', 34, 16),
  ('massa-dkorar', 'tres', 28, 16),
  ('dkorar-massa-acrilica', 'lavras', 0, 8),
  ('dkorar-massa-acrilica', 'tres', 0, 8),
  ('dkorar-especiais-massa', 'lavras', 0, 8),
  ('dkorar-especiais-massa', 'tres', 0, 8),
  ('dkorar-fundo-preparador', 'lavras', 0, 8),
  ('dkorar-fundo-preparador', 'tres', 0, 8),
  ('dkorar-selador', 'lavras', 0, 8),
  ('dkorar-selador', 'tres', 0, 8),
  ('massa-coral-25kg', 'lavras', 22, 10),
  ('massa-coral-25kg', 'tres', 17, 10),
  ('dkorar-borracha-liquida', 'lavras', 0, 8),
  ('dkorar-borracha-liquida', 'tres', 0, 8),
  ('mactra-seca-parede', 'lavras', 3, 8),
  ('mactra-seca-parede', 'tres', 2, 8),
  ('anjo-emborrachada', 'lavras', 0, 8),
  ('anjo-emborrachada', 'tres', 0, 8),
  ('revestliso-ceramfix', 'lavras', 0, 6),
  ('revestliso-ceramfix', 'tres', 3, 6),
  ('acotone-corante', 'lavras', 0, 8),
  ('acotone-corante', 'tres', 0, 8)
on conflict (product_id, store_id) do update set quantity=excluded.quantity, minimum=excluded.minimum;

with o as (
  insert into public.orders (order_number, customer_name, customer_phone, customer_city, delivery, payment, total, status, shipping_carrier, shipping_tracking, shipping_estimate, shipping_notes, created_at)
  values ('DK204817', 'Marcos Almeida', '(35) 98845-2103', 'Lavras', 'Entrega Dekorar', 'Pix', 959.4, 'Separação', 'Entrega Dekorar', '', '2026-10-15', 'Entregar no período da tarde.', '2026-10-14T13:42:00-03:00')
  on conflict (order_number) do nothing
  returning id
)
insert into public.order_items (order_id, product_name, qty, unit_price)
select o.id, v.product_name, v.qty, v.unit_price from o,
  (values
    ('Massa Corrida Coral 25 kg', 4, 79.9::numeric),
    ('Suvinil Rende e Cobre Muito 20 L', 2, 319.9::numeric)
  ) as v(product_name, qty, unit_price);

with o as (
  insert into public.orders (order_number, customer_name, customer_phone, customer_city, delivery, payment, total, status, shipping_carrier, shipping_tracking, shipping_estimate, shipping_notes, created_at)
  values ('DK204652', 'Construtora Horizonte', '(35) 99120-4488', 'Três Corações', 'Entrega Dekorar', 'Cartão de crédito', 870, 'Pronto', 'Entrega Dekorar', '', '2026-10-15', 'Obra com acesso pela portaria lateral.', '2026-10-14T10:18:00-03:00')
  on conflict (order_number) do nothing
  returning id
)
insert into public.order_items (order_id, product_name, qty, unit_price)
select o.id, v.product_name, v.qty, v.unit_price from o,
  (values
    ('Massa Corrida Dkorar', 12, 72.5::numeric)
  ) as v(product_name, qty, unit_price);

with o as (
  insert into public.orders (order_number, customer_name, customer_phone, customer_city, delivery, payment, total, status, shipping_carrier, shipping_tracking, shipping_estimate, shipping_notes, created_at)
  values ('DK203991', 'Ana Paula Souza', '(35) 98402-7190', 'Varginha', 'Correios', 'Pix', 329.7, 'Enviado', 'Correios', 'BR784512963MG', '2026-10-17', '', '2026-10-13T16:06:00-03:00')
  on conflict (order_number) do nothing
  returning id
)
insert into public.order_items (order_id, product_name, qty, unit_price)
select o.id, v.product_name, v.qty, v.unit_price from o,
  (values
    ('Coral Mactra Seca Parede', 2, 149.9::numeric)
  ) as v(product_name, qty, unit_price);

with o as (
  insert into public.orders (order_number, customer_name, customer_phone, customer_city, delivery, payment, total, status, shipping_carrier, shipping_tracking, shipping_estimate, shipping_notes, created_at)
  values ('DK203748', 'Roberto Mendes', '(35) 99718-3302', 'Lavras', 'Retirada na Loja', 'Cartão de débito', 189.9, 'Novo', 'Retirada na Loja', '', NULL, '', '2026-10-13T09:25:00-03:00')
  on conflict (order_number) do nothing
  returning id
)
insert into public.order_items (order_id, product_name, qty, unit_price)
select o.id, v.product_name, v.qty, v.unit_price from o,
  (values
    ('Efeito Velvet Coral 2,1 L', 1, 189.9::numeric)
  ) as v(product_name, qty, unit_price);

with o as (
  insert into public.orders (order_number, customer_name, customer_phone, customer_city, delivery, payment, total, status, shipping_carrier, shipping_tracking, shipping_estimate, shipping_notes, created_at)
  values ('DK202964', 'Fernanda Lima', '(35) 99264-5501', 'Três Corações', 'Retirada na Loja', 'Pix', 329.9, 'Entregue', 'Retirada na Loja', '', '2026-10-12', '', '2026-10-12T11:15:00-03:00')
  on conflict (order_number) do nothing
  returning id
)
insert into public.order_items (order_id, product_name, qty, unit_price)
select o.id, v.product_name, v.qty, v.unit_price from o,
  (values
    ('Coral Rende Muito 20 L', 1, 329.9::numeric)
  ) as v(product_name, qty, unit_price);

commit;
