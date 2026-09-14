# Shop Uz Feruzaxon

Turkiyadan keltiriladigan **libos, poyabzal, atir, choyshab va ichki kiyim** onlayn do'kon vitrinasi.
Ikki tilli (o'zbek/rus), yorug' minimal dizayn ("Noda" uslubida).

## Lokal ishga tushirish

```bash
npm install
npm start
```

Sayt: <http://localhost:8080/Home.dc.html>

## Sahifalar

- `Home.dc.html` — bosh sahifa (hero slider, promo plitkalar, mahsulotlar)
- `Catalog.dc.html?cat=<slug>` — katalog (liboslar / poyabzal / atirlar / choyshab / ichki)
- `Product.dc.html` — mahsulot sahifasi
- `Cart.dc.html` — savat (`localStorage` orqali)
- `Login.dc.html` — kirish / ro'yxatdan o'tish (demo SMS)
- `Profil.dc.html`, `Chegirma.dc.html`, `Olcham.dc.html`
- `Yetkazish.dc.html`, `Biz.dc.html`, `Aloqa.dc.html`
- `Admin.dc.html` — admin panel (faqat `suf_admin="1"` bo'lganda ko'rinadi)

## Tuzilma

- `design_handoff_shopuz/` — dizayn paketi (`.dc.html` prototip fayllar, `chic.css`, `support.js`, `image-slot.js`, `assets/`)
- `package.json` — `http-server` orqali statik hosting
- `railway.json` — Railway deploy konfiguratsiyasi

## Ishlab chiqarish (Railway)

Loyiha `main` shoxiga push qilinganda Railway avtomatik deploy qiladi:

1. Railway → **New Project** → **Deploy from GitHub repo**
2. `shopuzferuzaxon` reponi tanlang
3. **Generate Domain** — public URL oling

Batafsil: [DEPLOY.md](DEPLOY.md)
