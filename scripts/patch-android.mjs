// `cap add android` dan keyin Play Store uchun kerakli sozlamalarni qo'llaydi.
// Ishlatish: node scripts/patch-android.mjs   (loyiha ildizidan)
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const androidDir = path.join(root, 'android');
const appDir = path.join(androidDir, 'app');
if (!fs.existsSync(appDir)) throw new Error('android/ papkasi yo\'q. Avval: npx cap add android');

// 1) Play Console versiya talablariga mos qiymatlar
const vc = process.env.VERSION_CODE || '1';
const vn = process.env.VERSION_NAME || '1.0.0';
if (!/^[1-9]\d{0,9}$/.test(vc) || Number(vc) > 2_100_000_000) {
  throw new Error('VERSION_CODE 1 dan 2100000000 gacha butun son bo\'lishi kerak.');
}
if (!/^[A-Za-z0-9][A-Za-z0-9.+_-]{0,49}$/.test(vn)) {
  throw new Error('VERSION_NAME 1-50 ta harf, raqam, nuqta, +, _ yoki - dan iborat bo\'lishi kerak.');
}

// 2) Ikonalar va splash ni ko'chirish
const src = path.join(root, 'android-overrides', 'res');
const dst = path.join(appDir, 'src', 'main', 'res');
// Standart Capacitor splash/ikonalarini tozalaymiz (yarim-eski fayllar qolmasin)
for (const d of fs.readdirSync(dst)) {
  if (/^(drawable.*|mipmap.*)$/.test(d)) fs.rmSync(path.join(dst, d), { recursive: true, force: true });
}
fs.cpSync(src, dst, { recursive: true });

const gradlePath = path.join(appDir, 'build.gradle');
let g = fs.readFileSync(gradlePath, 'utf8');
g = g.replace(/versionCode\s+\d+/, `versionCode ${vc}`).replace(/versionName\s+"[^"]*"/, `versionName "${vn}"`);

// 3) Release imzolash (upload key) - keystore.properties orqali
if (!g.includes('keystore.properties')) {
  g = g.replace(/android\s*\{/, `def keystorePropsFile = rootProject.file("keystore.properties")
def keystoreProps = new Properties()
if (keystorePropsFile.exists()) { keystoreProps.load(new FileInputStream(keystorePropsFile)) }

android {`);
  g = g.replace(/buildTypes\s*\{/, `signingConfigs {
        release {
            if (keystorePropsFile.exists()) {
                storeFile file(keystoreProps['storeFile'])
                storePassword keystoreProps['storePassword']
                keyAlias keystoreProps['keyAlias']
                keyPassword keystoreProps['keyPassword']
            }
        }
    }
    buildTypes {`);
  g = g.replace(/(buildTypes\s*\{\s*release\s*\{)/, `$1
            signingConfig signingConfigs.release`);
}
fs.writeFileSync(gradlePath, g);

// 4) Manifest: zaxira nusxa (allowBackup) o'chiriladi - vault ma'lumotlari bulutga ketmasin
const mfPath = path.join(appDir, 'src', 'main', 'AndroidManifest.xml');
let m = fs.readFileSync(mfPath, 'utf8');
m = m.replace(/android:allowBackup="true"/, 'android:allowBackup="false"');
fs.writeFileSync(mfPath, m);

// 5) targetSdk / compileSdk = 36 (Play talabi, 2026-08-31 dan)
const varsPath = path.join(androidDir, 'variables.gradle');
if (fs.existsSync(varsPath)) {
  let v = fs.readFileSync(varsPath, 'utf8');
  v = v.replace(/compileSdkVersion\s*=\s*\d+/, 'compileSdkVersion = 36').replace(/targetSdkVersion\s*=\s*\d+/, 'targetSdkVersion = 36');
  fs.writeFileSync(varsPath, v);
}
console.log(`OK: versionCode=${vc}, versionName=${vn}`);
