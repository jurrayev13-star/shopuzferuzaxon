# Shop Uz Feruzaxon — Android APK

`https://shopuzferuzaxon-production.up.railway.app` saytini WebView bilan o'rab olib, Android ilova sifatida ochilishini ta'minlaydi.

## APK'ni olish

**Avtomatik (GitHub Actions):** har `git push` da `.github/workflows/build-apk.yml` ishga tushadi:
1. GitHub repo → **Actions** tab → oxirgi "Build Android APK" runni oching
2. Pastda **Artifacts → ShopUzFeruzaxon-debug-apk** ni yuklab oling
3. ZIP ichida `ShopUzFeruzaxon-debug.apk` fayli

**Qo'lda GH'da ishga tushirish:** Actions tab → "Build Android APK" workflow → **Run workflow** tugmasi.

## Telefonga o'rnatish

1. APK'ni telefonga o'tkazing (Telegram, USB, Google Drive)
2. Fayl menejeri orqali APK'ni oching
3. Android **"Notanish manbadan"** (Install from unknown sources) ruxsatini so'raydi — beriladi
4. **Install** bosing → home screen'da yashil ikonka paydo bo'ladi
5. Ochilganda mustaqil ilova sifatida ko'rinadi (brauzer paneli yo'q)

## APK haqida

- **Paket:** `uz.shopferuzaxon.app`
- **Nom:** Shop Uz Feruzaxon
- **Min SDK:** 24 (Android 7.0+)
- **Target SDK:** 34
- **Orientation:** portrait
- **Package type:** debug signed (Play Store'ga chiqmaydi, faqat o'zingiz o'rnatasiz)

## Sayt URL'ini o'zgartirish

`app/src/main/java/uz/shopferuzaxon/app/MainActivity.kt` — `SITE_URL` doimiy o'zgartuvchisini yangi URL bilan almashtirib, GitHub'ga push qiling.

## Play Store uchun (kelajakda)

Debug APK Play Store'ga chiqmaydi — release signing kerak:
1. `keytool -genkey -v -keystore release.keystore -alias shopuz -keyalg RSA -keysize 2048 -validity 10000`
2. `app/build.gradle.kts` ga `signingConfigs` qo'shish
3. `assembleRelease` yoki `bundleRelease` (AAB)
4. Google Play Console → App submit ($25 bir marta)
