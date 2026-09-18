// Image compression script for Pool Supply Wholesalers
// Compresses: favicon.png, logo.png, about-hero.png
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "../public");

async function compress() {
  console.log("🖼️  Starting image compression...\n");

  const before = {};
  const after = {};

  // ─── 1. favicon.png → resize to 512x512 PNG (must stay PNG for browser compat)
  const faviconIn = path.join(publicDir, "favicon.png");
  const faviconOut = path.join(publicDir, "favicon.png");
  before.favicon = fs.statSync(faviconIn).size;

  // Read original, get metadata to understand what we're working with
  const faviconMeta = await sharp(faviconIn).metadata();
  console.log(`📐 favicon.png — original: ${faviconMeta.width}x${faviconMeta.height}, ${(before.favicon / 1024).toFixed(0)}KB`);

  // Compress favicon: keep at 512x512 for PWA but apply PNG compression
  const faviconBuf = await sharp(faviconIn)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, quality: 85, palette: false })
    .toBuffer();

  // Also create a 32x32 favicon.ico equivalent as a tiny PNG
  const favicon32Buf = await sharp(faviconIn)
    .resize(32, 32, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  // Write optimized favicon (overwrite in place)
  fs.writeFileSync(faviconOut, faviconBuf);

  // Also write a tiny favicon-32.png for the <link rel="icon"> tag
  fs.writeFileSync(path.join(publicDir, "favicon-32.png"), favicon32Buf);

  after.favicon = fs.statSync(faviconOut).size;
  console.log(`✅ favicon.png compressed: ${(before.favicon / 1024).toFixed(0)}KB → ${(after.favicon / 1024).toFixed(0)}KB (${Math.round((1 - after.favicon / before.favicon) * 100)}% reduction)`);
  console.log(`✅ favicon-32.png created: ${(favicon32Buf.length / 1024).toFixed(1)}KB (browser icon)\n`);

  // ─── 2. logo.png → compress and save as logo.webp
  const logoIn = path.join(publicDir, "logo.png");
  const logoWebpOut = path.join(publicDir, "logo.webp");
  before.logo = fs.statSync(logoIn).size;

  const logoMeta = await sharp(logoIn).metadata();
  console.log(`📐 logo.png — original: ${logoMeta.width}x${logoMeta.height}, ${(before.logo / 1024).toFixed(0)}KB`);

  // Convert logo to WebP with quality 90 (excellent quality for logos)
  await sharp(logoIn)
    .webp({ quality: 90, lossless: false })
    .toFile(logoWebpOut);

  // Also create compressed PNG version of logo
  const logoPngBuf = await sharp(logoIn)
    .png({ compressionLevel: 9, quality: 85 })
    .toBuffer();
  fs.writeFileSync(logoIn, logoPngBuf);

  after.logo = fs.statSync(logoWebpOut).size;
  const afterLogoPng = fs.statSync(logoIn).size;
  console.log(`✅ logo.webp created: ${(before.logo / 1024).toFixed(0)}KB → ${(after.logo / 1024).toFixed(0)}KB (${Math.round((1 - after.logo / before.logo) * 100)}% reduction)`);
  console.log(`✅ logo.png compressed: ${(before.logo / 1024).toFixed(0)}KB → ${(afterLogoPng / 1024).toFixed(0)}KB\n`);

  // ─── 3. about-hero.png → convert to WebP (for OG image + main hero)
  const heroIn = path.join(publicDir, "about-hero.png");
  const heroWebpOut = path.join(publicDir, "about-hero.webp");
  before.hero = fs.statSync(heroIn).size;

  const heroMeta = await sharp(heroIn).metadata();
  console.log(`📐 about-hero.png — original: ${heroMeta.width}x${heroMeta.height}, ${(before.hero / 1024).toFixed(0)}KB`);

  // Convert hero to WebP at 1200x630 (OG image standard) with quality 85
  await sharp(heroIn)
    .resize(1200, 630, { fit: "cover", position: "center" })
    .webp({ quality: 85, effort: 6 })
    .toFile(heroWebpOut);

  // Also compress the original PNG (OG tags still reference .png)
  const heroPngBuf = await sharp(heroIn)
    .resize(1200, 630, { fit: "cover", position: "center" })
    .png({ compressionLevel: 9, quality: 85 })
    .toBuffer();
  fs.writeFileSync(heroIn, heroPngBuf);

  after.hero = fs.statSync(heroWebpOut).size;
  const afterHeroPng = fs.statSync(heroIn).size;
  console.log(`✅ about-hero.webp created: ${(before.hero / 1024).toFixed(0)}KB → ${(after.hero / 1024).toFixed(0)}KB (${Math.round((1 - after.hero / before.hero) * 100)}% reduction)`);
  console.log(`✅ about-hero.png compressed: ${(before.hero / 1024).toFixed(0)}KB → ${(afterHeroPng / 1024).toFixed(0)}KB\n`);

  // ─── Summary
  const totalBefore = before.favicon + before.logo + before.hero;
  const totalAfter = after.favicon + after.logo + after.hero + favicon32Buf.length;
  console.log("═══════════════════════════════════════");
  console.log(`📊 TOTAL PUBLIC SAVINGS: ${(totalBefore / 1024 / 1024).toFixed(2)}MB → ${(totalAfter / 1024).toFixed(0)}KB`);
  console.log(`🚀 Public page weight reduction: ${Math.round((1 - totalAfter / totalBefore) * 100)}%`);
  console.log("═══════════════════════════════════════\n");

  // ─── 4. src/assets/logo.png
  const srcAssetsDir = path.join(__dirname, "../src/assets");
  const srcLogoIn = path.join(srcAssetsDir, "logo.png");
  if (fs.existsSync(srcLogoIn)) {
    const bSrcLogo = fs.statSync(srcLogoIn).size;
    const srcLogoBuf = await sharp(srcLogoIn)
      .resize({ width: 800 }) // Resize down if it's 1.5MB
      .png({ compressionLevel: 9, quality: 85 })
      .toBuffer();
    fs.writeFileSync(srcLogoIn, srcLogoBuf);
    const aSrcLogo = fs.statSync(srcLogoIn).size;
    console.log(`✅ src/assets/logo.png compressed: ${(bSrcLogo / 1024).toFixed(0)}KB → ${(aSrcLogo / 1024).toFixed(0)}KB`);
  }

  // ─── 5. src/assets/commingsoon.png
  const srcComingSoon = path.join(srcAssetsDir, "commingsoon.png");
  if (fs.existsSync(srcComingSoon)) {
    const bCS = fs.statSync(srcComingSoon).size;
    const csBuf = await sharp(srcComingSoon)
      .resize({ width: 600 })
      .png({ compressionLevel: 9, quality: 85 })
      .toBuffer();
    fs.writeFileSync(srcComingSoon, csBuf);
    const aCS = fs.statSync(srcComingSoon).size;
    console.log(`✅ src/assets/commingsoon.png compressed: ${(bCS / 1024).toFixed(0)}KB → ${(aCS / 1024).toFixed(0)}KB`);
  }

  console.log("\n✅ All images compressed. Deploy to see Core Web Vitals improvement.");
}

compress().catch(console.error);
