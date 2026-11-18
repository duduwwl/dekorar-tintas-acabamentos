-- Linha Dkorar Pedras Especiais (12 cores). Rodar no SQL Editor do Supabase para os
-- produtos passarem a existir no banco (pedidos com vínculo ao produto e estoque no painel).
-- Também desativa o antigo "Pedras Naturais Dkorar", substituído por esta linha.
begin;

insert into public.products (id, brand, name, category, price, image, description, package, indication) values
  ('dkorar-pedras-roma', 'Dkorar', 'Dkorar Pedras Especiais Roma', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-roma.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Roma. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo'),
  ('dkorar-pedras-atenas', 'Dkorar', 'Dkorar Pedras Especiais Atenas', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-atenas.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Atenas. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo'),
  ('dkorar-pedras-moscou', 'Dkorar', 'Dkorar Pedras Especiais Moscou', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-moscou.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Moscou. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo'),
  ('dkorar-pedras-paris', 'Dkorar', 'Dkorar Pedras Especiais Paris', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-paris.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Paris. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo'),
  ('dkorar-pedras-lisboa', 'Dkorar', 'Dkorar Pedras Especiais Lisboa', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-lisboa.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Lisboa. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo'),
  ('dkorar-pedras-praga', 'Dkorar', 'Dkorar Pedras Especiais Praga', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-praga.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Praga. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo'),
  ('dkorar-pedras-berlim', 'Dkorar', 'Dkorar Pedras Especiais Berlim', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-berlim.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Berlim. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo'),
  ('dkorar-pedras-madri', 'Dkorar', 'Dkorar Pedras Especiais Madri', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-madri.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Madri. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo'),
  ('dkorar-pedras-bruxelas', 'Dkorar', 'Dkorar Pedras Especiais Bruxelas', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-bruxelas.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Bruxelas. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo'),
  ('dkorar-pedras-viena', 'Dkorar', 'Dkorar Pedras Especiais Viena', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-viena.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Viena. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo'),
  ('dkorar-pedras-londres', 'Dkorar', 'Dkorar Pedras Especiais Londres', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-londres.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Londres. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo'),
  ('dkorar-pedras-amsterda', 'Dkorar', 'Dkorar Pedras Especiais Amsterdã', 'Texturas e efeitos', 169.9, 'assets/img/pedras/card-amsterda.webp', 'Textura hidrorrepelente com minérios naturais da linha Pedras Especiais, na cor Amsterdã. Rende de 5 a 7 m² e é aplicada com desempenadeira de inox.', 'Balde 23 kg', 'Fachadas e paredes, uso interno e externo')
on conflict (id) do update set name = excluded.name, image = excluded.image, description = excluded.description, package = excluded.package, indication = excluded.indication;

insert into public.inventory (product_id, store_id, quantity, minimum)
select p.id, s.id, 0, 2 from public.products p cross join public.stores s
where p.id like 'dkorar-pedras-%' and p.id <> 'dkorar-pedras-naturais'
on conflict do nothing;

update public.products set active = false where id = 'dkorar-pedras-naturais';

commit;
