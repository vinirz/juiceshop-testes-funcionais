const puppeteer = require('puppeteer-core');
const config = require('./config/puppeteerConfig.js');

describe('Testes funcionais de atualização de reviews', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch(config.launch);
    page = await browser.newPage();
    await page.goto('http://localhost:3000'); 
  });

  afterAll(async () => {
    await browser.close();
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  

  test('[ID 10] - Atualização de review válida', async () => {
    await page.goto(`${config.baseUrl}/login`);

    const closeModal = await page.$('.close-dialog')
    if (closeModal) {
      await page.click('.close-dialog');
    }  
    await page.type('#email', 'admin@juice-sh.op');
    await page.type('#password', 'admin123');
    await page.click('#loginButton');

    await sleep(1000);

    await page.click('mat-card')
    await sleep(500);
    await page.click('.mat-expansion-panel-header')
    await sleep(500);
    await page.click('.review-text');
    await sleep(2000);

    await page.evaluate(() => {
      const textArea = document.querySelectorAll('textarea')[1];
      textArea.value = 'review atualizada'; 
      textArea.dispatchEvent(new Event('input', { bubbles: true }));
    });

    await sleep(1000);

    await page.evaluate(() => document.querySelectorAll('button[type=submit]')[1].click());
    await page.evaluate(() => document.querySelectorAll('button[type=submit]')[0].click());
    await sleep(2000);
    
    const updatedReviewText = await page.evaluate(() => document.querySelector('.review-text > p').innerText)

    expect(updatedReviewText).toEqual('review atualizada');

  }, 30000);


  test('[ID 11] - Tentativa de atualizar uma review inexistente', async () => {
    await page.goto(`${config.baseUrl}/login`);
    await sleep(2000);

    const closeModal = await page.$('.close-dialog');
    if (closeModal) {
      await page.click('.close-dialog');
    }
    await sleep(500)
    
    await page.type('#email', 'admin@juice-sh.op');
    await page.type('#password', 'admin123');
    await page.click('#loginButton');
    await sleep(1000);

    const cards = await page.$$('mat-card');
    await cards[1].click(); 
    await sleep(2000);

    await page.click('.mat-expansion-panel-header')
    await sleep(500);

  const reviewExists = await page.$('.review-text') !== null;

  if (reviewExists) {
    await page.click('.review-text');
    await sleep(2000);

    await page.evaluate(() => {
      const textArea = document.querySelectorAll('textarea')[1];
      textArea.value = 'Tentativa de atualizar uma review inexistente';
      textArea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await sleep(1000);

    await page.evaluate(() => document.querySelectorAll('button[type=submit]')[1].click());
    await page.evaluate(() => document.querySelectorAll('button[type=submit]')[0].click());
    await sleep(2000);

    const updatedReviewText = await page.evaluate(() => {
      const review = document.querySelector('.review-text > p');
      return review ? review.innerText : null;
    });

    expect(updatedReviewText).not.toEqual('Tentativa de atualizar uma review inexistente');
  } else {
    console.log('Nenhuma review encontrada para editar.');
    expect(reviewExists).toBe(false); 
  }
}, 30000);

  test('[ID 12] - NoSQL Injection (Múltiplas reviews modificadas)', async () => {
    await page.goto(`${config.baseUrl}/login`);
    await sleep(1000);

    const closeModal = await page.$('.close-dialog');
    if (closeModal) {
      await page.click('.close-dialog');
    }

    await page.type('#email', 'admin@juice-sh.op');
    await page.type('#password', 'admin123');
    await page.click('#loginButton');
    await page.waitForNavigation();

    await sleep(1000);
    await page.click('mat-card')
    await sleep(500);
    await page.click('.mat-expansion-panel-header')
    await sleep(500);
    await page.click('.review-text');
    await sleep(2000);

    await page.evaluate(() => {
      const textArea = document.querySelectorAll('textarea')[1];
      textArea.value = '{"$ne": null}'; 
      textArea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await sleep(500);
    await page.evaluate(() => document.querySelectorAll('button[type=submit]')[1].click());
    await page.evaluate(() => document.querySelectorAll('button[type=submit]')[0].click());
    await sleep(2000);

    const modifiedReviews = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.review-text')).map(el => el.innerText)
    );
    expect(modifiedReviews).not.toContain('{"$ne": null}');
  }, 30000);
});
