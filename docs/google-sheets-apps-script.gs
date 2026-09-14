/**
 * Shop Uz Feruzaxon — Google Sheets webhook.
 *
 * O'rnatish:
 *   1. Google Sheet'ni oching (siz bergan sheet: 1zTrGuxqkvn9EZVgDgDYUjkfW2S4UgF8Zs4IfdTdWX7s).
 *   2. Menyu: Extensions → Apps Script.
 *   3. Ochilgan tahrirlagichda default kodni O'CHIRIB, shu faylning butun mazmunini
 *      copy-paste qiling. Yuqorida "Untitled project" nomini "shopuz-orders" ga o'zgartiring.
 *   4. Yuqorida ▶ Run tugmasi orqali doPost'ni tanlab, "Run" ni bir marta bosing.
 *      Ruxsat so'raladi: "Review permissions" → o'z Google akkauntingiz → "Advanced"
 *      → "Go to shopuz-orders (unsafe)" → "Allow". Bu shu Sheet ni yozishga ruxsat beradi.
 *      (Sinovda "Missing data" xatosi bo'ladi — bu normal.)
 *   5. Yuqoridagi "Deploy" → "New deployment" → shesterna (⚙︎) → "Web app" tanlang:
 *        - Description: shopuz orders webhook
 *        - Execute as: Me (o'zingiz)
 *        - Who has access: Anyone
 *      "Deploy" ni bosing.
 *   6. Chiqqan Web app URL ni copy qiling — u shu shaklda bo'ladi:
 *        https://script.google.com/macros/s/AKfycb.../exec
 *      URL'ni menga (Claude Code'ga) yozing — men Railway env'ga saqlab, integrastiyani yoqaman.
 *
 * Ishlashi:
 *   - Har buyurtmada backend shu URL'ga POST JSON yuboradi.
 *   - Script sheet'ga yangi qator qo'shadi. Agar birinchi qator bo'sh bo'lsa, header
 *     avtomatik yoziladi.
 */

const SHEET_NAME = "Buyurtmalar"; // agar boshqa tab kerak bo'lsa nomini shu yerga yozing

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) sh = ss.insertSheet(SHEET_NAME);

    const headers = [
      "ID", "Sana", "Ism", "Telefon", "Shahar", "Manzil",
      "Status", "Mahsulotlar summa", "Yetkazish", "Jami",
      "Mahsulotlar (qisqa)", "Mahsulotlar (JSON)", "Izoh"
    ];
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f4f4f4");
    }

    const row = [
      data.id || "",
      data.created_at ? new Date(data.created_at) : new Date(),
      data.customer_name || "",
      data.customer_phone || "",
      data.city || "",
      data.address || "",
      data.status || "new",
      Number(data.subtotal) || 0,
      Number(data.delivery_fee) || 0,
      Number(data.total) || 0,
      data.items_summary || "",
      data.items_json || "",
      data.note || "",
    ];
    sh.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, id: data.id }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, msg: "shopuz-orders webhook alive" }))
    .setMimeType(ContentService.MimeType.JSON);
}
