# Handoff: Shop Uz Feruzaxon — onlayn kiyim do'koni (frontend)

## Overview
Shop Uz Feruzaxon — Turkiyadan keltiriladigan kiyim, poyabzal, atir, choyshab va ichki
kiyim sotadigan onlayn do'kon vitrinasi. Ikki tilli (o'zbek/rus), yorug' "ChicWove" uslubida.
Loyiha bir nechta sahifadan iborat: bosh sahifa, katalog (kategoriya bo'yicha filtr),
mahsulot sahifasi, savat, kirish/ro'yxatdan o'tish, profil, chegirmalar, o'lcham jadvali,
axborot sahifalari (yetkazish, biz haqimizda, aloqa) va admin panel.

## About the Design Files
Ushbu paketdagi fayllar **HTML'da yaratilgan dizayn namunalari (prototip)** — kerakli
ko'rinish va xatti-harakatni ko'rsatadi, to'g'ridan-to'g'ri ko'chirib ishlatiladigan
production kod EMAS. Vazifa — ushbu dizaynlarni maqsadli kod bazasining mavjud muhitida
(React, Vue, Next.js, SwiftUI va h.k.) uning o'z pattern va kutubxonalari bilan qayta
qurish. Agar muhit hali yo'q bo'lsa — loyiha uchun eng mos framework tanlanadi
(tavsiya: **React + Vite** yoki **Next.js**, chunki dizayn allaqachon komponentli).

### Texnik eslatma (muhim)
Namunalar "Design Component" (`.dc.html`) formatida yozilgan — bu maxsus runtime
(`support.js`) ustida ishlaydigan reaktiv shablonlar. **Bu formatni ko'chirib olmang.**
Har bir `.dc.html` faylida ikki qism bor:
- **template** — `<x-dc>…</x-dc>` orasidagi HTML markup (holelar `{{ }}` bilan)
- **logic** — `class Component extends DCLogic { renderVals() {…} }` — holat va ma'lumot

Bularni odatiy komponentga aylantiring: template → JSX/Vue template, `renderVals()` dagi
qiymatlar → props/state/computed. `sc-for` → `.map()`, `sc-if` → shartli render,
`dc-import name="X"` → `<X/>` komponenti.

## Fidelity
**High-fidelity (hifi)** — yakuniy ranglar, tipografiya, oraliqlar va o'zaro ta'sirlar
bilan. UI'ni kod bazasining kutubxonalari yordamida piksel-aniqlikda qayta yarating.
Rasm joylari (`image-slot`) foydalanuvchi tomonidan to'ldiriladigan bo'sh o'rinlar —
production'da real `<img>` yoki media komponenti bilan almashtiring.

## Arxitektura va umumiy komponentlar
Barcha sahifalar ikkita umumiy komponentni ulaydi:
- **StoreNav** (`StoreNav.dc.html`) — yuqori navigatsiya: logo, kategoriya menyusi
  (gamburger), qidiruv, kirish/profil, savat (jonli sanoq), til almashtirgich (UZ/RU
  bayroq bilan). Ketma-ketlik (chapdan o'ngga): Kirish → Qidiruv → Savat → Sevimli → Til.
- **StoreFooter** (`StoreFooter.dc.html`) — pastki qism: brend, ijtimoiy havolalar
  (Telegram, Instagram), Yordam va Do'kon ustunlari (haqiqiy sahifalarga havola),
  to'lov teglari.

### Global holat (localStorage kalitlari)
Sahifalar orasida holat `localStorage` orqali uzatiladi, o'zgarish `window`
event'lari bilan e'lon qilinadi (framework'da bularni Context/Store/Pinia bilan almashtiring):

| Kalit | Mazmuni | Event |
| --- | --- | --- |
| `suf_lang` | joriy til: `"uz"` yoki `"ru"` | `suf-lang` |
| `suf_cart` | savat: `[{key,title,img,price,size,sub,qty}]` | `suf-cart` |
| `suf_user` | kirgan foydalanuvchi: `{name, phone}` yoki yo'q | `suf-auth` |
| `suf_admin` | `"1"` bo'lsa qurilma admin (admin havolasi ko'rinadi) | — |

Til, savat va auth — barcha komponentlar `componentDidMount`'da tegishli event'ni
tinglaydi va `forceUpdate()` qiladi. Framework'da: reactive store'ga obuna.

## Screens / Views

### 1. Bosh sahifa — `Home.dc.html`
- **Maqsad**: kategoriyalarga va aksiyalarga kirish nuqtasi.
- **Layout**: markazlashgan, `max-width` ~1180px konteyner, 30px yon padding.
  - **Hero** — 3 ta slayd, har **10 soniyada** avtomatik almashadi, silliq (fade/opacity)
    o'tish bilan. Slaydlar: "Turkiya liboslari", "Turkiya Atirlari", "Turkiya poyabzallari".
    Har birida sarlavha + "Xarid qilish" tugmasi (tegishli kategoriyaga havola).
  - **Kategoriya plitkalari** grid — Liboslar, Poyabzal, Atirlar, Choyshab to'plamlari,
    Ichki kiyim (Plashlar/Paltolar hozircha o'chirilgan). Har biri
    `Catalog.dc.html?cat=<slug>` ga o'tadi.
  - **Promo plitkalar**: "Louis Vuitton Imagination" (atir mahsulotiga to'g'ridan-to'g'ri
    havola), "Victoria's Secret — yangi kolleksiya", "Kuzgi kolleksiya Daffic" (Liboslarga).
  - **"Har bir mijozga mehr-muhabbat bilan"** slogan bloki.
- **Tipografiya**: sarlavhalar serif (Playfair Display), tana DM Sans.

### 2. Katalog — `Catalog.dc.html`
- **Maqsad**: bitta kategoriyani ko'rish. `?cat=<slug>` query bilan ochiladi;
  gamburgerdan kategoriyaga kirilганda faqat o'sha kategoriya mahsulotlari ko'rinadi.
- **Layout**: chapda filtr paneli (aside), o'ngda mahsulot grid'i. Yuqorida breadcrumb
  ("Bosh sahifa / <kategoriya>") va kategoriya sarlavhasi.
- **Filtrlar kategoriyaga bog'liq** (`showSizes`/`showColor`/`showPrice` bayroqlari):
  - **Liboslar**: filtr yo'q (o'lcham/rang/narx yashiringan). O'lchamlar Turk tizimi:
    36–56, ikkitadan (36, 38, 40 … 56). Rasm formati **9:16** (uzun).
  - **Poyabzal**: o'lcham 36–40 (ayollar). Rang/narx filtri yo'q. Rasm 9:16.
  - **Atirlar**: o'lcham/rang/narx filtri yo'q.
  - **Choyshab**: o'lcham/rang/narx filtri yo'q.
- **Hero**: Atirlar sahifasida alohida hero ("Turkiyadan kelgan Lux kopiya atirlari…",
  harakatlanuvchi rasm). Liboslar sahifasida ham hero bor.
- **Mahsulot kartochkasi**: `ProductCard.dc.html` — rasm (yoki `image-slot`), teglar
  (New/Hot/Sale/"1 dona qoldi"), nom, o'lcham/tavsif matni, narx (+ eski narx chizilган),
  o'lcham tanlash tugmalari (bor bo'lsa), "Savatga qo'shish" tugmasi.

### 3. Mahsulot sahifasi — `Product.dc.html`
- Rasm galereyasi (asosiy + kichik rasmlar), nom, narx, o'lcham/rang tanlash (kategoriyaga
  qarab), miqdor, "Savatga qo'shish", tavsif, o'lcham jadvaliga havola.

### 4. Savat — `Cart.dc.html`
- **To'liq ishlaydi.** `suf_cart` dan o'qiydi. Har element: rasm, nom, o'lcham/tavsif,
  miqdor +/− (0 ga tushsa o'chadi), qatorlik summa. O'ng tomonda xulosa: mahsulotlar
  summasi + Toshkent yetkazish (30 000 so'm) = **Jami** (avtomatik hisob).
  Bo'sh bo'lsa — "Savatingiz bo'sh" holati. Narxlar bo'shliqли formatда (`1 200 000`).

### 5. Kirish / Ro'yxatdan o'tish — `Login.dc.html`
- **To'liq ishlaydi (demo).** Ikki tab (Kirish / Ro'yxatdan o'tish — ro'yxatda ism maydoni).
  Telefon +998 avtomatik formatlanadi. "Kodni yuborish" → 5 xonali **demo kod**
  generatsiya qilinadi va ekranда ko'rsatiladi (haqiqiy SMS backend YO'Q — bu joyni
  real SMS provayderiga ulang). 5 katakli kod kiritish (avto-fokus, Backspace navigatsiya).
  Tasdiqlangach `suf_user` saqlanadi, `suf-auth` e'lon qilinadi, bosh sahifaga o'tadi.
  Telegram tugmasi t.me havolasi.

### 6. Profil — `Profil.dc.html`
- Kirgан foydalanuvchi uchun: ism, telefon, havolalar (buyurtmalar, sevimlilar, aloqa),
  "Chiqish" (`suf_user` o'chadi). Kirmagan bo'lsa — "Kirish" taklifi.

### 7. Chegirmalar — `Chegirma.dc.html`
- Chegirdagi mahsulotlar (birinchisi: Marca Giovanni choyshabi, eski 900 000 → -30%).

### 8. O'lcham jadvali — `Olcham.dc.html`
- Turk o'lchamlari bo'yicha jadval (foydalanuvchi bergan rasmga mos hisoblanган).

### 9. Axborot sahifalari
- **Yetkazish** (`Yetkazish.dc.html`): BTS/FARGO butun O'zbekiston; Toshkent ichi kuryer
  kun davomida 30 000 so'm; rasmiylashtirish admin orqali.
- **Biz haqimizda** (`Biz.dc.html`): 2016 yildan; Telegram/Instagram orqali onlayn zakaz;
  25 000+ obunachi.
- **Aloqa** (`Aloqa.dc.html`): manzil (Toshkent, Chilonzor, 3-uy — Yandex'da
  "Shop uz Feruzaxon"), ish vaqti Dushanba–Shanba 10:00–22:00, tel +998911919178,
  admin Feruza, Telegram https://t.me/ShopuzFeruza.

### 10. Admin panel — `Admin.dc.html`
- **Faqat admin qurilmada.** `Admin.dc.html` bir marta ochilганda `suf_admin="1"`
  o'rnatiladi va navdagi gamburgerда "Admin panel" havolasi PAYDO bo'ladi (mijozlar
  ko'rmaydi). Sahifada "Admin rejimidan chiqish" tugmasi belgini o'chiradi.
  Mazmuni keyinchalik to'ldiriladi.

## Interactions & Behavior
- **Til almashtirish**: nav'dagi UZ/RU (bayroq bilan) → `suf_lang` yozadi, `suf-lang`
  event → barcha komponentlar qayta render. Butun matn UZ/RU juftlik bilan berilган
  (logic'da `R = lang==="ru"` sharti).
- **Savatga qo'shish**: ProductCard "Savatga qo'shish" → `suf_cart` yangilanadi,
  tugma vaqtincha "Qo'shildi ✓" bo'ladi, nav sanog'i jonli oshadi.
- **Hero avtomatik**: 10 soniyalik interval, opacity o'tish (yorug'lik animatsiyasi
  OLIB TASHLANGAN — faqat fade). Atir hero rasmi silliq harakatlanadi.
- **Gamburger menyu**: kategoriyalar + Chegirmadagi mahsulotlar + (admin bo'lsa) Admin panel.
- **Auth oqimi**: yuqorida (5-ekran) tavsiflangan.

## State Management
Yuqoridagi "Global holat" jadvaliga qarang. Kerakli holatlar: joriy til, savat massivi,
foydalanuvchi, admin bayrog'i, hero joriy slayd indeksi, katalog tanlangan kategoriya
(URL `?cat=`), Login ko'p bosqichli forma holati (mode/step/phone/code/demo).

## Design Tokens (`chic.css`)
Fayldagi `:root` o'zgaruvchilaridan aynan olingan:
- **Ranglar**: `--bg:#FBF3EC` (issiq krem fon), `--bg-2:#F6EADF`, `--surface:#FFFFFF`,
  `--ink:#2A211C` (matn), `--ink-2:#4E423B`, `--ink-soft:#8A7C73` (muted),
  `--line:#EEE2D7`, `--line-2:#E4D5C7`, `--tile` (rasm plitka foni).
  Aksent (coral): `--accent`/`--coral` oilasi — asosiy CTA va urg'u rangi (coral/qizg'ish).
  Pastel plitka fonlari: `--p-peach`, `--p-pink`, `--p-sage`, `--p-blush`, `--p-lilac`,
  `--p-blue`, `--p-cream`.
- **Tipografiya**: `--serif: "Playfair Display", ...` (sarlavhalar),
  `--sans: "DM Sans", ...` (tana). Google Fonts orqali yuklanadi (chic.css ичida `@import`).
- **Radius**: `--r-sm`, `--r` (asosiy karta radiusi), `--r-lg`.
- **Soya**: `--sh-sm`, `--sh` (yumshoq, issiq tusli).
- **Klasslar**: `.btn` (`.btn-primary` coral to'ldirilган, `.btn-secondary` outline,
  `.btn-ghost`, `.btn-block`), `.tag` (`.tag-new/.tag-hot/.tag-sale`), `.input`, `.field`,
  `.muted`, `.ulink` (chizilган havola), `.chip` (dumaloq ikonka foni).
Aniq qiymatlar uchun **`chic.css`** ni birlamchi manba deb oling.

## Assets
- `assets/` — foydalanuvchi yuklаган mahsulot rasmlari (Layki, Şarmiel, Elivana, Espira,
  Victoria's Secret, Marca Giovanni, atirlar, Daffic va h.k.) va hero/promo rasmlari.
- `image-slot.js` — foydalanuvchi to'ldiradigan bo'sh rasm joylari komponenti. Production'da
  real rasm/CDN bilan almashtiring.
- Ikonalar — inline SVG (Phosphor uslubida), tashqi kutubxonasiz.
- Bayroqlar — nav til almashtirgichida (UZ/RU).

## Files (namunа manbalari)
Sahifalar:
`Home.dc.html`, `Catalog.dc.html`, `Product.dc.html`, `Cart.dc.html`, `Login.dc.html`,
`Profil.dc.html`, `Chegirma.dc.html`, `Olcham.dc.html`, `Yetkazish.dc.html`, `Biz.dc.html`,
`Aloqa.dc.html`, `Admin.dc.html`.
Umumiy komponentlar: `StoreNav.dc.html`, `StoreFooter.dc.html`, `ProductCard.dc.html`.
Uslub: `chic.css` (barcha tokenlar shu yerda).
Runtime: `support.js` (DC runtime — faqat namunani ishlatish uchun; qayta yozmaslik kerak),
`image-slot.js`.

## Tavsiya etilган qayta qurish tartibi
1. Framework tanlang (React+Vite / Next.js). `chic.css` tokenlarini CSS o'zgaruvchisi yoki
   Tailwind theme sifatida ko'chiring.
2. `StoreNav`, `StoreFooter`, `ProductCard` ni komponent qiling.
3. Global store: til, savat, auth, admin.
4. Sahifalarni marshrutlar sifatida qo'shing; katalogда `?cat=` bo'yicha filtr.
5. `image-slot` larni real rasm komponentiga almashtiring; demo SMS'ni real provayderga ulang.
