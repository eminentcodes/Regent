import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'file:///C:/Users/Great/AppData/Local/Temp/regent-ui-tools/node_modules/playwright/index.mjs'

const base = (process.env.BASE_URL ?? 'http://localhost:3002').replace(/\/$/, '')
const store = (process.env.STORE_URL ?? 'http://localhost:3003').replace(/\/$/, '')
const browser = await chromium.launch({ headless: true, channel: 'msedge' })
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' })
const errors = [], chatRequests = [], storeApiRequests = [], passed = []
context.on('page', (page) => {
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('response', (response) => { if (response.status() >= 500) errors.push(response.status() + ' ' + response.url()) })
  page.on('request', (request) => {
    const url = new URL(request.url())
    if (url.pathname === '/api/chat') chatRequests.push(request.url())
    if (url.origin === store && url.pathname.startsWith('/api/')) storeApiRequests.push(request.url())
  })
})
const page = await context.newPage()
page.setDefaultTimeout(15000)
function pass(label) { passed.push(label); console.log('PASS', label) }
async function visit(url) {
  const response = await page.goto(url, { waitUntil: 'networkidle' })
  assert.equal(response.status(), 200, url)
}
async function noOverflow(label) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth || document.body.scrollWidth > innerWidth), false, label + ' overflows')
}
async function screenshot(name) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.evaluate(async () => {
    await document.fonts.ready
    const images = [...document.images]
    images.forEach((img) => { img.loading = 'eager' })
    await Promise.all(images.map((img) => img.decode()))
  })
  await noOverflow(name)
  const modalOpen = await page.locator('dialog[open]').count() > 0
  await page.screenshot({ path: 'artifacts/ui/' + name + '.png', fullPage: !modalOpen })
}
try {
  await mkdir('artifacts/ui', { recursive: true })
  await visit(base)
  assert.match(await page.title(), /Walrus Memory/)
  assert.equal(await page.locator('a[href*="/store"]').count(), 0)
  assert.equal(await page.getByRole('navigation').getByRole('link', { name: 'Our store', exact: true }).count(), 0)
  assert.match(await page.locator('.landing-hero').innerText(), /Powered by Walrus Memory/i)
  const hero = await page.locator('.hero-actions a').first().boundingBox()
  assert.ok(hero.y + hero.height <= 1000, 'Hero CTA is above the fold')
  const lines = await page.locator('h1').evaluate((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight))
  assert.ok(lines <= 2.1, 'Hero has at most two headline lines')
  const preview = page.getByRole('region', { name: 'Walrus Memory example' })
  assert.match(await preview.innerText(), /Saved to Walrus Memory/)
  assert.equal(await preview.locator('.preview-memory li').count(), 2)
  await preview.getByRole('button', { name: 'Next visit', exact: true }).click()
  await preview.getByText('Recalled from Walrus Memory', { exact: true }).waitFor()
  assert.match(await preview.locator('.preview-messages').innerText(), /Ofada rice and whole wheat bread/)
  await preview.screenshot({ path: 'artifacts/ui/memory-next-visit.png' })
  await preview.getByRole('button', { name: 'New device', exact: true }).click()
  await preview.getByText('Signed in on your laptop', { exact: true }).waitFor()
  assert.match(await preview.innerText(), /Recalled from Walrus Memory/)
  await preview.screenshot({ path: 'artifacts/ui/memory-new-device.png' })
  await preview.getByRole('button', { name: 'First visit', exact: true }).click()
  await page.locator('summary').filter({ hasText: 'What happens when I forget a memory?' }).click()
  assert.match(await page.locator('details[open]').innerText(), /does not erase the original record/)
  await page.locator('details[open] summary').click()
  await screenshot('landing-desktop')
  pass('Landing navigation and Walrus save, recall, new-device and forgetting example')

  const legacy = await page.request.get(base + '/store?category=staples', { maxRedirects: 0 })
  assert.equal(legacy.status(), 307)
  assert.equal(legacy.headers().location, store + '/?category=staples')
  const login = await page.request.get(store + '/login?next=%2Fchat', { maxRedirects: 0 })
  assert.equal(login.status(), 307)
  assert.equal(login.headers().location, base + '/login?next=%2Fchat')
  for (const route of ['/api/me', '/api/memory', '/api/chat']) {
    assert.equal((await page.request.get(store + route, { maxRedirects: 0 })).status(), 404, route)
  }
  await visit(base + '/store?category=staples#catalogue')
  assert.equal(page.url(), store + '/?category=staples#catalogue')
  assert.equal(await page.getByRole('button', { name: 'Pantry staples', exact: true }).getAttribute('aria-pressed'), 'true')
  pass('Separate origins, legacy filter/fragment redirects and storefront API isolation')

  await visit(store)
  assert.match(await page.title(), /Regency Stores/)
  assert.equal(await page.getByRole('link', { name: 'Regency Stores home', exact: true }).count(), 2)
  assert.equal(await page.locator('a[href^="/chat"]').count(), 0)
  await screenshot('store-desktop')
  await page.getByRole('searchbox', { name: 'Search groceries' }).fill('rice')
  const names = await page.locator('.product-card h3').allTextContents()
  assert.ok(names.length && names.every((name) => /rice/i.test(name)))
  await page.getByLabel('Sort by', { exact: true }).selectOption('price-low')
  const prices = (await page.locator('.product-bottom > strong').allTextContents()).map((text) => Number(text.replace(/[^0-9]/g, '')))
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b))
  await page.getByRole('searchbox', { name: 'Search groceries' }).fill('no-such-grocery-123')
  await page.getByRole('heading', { name: 'No groceries found this time.' }).waitFor()
  const ask = new URL(await page.getByRole('link', { name: 'Ask Reggie', exact: true }).getAttribute('href'))
  assert.equal(ask.origin, base)
  assert.match(ask.searchParams.get('message'), /no-such-grocery-123/)
  await page.getByRole('button', { name: 'Show all groceries', exact: true }).click()
  await page.getByRole('button', { name: 'Fresh produce', exact: true }).click()
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.getByRole('button', { name: 'Fresh produce', exact: true }).getAttribute('aria-pressed'), 'true')
  await page.getByRole('button', { name: /^All groceries/ }).click()
  pass('Store search, price sorting, empty state and category persistence')

  await page.getByRole('button', { name: 'Add Rice, Mama Gold long grain, 5kg to your list', exact: true }).click()
  await page.getByRole('button', { name: 'Add one Rice, Mama Gold long grain, 5kg', exact: true }).click()
  await page.getByRole('button', { name: 'Add Eggs, crate of 30 to your list', exact: true }).click()
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open shopping list, 3 items', exact: true }).click()
  const list = page.getByRole('dialog', { name: 'Your shopping list', exact: true })
  const handoff = list.getByRole('link', { name: 'Chat about this list' })
  const draftUrl = new URL(await handoff.getAttribute('href'))
  const draft = draftUrl.searchParams.get('message')
  assert.equal(draftUrl.origin, base)
  assert.match(draft, /2 x Rice, Mama Gold long grain, 5kg/)
  assert.match(draft, /1 x Eggs, crate of 30/)
  await list.screenshot({ path: 'artifacts/ui/store-shopping-list.png' })
  await handoff.click()
  await page.waitForURL(base + '/chat?**')
  await page.waitForLoadState('networkidle')
  assert.equal(await page.getByRole('textbox', { name: 'Message Reggie' }).inputValue(), draft)
  assert.equal(chatRequests.length, 0, 'Opening a shopping list must not send it')
  const popupPromise = context.waitForEvent('page')
  await page.getByRole('link', { name: 'Our store (opens in a new tab)', exact: true }).click()
  const popup = await popupPromise
  await popup.waitForLoadState('networkidle')
  assert.equal(new URL(popup.url()).origin, store)
  await popup.close()
  assert.equal(await page.getByRole('textbox', { name: 'Message Reggie' }).inputValue(), draft)
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await page.getByText('So I remember this next time, create an account.', { exact: true }).waitFor()
  assert.equal(await page.evaluate(() => sessionStorage.getItem('regent:pending-message')), draft)
  assert.equal(chatRequests.length, 0, 'Guests stay behind the account gate')
  await page.evaluate(() => sessionStorage.removeItem('regent:pending-message'))
  pass('List persistence, external draft handoff, new-tab store link and guest account gate')

  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const url of [base, store]) {
      await visit(url)
      await noOverflow(url + ' at ' + width)
      assert.ok((await page.locator('.site-header-inner').boundingBox()).height <= 80)
    }
  }
  await page.setViewportSize({ width: 390, height: 844 })
  await visit(base)
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  const mobileNav = page.getByRole('navigation', { name: 'Mobile navigation', exact: true })
  assert.equal(await mobileNav.getByRole('link', { name: 'Our store', exact: true }).count(), 0)
  await mobileNav.getByRole('link', { name: 'Walrus Memory', exact: true }).focus()
  await page.keyboard.press('Escape')
  assert.equal(await page.getByRole('button', { name: 'Open menu', exact: true }).evaluate((el) => el === document.activeElement), true)
  await screenshot('landing-mobile')
  await visit(store)
  await page.getByRole('button', { name: 'Open menu', exact: true }).click()
  await page.getByRole('navigation', { name: 'Mobile store navigation', exact: true }).getByRole('link', { name: 'Groceries', exact: true }).click()
  assert.equal(await page.getByRole('button', { name: 'Open menu', exact: true }).getAttribute('aria-expanded'), 'false')
  await screenshot('store-mobile')
  await page.getByRole('button', { name: 'Open shopping list, 3 items', exact: true }).click()
  await page.getByRole('dialog', { name: 'Your shopping list', exact: true }).waitFor()
  await screenshot('store-list-mobile')
  await page.keyboard.press('Escape')
  await visit(base + '/chat')
  await screenshot('chat-mobile')
  pass('Layouts at 320-1440px, mobile navigation, keyboard focus and list sheet')

  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const [url, name] of [[base + '/chat', 'chat'], [base + '/login', 'login'], [base + '/memory', 'memory']]) {
    await visit(url)
    await screenshot(name + '-desktop')
  }
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' })
  for (const [url, name] of [[base, 'landing'], [store, 'store'], [base + '/chat', 'chat']]) {
    await visit(url)
    await screenshot(name + '-dark')
  }
  await visit(base)
  await page.getByRole('button', { name: 'Use light mode', exact: true }).click()
  await page.reload({ waitUntil: 'networkidle' })
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light')
  pass('Light/dark screenshots, reduced motion and saved theme override')
  assert.deepEqual(errors, [], 'Browser or server errors')
  assert.deepEqual(storeApiRequests, [], 'Store must not request account or memory APIs')
  assert.equal(chatRequests.length, 0, 'Examples and browsing must not send messages')
  await writeFile('artifacts/ui/verification.json', JSON.stringify({ passed, errors, base, store }, null, 2) + '\n')
  console.log('PASS All browser checks; screenshots and verification.json saved.')
} catch (error) {
  await page.screenshot({ path: 'artifacts/ui/failed-browser-check.png', fullPage: true })
  throw error
} finally {
  await browser.close()
}
