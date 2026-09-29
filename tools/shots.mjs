// 每個作品截四張：桌機首屏、往下一頁、再往下一頁、手機版。存成 png 給 make_projects.py 裁切
import { chromium } from '/home/ct/.nvm/versions/node/v22.17.1/lib/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const list = JSON.parse(fs.readFileSync(new URL('./projects.json', import.meta.url)));
const out = process.argv[2]; fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
for (const p of list) {
  const d = await b.newPage({ viewport: { width: 1280, height: 640 } });
  try { await d.goto(p.url, { waitUntil: 'networkidle', timeout: 45000 }); } catch (e) { console.log('slow', p.id); }
  await d.waitForTimeout(4000);
  for (const [k, y] of [['A', 0], ['B', 640], ['C', 1280]]) {
    await d.evaluate(y => window.scrollTo(0, y), y); await d.waitForTimeout(1200);
    await d.screenshot({ path: out + '/' + p.id + k + '.png' });
  }
  await d.close();
  const m = await b.newPage({ viewport: { width: 390, height: 780 }, isMobile: true, deviceScaleFactor: 2 });
  try { await m.goto(p.url, { waitUntil: 'networkidle', timeout: 45000 }); } catch (e) {}
  await m.waitForTimeout(4000); await m.screenshot({ path: out + '/' + p.id + 'D.png' }); await m.close();
  console.log('ok', p.id);
}
await b.close();
