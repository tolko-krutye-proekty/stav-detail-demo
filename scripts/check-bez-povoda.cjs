const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const demoDir = path.join(root, 'portfolio', 'bez-povoda');
const url = pathToFileURL(path.join(demoDir, 'index.html')).href;
const names = ['Тёплый день', 'Тихий разговор', 'Без слов'];

async function run() {
  const browser = await chromium.launch({
    executablePath: process.env.DEMO_BROWSER_PATH || undefined,
    headless: true,
    args: ['--disable-gpu'],
  });
  try {
    for (const width of [320, 390, 700, 768, 1100, 1101, 1440, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
      const errors = [];
      const requests = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => requests.push(request.url()));
      await page.goto(url);
      assert.equal(await page.locator('.bouquet-panel:visible').count(), 1);
      for (let i = 0; i < names.length; i++) {
        await page.getByRole('tab').nth(i).click();
        const panel = page.getByRole('tabpanel');
        assert.equal(await panel.locator('h2').innerText().then(s => s.replace(/\s+/g, ' ').trim()), names[i]);
        const measure = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          content: document.documentElement.scrollWidth,
          imagesReady: [...document.images].filter(img => img.getAttribute('src')).every(img => img.complete && img.naturalWidth > 0),
        }));
        assert.equal(measure.content, measure.viewport, 'Horizontal overflow at ' + width);
        assert.equal(measure.imagesReady, true, 'Broken image');
        assert.equal(await panel.locator('.bouquet-photo img').evaluate(img => getComputedStyle(img).borderRadius), '0px', 'Bouquet photos must have square corners');
        assert.equal(await panel.locator('.bouquet-photo img').evaluate(img => getComputedStyle(img).objectFit), 'contain', 'The entire cutout bouquet must remain visible');
        assert.equal(await panel.locator('.bouquet-tag').evaluate(el => getComputedStyle(el).borderRadius), '0px', 'Bouquet tags must have square corners');
        assert.equal(
          await page.getByRole('tab').nth(i).locator('.mood-dot').evaluate(el => getComputedStyle(el).backgroundColor),
          await panel.locator('.bouquet-tag').evaluate(el => getComputedStyle(el).backgroundColor),
          'Each mood selector must match its bouquet tag color at ' + width + 'px: ' + names[i],
        );
        await panel.locator('[data-view]').click();
        assert.equal(await page.getByRole('dialog').isVisible(), true);
        assert.equal(await page.locator('#viewer-title').innerText(), names[i]);
        assert.equal(await page.locator('#viewer-photo').getAttribute('src'), await panel.locator('.bouquet-photo img').evaluate(img => img.currentSrc || img.src));
        await page.keyboard.press('Escape');
        assert.equal(await page.getByRole('dialog').isVisible(), false);
        assert.equal(await panel.locator('[data-view]').evaluate(el => el === document.activeElement), true);
        await panel.locator('[data-view]').click();
        await page.locator('[data-close-viewer]').click();
        assert.equal(await page.getByRole('dialog').isVisible(), false);
        assert.equal(await page.locator('body').evaluate(el => el.classList.contains('viewer-open')), false);
        await panel.locator('.choose-button').click();
        assert.equal(await page.locator('#bouquet-choice').inputValue(), names[i]);
        assert.equal(await page.locator('#chosen-photo').getAttribute('src'), await panel.locator('.bouquet-photo img').getAttribute('src'));
        assert.equal(await page.locator('#chosen-name').innerText(), names[i]);
        assert.equal(await page.locator('#guest-name').evaluate(el => el === document.activeElement), true);
      }
      await page.locator('#guest-name').fill('   ');
      await page.getByRole('button', { name: 'Посмотреть заявку' }).click();
      assert.equal(await page.locator('#guest-name').getAttribute('aria-invalid'), 'true');
      await page.locator('#guest-name').fill('Тест');
      await page.locator('#guest-message').fill('<b>Больше жёлтого</b>');
      const requestsBeforeSubmit = requests.length;
      await page.getByRole('button', { name: 'Посмотреть заявку' }).click();
      assert.match(await page.locator('#form-feedback').innerText(), /Заявка не отправлена/);
      assert.match(await page.locator('#form-feedback').innerText(), /<b>Больше жёлтого<\/b>/);
      assert.equal(await page.locator('#form-feedback b').count(), 0, 'User input must be text, not HTML');
      assert.equal(requests.length, requestsBeforeSubmit, 'Demo must not send form requests');
      assert.equal(requests.some(requestUrl => /^https?:/.test(requestUrl)), false, 'No remote dependencies');
      await page.locator('[data-own-idea]').click();
      assert.equal(await page.locator('#chosen-name').innerText(), 'Ваша идея');
      await page.locator('#bouquet-choice').selectOption('Тихий разговор');
      assert.match(await page.locator('#chosen-photo').getAttribute('src'), /bouquet-light/);
      const firstTab = page.getByRole('tab').first();
      await firstTab.focus();
      await firstTab.press('Home');
      await firstTab.press('ArrowRight');
      assert.equal(await page.getByRole('tab').nth(1).getAttribute('aria-selected'), 'true');
      await page.getByRole('tab').nth(1).press('End');
      assert.equal(await page.getByRole('tab').nth(2).getAttribute('aria-selected'), 'true');
      await page.getByRole('tab').nth(2).press('Home');
      assert.equal(await firstTab.getAttribute('aria-selected'), 'true');
      assert.deepEqual(errors, []);
      if (width === 390 || width === 1440) {
        await page.goto(url);
        await page.screenshot({ path: path.join(demoDir, width === 390 ? 'preview-mobile.png' : 'preview-desktop.png'), fullPage: true });
      }
      console.log('PASS ' + width + 'px: tabs, keyboard, viewer, selection, validation, safe preview, no network');
      await page.close();
    }
    const noJs = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
    await noJs.goto(url);
    assert.equal(await noJs.locator('.bouquet-panel:visible').count(), 3);
    assert.equal(await noJs.locator('#guest-name').isDisabled(), true);
    assert.equal(await noJs.getByRole('button', { name: 'Посмотреть заявку' }).isDisabled(), true);
    await noJs.close();
    const deepLink = await browser.newPage({ reducedMotion: 'reduce' });
    await deepLink.goto(url + '#bouquet-calm');
    assert.equal(await deepLink.getByRole('tab').nth(1).getAttribute('aria-selected'), 'true');
    assert.equal(await deepLink.locator('.bouquet-photo').nth(1).evaluate(el => getComputedStyle(el).animationName), 'none');
    await deepLink.close();
    console.log('PASS JavaScript-off fallback, direct bouquet link, reduced motion');
  } finally {
    await browser.close();
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
