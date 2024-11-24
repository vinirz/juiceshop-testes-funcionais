const puppeteer = require('puppeteer-core');
const config = require('./config/puppeteerConfig.js');

let browser, page;

beforeAll(async () => {
  browser = await puppeteer.launch(config.launch);
  page = await browser.newPage();
});

afterAll(async () => {
  await browser.close();
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Teste Funcional - Itens da cesta', () => {
  test('Deve adicionar um produto válido na cesta', async () => {
    await page.goto(`${config.baseUrl}/login`);

    await page.click('.close-dialog');

    await page.type('#email', 'admin@juice-sh.op');
    await page.type('#password', 'admin123');
    await page.click('#loginButton');

    await sleep(1000);

    await page.click('.btn-basket');

    await page.goto(`${config.baseUrl}/basket`);

    await sleep(1000);

    const products = await page.$$('mat-row');

    expect(products.length).toBeGreaterThan(0)
  }, 30000);
});