import { chromium } from 'file:///C:/Users/Great/AppData/Local/Temp/regent-ui-tools/node_modules/playwright/index.mjs';
const browser = await chromium.launch({headless:true,channel:"msedge"});
const page = await browser.newPage({viewport:{width:1440,height:900},colorScheme:'light'});
page.on('pageerror',e=>console.log('PAGE_ERROR',e.message));
await page.goto('http://localhost:3002',{waitUntil:'networkidle'});
await page.screenshot({path:'artifacts/ui/chat-desktop.png',fullPage:true});
console.log('TITLE',await page.title());
console.log('BODY', (await page.locator('body').innerText()).slice(0,1800));
await page.setViewportSize({width:390,height:844});
await page.screenshot({path:'artifacts/ui/chat-mobile.png',fullPage:true});
await browser.close();

