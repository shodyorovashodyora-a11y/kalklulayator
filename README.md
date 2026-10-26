# Vault Calculator — Play Market uchun loyiha

APK (`app-debug.apk`) dan tiklangan Capacitor loyihasi. Veb-kod: `www/index.html` (brauzerda to'g'ridan-to'g'ri ochiladi — bu "veb forma"/ilovaning o'zi).
## AAB olish (eng oson yo'l — kompyuterga hech narsa o'rnatmasdan)
1. Bu papkani GitHub'da yangi (private) repoga yuklang.
2. Upload keystore yarating (bir marta, faylni yo'qotmang!):
   `keytool -genkeypair -v -keystore upload-keystore.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000`
   Base64: `base64 -w0 upload-keystore.jks`
3. Repo → Settings → Secrets → Actions: `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS` (upload), `KEY_PASSWORD`.
4. Actions → "Build signed AAB" → Run workflow. Har yangi versiyada `version_code` ni oldingisidan kattaroq kiriting, `version_name` ni esa ilova versiyasiga moslang. Tugagach `vault-calculator-aab` artifaktidan `app-release.aab` ni yuklab oling.
5. Play Console’da ilovani ro'yxatdan o'tkazing, AAB’ni avval internal/closed testing kanaliga yuklang, listing va Data safety ma'lumotlarini to'ldiring. Maxfiylik siyosatini internetga ochiq URL’da joylab, aynan shu URL’ni Play Console’da kiriting.

## Mahalliy (Node 22 + JDK 21 + Android SDK 36)
```
npm ci
npx cap add android
# android/keystore.properties yarating: storeFile, storePassword, keyAlias, keyPassword
npm run android:aab
```
Natija: `android/app/build/outputs/bundle/release/app-release.aab`
`VERSION_CODE` va `VERSION_NAME` muhit o'zgaruvchilari bilan lokal build versiyasini belgilang; qiymatlar GitHub Actions workflow’idagi kabi tekshiriladi.

## Play talablariga nima qilindi
- Release AAB, imzolangan (Play App Signing bilan); debuggable emas, DUMP ruxsati yo'q
- targetSdk/compileSdk 36 (2026-08-31 dan yangi ilovalar uchun majburiy), minSdk 24
- allowBackup o'chirildi; ikona "SELECTED" yozuvisiz qayta tayyorlandi; splash tozalandi
- Maxfiylik siyosati (`store/privacy-policy.html`) — uni internetga joylang (GitHub Pages) va havolasini Play Console'ga kiriting
- Skrinshotlar, 512 ikona, 1024×500 grafika — `store/`

## Muhim ogohlantirishlar
- **Package nomi** `com.kalkuklator.app` (APK dagi). Birinchi yuklashdan keyin o'zgartirib bo'lmaydi. Boshqa nom kerak bo'lsa, `capacitor.config.json` dagi appId ni hozir o'zgartiring.
- Ilovadagi "ilova yashirish" aslida hech narsani yashirmaydi (faqat nomlar ro'yxati) — shuning uchun matnlar "Ro'yxatga qo'shish" ga o'zgartirildi. Do'kon tavsifida "ilovalarni yashiradi / shifrlaydi" demang — Play "Misleading claims" siyosatiga zid.
- Parol va fayllar shifrlanmagan (localStorage/IndexedDB). Haqiqiy xavfsizlik kerak bo'lsa, alohida ish.
- Yangi shaxsiy dev-akkauntlar production'dan oldin kamida 12 tester bilan 14 kun yopiq test o'tkazishi shart.
- Har yangi yuklashda `version_code` ni oshiring.
