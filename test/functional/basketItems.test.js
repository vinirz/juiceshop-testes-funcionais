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
  test('Fluxo normal para adicionar itens a cesta', async () => {
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
  
  test('Impedir menos de 1 item na cesta', async () => {
    await page.goto(`${config.baseUrl}/login`);

    await page.type('#email', 'admin@juice-sh.op');
    await page.type('#password', 'admin123');
    await page.click('#loginButton');
    
    await sleep(1000);
    
    await page.goto(`${config.baseUrl}/basket`);
    
    await sleep(1000);
    
    for (let i = 0; i < 5; i++) {
      await page.click('.fa-minus-square');
      await sleep(500);
    }
    
    const quantity = await page.evaluate(() => Number(document.querySelector('mat-cell > span').innerText));

    expect(quantity).toBeGreaterThan(0)
  }, 30000);
  
  test('Impedir mais de 5 itens na cesta', async () => {
    await page.goto(`${config.baseUrl}/login`);

    await page.type('#email', 'admin@juice-sh.op');
    await page.type('#password', 'admin123');
    await page.click('#loginButton');
    
    await sleep(1000);
    
    await page.goto(`${config.baseUrl}/basket`);
    
    await sleep(1000);
    
    for (let i = 0; i < 6; i++) {
      await page.click('.fa-plus-square');
      await sleep(500);
    }
    
    const quantity = await page.evaluate(() => Number(document.querySelector('mat-cell > span').innerText));

    expect(quantity).toBeLessThanOrEqual(5)
  }, 30000);
});