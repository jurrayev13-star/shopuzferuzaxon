// Shop Uz Feruzaxon — mobile app client
// Shared runtime: language, cart, auth, API client, Telegram Mini App SDK, nav.

const LS = {
  LANG: "suf_lang",
  CART: "suf_cart",
  USER: "suf_user",
  ADMIN: "suf_admin",
  ADMIN_TOKEN: "suf_admin_token",
  RETURN_TO: "suf_return_to",
};

const store = {
  lang() { try { return localStorage.getItem(LS.LANG) || "uz"; } catch { return "uz"; } },
  setLang(v) { try { localStorage.setItem(LS.LANG, v); } catch {} window.dispatchEvent(new CustomEvent("suf-lang", { detail: v })); },
  cart() { try { return JSON.parse(localStorage.getItem(LS.CART) || "[]"); } catch { return []; } },
  setCart(items) { try { localStorage.setItem(LS.CART, JSON.stringify(items)); } catch {} window.dispatchEvent(new CustomEvent("suf-cart")); },
  user() { try { return JSON.parse(localStorage.getItem(LS.USER) || "null"); } catch { return null; } },
  setUser(u) { try { localStorage.setItem(LS.USER, JSON.stringify(u)); } catch {} window.dispatchEvent(new CustomEvent("suf-auth")); },
  clearUser() { try { localStorage.removeItem(LS.USER); localStorage.removeItem(LS.ADMIN); localStorage.removeItem(LS.ADMIN_TOKEN); } catch {} window.dispatchEvent(new CustomEvent("suf-auth")); },
  isAdmin() { try { return localStorage.getItem(LS.ADMIN) === "1"; } catch { return false; } },
  setReturnTo(p) { try { localStorage.setItem(LS.RETURN_TO, p); } catch {} },
  popReturnTo() { try { const v = localStorage.getItem(LS.RETURN_TO); localStorage.removeItem(LS.RETURN_TO); return v; } catch { return null; } },
};

const cart = {
  count() { return store.cart().reduce((s, x) => s + (x.qty || 1), 0); },
  subtotal() { return store.cart().reduce((s, x) => s + (x.price || 0) * (x.qty || 1), 0); },
  add(item) {
    const items = store.cart();
    const key = item.key || `${item.id || "unk"}|${item.size || ""}|${item.color || ""}`;
    const existing = items.find(x => x.key === key);
    if (existing) existing.qty += (item.qty || 1);
    else items.push({ ...item, key, qty: item.qty || 1 });
    store.setCart(items);
    haptics("light");
  },
  setQty(key, qty) {
    const items = store.cart().map(x => x.key === key ? { ...x, qty } : x).filter(x => x.qty > 0);
    store.setCart(items);
  },
  remove(key) { store.setCart(store.cart().filter(x => x.key !== key)); haptics("soft"); },
  clear() { store.setCart([]); },
};

// ---------- i18n ----------
const strings = {
  uz: {
    home: "Bosh sahifa", catalog: "Katalog", cart: "Savat", profile: "Profil",
    login: "Kirish", register: "Ro'yxatdan o'tish", logout: "Chiqish",
    add_to_cart: "Savatga qo'shish", added: "Qo'shildi",
    price: "Narx", size: "O'lcham", color: "Rang",
    checkout: "Rasmiylashtirish", subtotal: "Mahsulotlar", delivery: "Yetkazish",
    total: "Jami", empty_cart: "Savatingiz bo'sh", start_shopping: "Xaridni boshlash",
    all: "Barcha", liboslar: "Liboslar", poyabzal: "Poyabzal", atirlar: "Atirlar",
    choyshab: "Choyshab", ichki: "Ichki kiyim",
    sale: "Chegirmada", featured: "Tanlangan", new_arrivals: "Yangi kelganlar",
    phone: "Telefon raqami", password: "Parol", name: "Ismingiz",
    sms_code: "SMS kod", send_code: "Kodni yuborish", verify: "Tasdiqlash",
    my_orders: "Buyurtmalarim", order: "Buyurtma", status: "Status",
    delivery_fee: "Toshkent yetkazish", som: "so'm",
    search: "Qidirish",
    hero_liboslar_title: "Turkiya liboslari", hero_liboslar_sub: "Nafis, sifatli, tanlangan modellar",
    hero_atirlar_title: "Turkiya atirlari", hero_atirlar_sub: "Lyuks kopiya, uzoq turuvchi",
    hero_poyabzal_title: "Turkiya poyabzallari", hero_poyabzal_sub: "Charm etik va tuflilar",
    shop_now: "Xarid qilish",
    tap_size: "O'lcham tanlang",
    admin_panel: "Admin panel",
    view_more: "Ko'proq",
    contact: "Aloqa", about: "Biz haqimizda", delivery_info: "Yetkazish",
    size_chart: "O'lcham jadvali",
    forgot_pw: "Parolni unutdingizmi?",
    have_account: "Akkauntingiz bormi?",
    no_account: "Akkauntingiz yo'qmi?",
    already_have: "Kirish",
    create_new: "Ro'yxatdan o'tish",
    remove: "O'chirish",
    guest: "Mehmon",
    ordering_as: "Buyurtma:",
    checkout_success: "Buyurtma qabul qilindi! Tez orada bog'lanamiz.",
    checkout_fail: "Buyurtma jo'natilmadi",
    login_first: "Buyurtma berish uchun kirish kerak",
    order_new: "Yangi", order_processing: "Ishlanmoqda", order_shipped: "Jo'natildi", order_done: "Bajarildi", order_cancelled: "Bekor qilindi",
    quantity: "Miqdor",
    description: "Tavsif",
    similar: "O'xshash mahsulotlar",
    all_categories: "Kategoriyalar",
    filter: "Filtr",
    sort: "Saralash",
    no_products: "Mahsulot topilmadi",
    loading: "Yuklanmoqda…",
    new_password: "Yangi parol",
    min_6: "Kamida 6 belgi",
    confirm: "Tasdiqlash",
    cancel: "Bekor",
    back: "Orqaga",
    save: "Saqlash",
    admin_token: "Admin token",
    admin_orders: "Buyurtmalar",
    change_language: "Til: UZ",
  },
  ru: {
    home: "Главная", catalog: "Каталог", cart: "Корзина", profile: "Профиль",
    login: "Войти", register: "Регистрация", logout: "Выйти",
    add_to_cart: "В корзину", added: "Добавлено",
    price: "Цена", size: "Размер", color: "Цвет",
    checkout: "Оформить", subtotal: "Товары", delivery: "Доставка",
    total: "Итого", empty_cart: "Корзина пуста", start_shopping: "К покупкам",
    all: "Все", liboslar: "Платья", poyabzal: "Обувь", atirlar: "Парфюмерия",
    choyshab: "Комплекты белья", ichki: "Нижнее бельё",
    sale: "Со скидкой", featured: "Избранное", new_arrivals: "Новинки",
    phone: "Номер телефона", password: "Пароль", name: "Ваше имя",
    sms_code: "SMS код", send_code: "Отправить код", verify: "Подтвердить",
    my_orders: "Мои заказы", order: "Заказ", status: "Статус",
    delivery_fee: "Доставка (Ташкент)", som: "сум",
    search: "Поиск",
    hero_liboslar_title: "Турецкие платья", hero_liboslar_sub: "Изысканные модели",
    hero_atirlar_title: "Турецкая парфюмерия", hero_atirlar_sub: "Люкс-копии, стойкие",
    hero_poyabzal_title: "Турецкая обувь", hero_poyabzal_sub: "Кожаные ботинки и туфли",
    shop_now: "Купить",
    tap_size: "Выберите размер",
    admin_panel: "Админ-панель",
    view_more: "Ещё",
    contact: "Контакты", about: "О нас", delivery_info: "Доставка",
    size_chart: "Таблица размеров",
    forgot_pw: "Забыли пароль?",
    have_account: "Есть аккаунт?",
    no_account: "Нет аккаунта?",
    already_have: "Войти",
    create_new: "Регистрация",
    remove: "Удалить",
    guest: "Гость",
    ordering_as: "Заказ:",
    checkout_success: "Заказ принят! Скоро свяжемся.",
    checkout_fail: "Не удалось оформить заказ",
    login_first: "Для заказа требуется вход",
    order_new: "Новый", order_processing: "В обработке", order_shipped: "Отправлен", order_done: "Выполнен", order_cancelled: "Отменён",
    quantity: "Кол-во",
    description: "Описание",
    similar: "Похожие товары",
    all_categories: "Категории",
    filter: "Фильтр",
    sort: "Сортировка",
    no_products: "Товары не найдены",
    loading: "Загрузка…",
    new_password: "Новый пароль",
    min_6: "Минимум 6 символов",
    confirm: "Подтвердить",
    cancel: "Отмена",
    back: "Назад",
    save: "Сохранить",
    admin_token: "Токен админа",
    admin_orders: "Заказы",
    change_language: "Язык: RU",
  },
};
function t(key) { return (strings[store.lang()] || strings.uz)[key] || key; }
function pickTitle(p) { return store.lang() === "ru" ? (p.title_ru || p.title_uz) : (p.title_uz || p.title_ru); }
function pickDesc(p) { return store.lang() === "ru" ? (p.description_ru || p.description_uz || "") : (p.description_uz || p.description_ru || ""); }

// ---------- Format ----------
function fmt(n) { return String(n ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, " "); }
function fmtPrice(n) { return fmt(n) + " " + t("som"); }

// ---------- API ----------
async function api(path, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  const isJson = (res.headers.get("content-type") || "").includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;
  return { ok: res.ok, status: res.status, body };
}

const API = {
  products(params = {}) {
    const q = new URLSearchParams(params).toString();
    return api("/api/products" + (q ? "?" + q : ""));
  },
  product(id) { return api("/api/products/" + encodeURIComponent(id)); },
  sendCode(phone) { return api("/api/auth/send-code", { method: "POST", body: JSON.stringify({ phone }) }); },
  register(payload) { return api("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }); },
  login(phone, password) { return api("/api/auth/login", { method: "POST", body: JSON.stringify({ phone, password }) }); },
  createOrder(payload) { return api("/api/orders", { method: "POST", body: JSON.stringify(payload) }); },
  myOrders(phone) { return api("/api/orders/mine?phone=" + encodeURIComponent(phone)); },
  adminOrders(token) { return api("/api/admin/orders", { headers: { "x-admin-token": token } }); },
  adminUpdateOrder(id, status, token) {
    return api("/api/admin/orders/" + id, { method: "PATCH", headers: { "x-admin-token": token }, body: JSON.stringify({ status }) });
  },
};

// ---------- Telegram WebApp SDK ----------
const tg = window.Telegram && window.Telegram.WebApp;
function initTelegram() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    // Apply Telegram theme if provided
    const tp = tg.themeParams || {};
    const root = document.documentElement;
    if (tg.colorScheme === "dark") root.setAttribute("data-theme", "dark");
    else root.setAttribute("data-theme", "light");
    if (tp.bg_color) root.style.setProperty("--bg", tp.bg_color);
    if (tp.text_color) root.style.setProperty("--text", tp.text_color);
    if (tp.button_color) root.style.setProperty("--accent", tp.button_color);
    if (tp.secondary_bg_color) root.style.setProperty("--surface", tp.secondary_bg_color);
    tg.onEvent && tg.onEvent("themeChanged", () => location.reload());
  } catch {}
}
function haptics(kind = "light") {
  try {
    if (tg && tg.HapticFeedback) {
      if (kind === "success") tg.HapticFeedback.notificationOccurred("success");
      else if (kind === "warn") tg.HapticFeedback.notificationOccurred("warning");
      else if (kind === "error") tg.HapticFeedback.notificationOccurred("error");
      else tg.HapticFeedback.impactOccurred(kind === "soft" ? "soft" : kind === "medium" ? "medium" : "light");
    }
  } catch {}
}

// ---------- UI helpers ----------
function el(html) {
  const wrap = document.createElement("div");
  wrap.innerHTML = html.trim();
  return wrap.firstElementChild;
}
function toast(msg) {
  let n = document.querySelector(".toast");
  if (!n) { n = el(`<div class="toast"></div>`); document.body.appendChild(n); }
  n.textContent = msg;
  n.classList.add("on");
  clearTimeout(n._to);
  n._to = setTimeout(() => n.classList.remove("on"), 2200);
}

// ---------- Header + Bottom Nav renderer ----------
function iconHome() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>`;
}
function iconCatalog() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`;
}
function iconCart() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l2.4 12.4a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.5L21 8H6"/><circle cx="10" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/></svg>`;
}
function iconUser() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/></svg>`;
}
function iconSearch() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>`;
}
function iconMenu() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`;
}
function iconBack() {
  return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`;
}

function renderHeader(opts = {}) {
  const { title, back = false } = opts;
  const cartCount = cart.count();
  const badge = cartCount > 0 ? `<span class="badge">${cartCount}</span>` : "";
  const lang = store.lang();
  const otherLang = lang === "uz" ? "RU" : "UZ";
  const backBtn = back
    ? `<button class="h-btn" data-back aria-label="Back">${iconBack()}</button>`
    : `<button class="h-btn" data-menu aria-label="Menu">${iconMenu()}</button>`;
  const html = `
    <header class="app-header">
      ${backBtn}
      <div class="h-title">${title ?? "Shop Uz Feruzaxon"}</div>
      <button class="h-btn" data-lang aria-label="Language">${otherLang}</button>
      <a class="h-btn h-cart" href="cart.html" aria-label="Cart">${iconCart()}${badge}</a>
    </header>
  `;
  const header = el(html);
  header.querySelector("[data-lang]")?.addEventListener("click", () => {
    store.setLang(lang === "uz" ? "ru" : "uz");
    location.reload();
  });
  header.querySelector("[data-back]")?.addEventListener("click", () => history.length > 1 ? history.back() : (location.href = "index.html"));
  header.querySelector("[data-menu]")?.addEventListener("click", () => location.href = "profile.html");
  return header;
}

function renderNav(active) {
  const cartCount = cart.count();
  const cartBadge = cartCount > 0 ? `<span class="n-badge">${cartCount}</span>` : "";
  const html = `
    <nav class="app-nav">
      <a href="index.html" class="${active === "home" ? "active" : ""}">${iconHome()}<span>${t("home")}</span></a>
      <a href="catalog.html" class="${active === "catalog" ? "active" : ""}">${iconCatalog()}<span>${t("catalog")}</span></a>
      <a href="cart.html" class="${active === "cart" ? "active" : ""}">${iconCart()}${cartBadge}<span>${t("cart")}</span></a>
      <a href="profile.html" class="${active === "profile" ? "active" : ""}">${iconUser()}<span>${t("profile")}</span></a>
    </nav>
  `;
  return el(html);
}

function mountChrome(opts = {}) {
  const { active, title, back } = opts;
  document.body.insertBefore(renderHeader({ title, back }), document.body.firstChild);
  document.body.appendChild(renderNav(active));
  // Update cart badges live
  window.addEventListener("suf-cart", () => {
    // Simplest: reload nav badges by replacing them
    document.querySelectorAll(".app-nav a").forEach(a => {
      const badge = a.querySelector(".n-badge");
      if (badge) badge.remove();
    });
    const c = cart.count();
    if (c > 0) {
      const cartA = document.querySelector('.app-nav a[href="cart.html"]');
      cartA?.querySelector("svg")?.insertAdjacentHTML("afterend", `<span class="n-badge">${c}</span>`);
    }
    const headerCartBadge = document.querySelector(".app-header .h-cart .badge");
    if (headerCartBadge) headerCartBadge.remove();
    if (c > 0) {
      const cartLink = document.querySelector(".app-header .h-cart");
      cartLink?.insertAdjacentHTML("beforeend", `<span class="badge">${c}</span>`);
    }
  });
}

// ---------- Card renderer ----------
function productCardHtml(p) {
  const img = (p.images && p.images[0]) || "";
  const title = pickTitle(p);
  const isSale = p.old_price && Number(p.old_price) > Number(p.price);
  const tags = (p.tags || []).slice(0, 2).map(tt => {
    const t = String(tt).toLowerCase();
    const cls = t === "new" ? "b-new" : t === "hot" ? "b-hot" : t === "sale" ? "b-sale" : "b-new";
    return `<span class="badge-tag ${cls}">${tt}</span>`;
  }).join("");
  return `
    <a class="card" href="product.html?id=${encodeURIComponent(p.id)}">
      <div class="card-img">
        ${img ? `<img src="${img}" alt="${title}" loading="lazy">` : ""}
        <div class="badges">${tags}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${title}</div>
        <div class="card-price">
          <span class="now ${isSale ? "sale" : ""}">${fmt(p.price)}</span>
          ${isSale ? `<span class="old">${fmt(p.old_price)}</span>` : ""}
        </div>
      </div>
    </a>
  `;
}
function skeletonCardHtml() {
  return `
    <div class="card">
      <div class="card-img skel"></div>
      <div class="card-body">
        <div class="skel" style="height:14px; width:70%"></div>
        <div class="skel" style="height:14px; width:40%; margin-top:6px"></div>
      </div>
    </div>
  `;
}

// ---------- Sheet (bottom) ----------
function openSheet(html) {
  let backdrop = document.querySelector(".sheet-backdrop");
  let sheet = document.querySelector(".sheet");
  if (!backdrop) { backdrop = el(`<div class="sheet-backdrop"></div>`); document.body.appendChild(backdrop); }
  if (!sheet) { sheet = el(`<div class="sheet"><div class="sheet-grab"></div><div class="sheet-body"></div></div>`); document.body.appendChild(sheet); }
  sheet.querySelector(".sheet-body").innerHTML = html;
  requestAnimationFrame(() => { backdrop.classList.add("on"); sheet.classList.add("on"); });
  const close = () => { backdrop.classList.remove("on"); sheet.classList.remove("on"); };
  backdrop.onclick = close;
  return { sheet, close };
}

// ---------- Public exports ----------
window.SUF = { store, cart, t, pickTitle, pickDesc, fmt, fmtPrice, API, mountChrome, productCardHtml, skeletonCardHtml, toast, openSheet, haptics, tg };

// Initial Telegram init
initTelegram();

// Global: language change → reload badge labels are refreshed by page reload elsewhere,
// but for pages that don't reload, we could re-render. Keep simple: reload.
window.addEventListener("suf-lang", () => { /* pages handle */ });
