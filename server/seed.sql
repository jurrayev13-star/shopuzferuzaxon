INSERT INTO products (id, category, title_uz, title_ru, price, old_price, description_uz, description_ru, sizes, colors, tags, images, rating, featured) VALUES
('daffic-midi', 'liboslar', 'Daffic kuzgi midi libos', 'Осеннее платье миди Daffic', 690000, NULL,
  'Turkiya ishlab chiqaruvchisi Daffic. Kuzgi kolleksiya, sifatli mato, qulay o‘lchamlar.',
  'Производитель Daffic (Турция). Осенняя коллекция, качественная ткань, удобные размеры.',
  ARRAY['36','38','40','42','44','46'], ARRAY['#5B3A29','#8A6E4F','#2A2A2A'],
  ARRAY['New'], ARRAY['assets/daffic.jpg','assets/libos3.jpg'], 5, TRUE),

('elivana-dress', 'liboslar', 'Elivana klassik libos', 'Классическое платье Elivana', 850000, 990000,
  'Nafis kesim, uzun libos. Kechki uchrashuvlar uchun.', 'Элегантный крой, длинное платье. Для вечерних встреч.',
  ARRAY['36','38','40','42','44'], ARRAY['#7A1E28','#1C1C1C'],
  ARRAY['Sale'], ARRAY['assets/elivana.jpg'], 5, TRUE),

('espira-satin', 'liboslar', 'Espira atlas libos', 'Атласное платье Espira', 720000, NULL,
  'Atlas materiali, chiroyli tushish.', 'Атласный материал, красивая посадка.',
  ARRAY['36','38','40','42','44','46'], ARRAY['#C0392B','#4A4A4A'],
  ARRAY[]::TEXT[], ARRAY['assets/espira.jpg'], 4, FALSE),

('sharmiel-set', 'liboslar', 'Sharmiel to‘plami', 'Комплект Sharmiel', 580000, NULL,
  'Ikki qismli to‘plam. Kunlik kiyim uchun.', 'Комплект из двух предметов. Для повседневной носки.',
  ARRAY['36','38','40','42','44'], ARRAY['#8B7355','#2E9E7B'],
  ARRAY['Hot'], ARRAY['assets/sharmiel.jpg'], 4, FALSE),

('layki-boots', 'poyabzal', 'Layki charm etik', 'Кожаные ботинки Layki', 890000, NULL,
  'Charm etik, tabiiy oshlash.', 'Кожаные ботинки, натуральная выделка.',
  ARRAY['36','37','38','39','40'], ARRAY['#1C1C1C','#5B3A29'],
  ARRAY['New'], ARRAY['assets/layki.jpg','assets/layki2.jpg'], 5, TRUE),

('poyabzal-classic', 'poyabzal', 'Klassik tuflilar', 'Классические туфли', 490000, 590000,
  'Yumshoq tagli, kunlik.', 'Мягкая подошва, повседневные.',
  ARRAY['36','37','38','39','40'], ARRAY['#4A2E20','#1C1C1C'],
  ARRAY['Sale'], ARRAY['assets/poyabzal.jpg'], 4, FALSE),

('lv-imagination', 'atirlar', 'Louis Vuitton Imagination', 'Louis Vuitton Imagination', 1200000, NULL,
  'Kopiya. 100 ml. Uzoq turadi.', 'Копия. 100 мл. Стойкий.',
  ARRAY[]::TEXT[], ARRAY[]::TEXT[],
  ARRAY['Hot'], ARRAY['assets/atir-symphony.jpg','assets/atir-hero.jpg'], 5, TRUE),

('marca-set', 'choyshab', 'Marca Giovanni choyshab', 'Комплект Marca Giovanni', 630000, 900000,
  'Yevropa sifat, 2 ta yostiq jildi + choyshab + adyol jildi.', 'Европейское качество, 2 наволочки + простыня + пододеяльник.',
  ARRAY['euro','2sp'], ARRAY['#C0392B','#8A6E4F','#4A4A4A'],
  ARRAY['Sale'], ARRAY['assets/marca-giovanni.jpg'], 5, TRUE),

('victoria-set', 'ichki', 'Victoria''s Secret to‘plam', 'Комплект Victoria''s Secret', 390000, NULL,
  'Yangi kolleksiya, silliq mato.', 'Новая коллекция, гладкая ткань.',
  ARRAY['S','M','L'], ARRAY['#E79E96','#1C1C1C','#7A1E28'],
  ARRAY['New'], ARRAY['assets/victoria.jpg','assets/victoria2.jpg'], 4, TRUE);
