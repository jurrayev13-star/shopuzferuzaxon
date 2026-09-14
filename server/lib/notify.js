// Order notification hub: Telegram (admin + group) va Google Sheets.
// Har bir integratsiya alohida ishga tushadi; bittasi yiqilsa ham boshqasi ishlaydi.

const TG_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TG_ADMIN = process.env.TELEGRAM_ADMIN_CHAT_ID || ""; // shaxsiy admin (yakka)
const TG_GROUP = process.env.TELEGRAM_GROUP_CHAT_ID || ""; // sotuv guruhi
const SHEETS_URL = process.env.SHEETS_WEBHOOK_URL || "";   // Apps Script Web App URL

function fmtSom(n) {
  return String(n ?? 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function tgEscape(s) {
  // Telegram MarkdownV2 uchun maxsus belgilarni escape qilish
  return String(s ?? "").replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, "\\$1");
}

function orderText(order) {
  const items = (order.items || [])
    .map((it, i) => {
      const size = it.size ? ` (${it.size})` : "";
      const line = `${i + 1}. ${it.title}${size} × ${it.qty} = ${fmtSom(it.price * it.qty)} so'm`;
      return tgEscape(line);
    })
    .join("\n");
  const parts = [
    `🆕 *Yangi buyurtma \\#${order.id}*`,
    "",
    `👤 ${tgEscape(order.customer_name || "-")}`,
    `📞 [${tgEscape(order.customer_phone || "-")}](tel:${encodeURIComponent(order.customer_phone || "")})`,
    order.city ? `🏙 ${tgEscape(order.city)}` : "",
    order.address ? `📍 ${tgEscape(order.address)}` : "",
    "",
    "*Mahsulotlar:*",
    items,
    "",
    `Mahsulotlar: ${tgEscape(fmtSom(order.subtotal))} so'm`,
    `Yetkazish: ${tgEscape(fmtSom(order.delivery_fee))} so'm`,
    `*Jami:* ${tgEscape(fmtSom(order.total))} so'm`,
  ].filter(Boolean);
  return parts.join("\n");
}

async function tgSend(chatId, text) {
  if (!TG_TOKEN || !chatId) return { skipped: true };
  try {
    const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      console.warn("[tg] send failed:", chatId, data);
      return { ok: false, error: data?.description || res.status };
    }
    return { ok: true };
  } catch (e) {
    console.warn("[tg] error:", e.message);
    return { ok: false, error: e.message };
  }
}

async function sheetsSend(order) {
  if (!SHEETS_URL) return { skipped: true };
  try {
    const payload = {
      id: order.id,
      created_at: order.created_at || new Date().toISOString(),
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      city: order.city || "",
      address: order.address || "",
      status: order.status || "new",
      subtotal: order.subtotal,
      delivery_fee: order.delivery_fee,
      total: order.total,
      items_summary: (order.items || [])
        .map((it) => `${it.title}${it.size ? " (" + it.size + ")" : ""} × ${it.qty}`)
        .join(" | "),
      items_json: JSON.stringify(order.items || []),
      note: order.note || "",
    };
    const res = await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("[sheets] http", res.status, text.slice(0, 200));
      return { ok: false, error: `http_${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    console.warn("[sheets] error:", e.message);
    return { ok: false, error: e.message };
  }
}

export async function notifyOrder(order) {
  const text = orderText(order);
  const results = await Promise.allSettled([
    TG_ADMIN ? tgSend(TG_ADMIN, text) : Promise.resolve({ skipped: "admin" }),
    TG_GROUP ? tgSend(TG_GROUP, text) : Promise.resolve({ skipped: "group" }),
    sheetsSend(order),
  ]);
  return {
    admin: results[0].status === "fulfilled" ? results[0].value : { ok: false, error: results[0].reason?.message },
    group: results[1].status === "fulfilled" ? results[1].value : { ok: false, error: results[1].reason?.message },
    sheets: results[2].status === "fulfilled" ? results[2].value : { ok: false, error: results[2].reason?.message },
  };
}

// Yordamchi: getUpdates orqali chat_id ni topish (dashboard yordamchisi)
export async function tgFetchUpdates() {
  if (!TG_TOKEN) return { error: "no_token" };
  const res = await fetch(`https://api.telegram.org/bot${TG_TOKEN}/getUpdates`);
  const j = await res.json();
  return j;
}

export const config = {
  hasToken: !!TG_TOKEN,
  hasAdmin: !!TG_ADMIN,
  hasGroup: !!TG_GROUP,
  hasSheets: !!SHEETS_URL,
};
