import { mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require(
  "C:/Users/Mohammed.Zeliche/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core"
);

const root = process.cwd();
const outputDir = join(root, ".artifacts");

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });

const routes = [
  { slug: "landing", url: "http://127.0.0.1:3000/" },
  { slug: "dashboard", url: "http://127.0.0.1:3000/dashboard" },
  { slug: "upload", url: "http://127.0.0.1:3000/upload" },
  { slug: "chat", url: "http://127.0.0.1:3000/chat" }
];

for (const route of routes) {
  await page.goto(route.url, { waitUntil: "networkidle" });
  await page.screenshot({
    path: join(outputDir, `${route.slug}.png`),
    fullPage: true
  });
  const title = await page.title();
  const text = await page.locator("body").innerText();
  console.log(`## ${route.slug}`);
  console.log(title);
  console.log(text.slice(0, 240).replace(/\s+/g, " "));
}

await browser.close();
