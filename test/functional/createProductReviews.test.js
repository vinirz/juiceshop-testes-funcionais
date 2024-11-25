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

describe('Teste Funcional - Avaliação de Produtos', () => {
  test('Deve permitir que um usuário válido cadastre uma avaliação', async () => {
    await page.goto(`${config.baseUrl}/login`);

    const closeModal = await page.$('.close-dialog')
    if(closeModal) {      
      await page.click('.close-dialog');
    }

    await page.type('#email', 'admin@juice-sh.op');
    await page.type('#password', 'admin123');
    await page.click('#loginButton');

    await sleep(1000);

    await page.click('.product');

    await page.type('#mat-input-3', 'Produto excelente!');
    await page.click('#submitButton');    

    await sleep(1000);

  // Capturando as avaliações na página
  const reviews = await page.$$eval('.review-text', reviews => reviews.map(review => review.textContent.trim()));
  const containsProductReview = reviews.some(review => review.includes('Produto excelente'));

  expect(containsProductReview).toBe(true);
  }, 30000);

  test('Deve impedir que um usuário inválido cadastre uma avaliação', async () => {
    await page.goto(`${config.baseUrl}/login`);
    const closeModal = await page.$('.close-dialog');
    if (closeModal) {      
      await page.click('.close-dialog');
    }
  
    await page.type('#email', 'adm@');
    await page.type('#password', 'adm123');
    await page.click('#loginButton');
  
    await sleep(1000);
  
     // Verificar se a página ainda está na tela de login (indicando falha)
  const loginButtonVisible = await page.$('#loginButton') !== null;
  expect(loginButtonVisible).toBe(true);

  // Alternativamente, tente capturar erros de autenticação com outro seletor genérico
    const errorMessage = await page.evaluate(() => {
    const errorElement = document.querySelector('.error.ng-star-inserted');
    return errorElement ? errorElement.textContent.trim() : null;
  });
  expect(errorMessage).toContain('Invalid email or password.');
  }, 30000);

  test('Deve impedir que um usuário não cadastrado avalie um produto', async () => {
    const closeModal = await page.$('.close-dialog');
    if (closeModal) {      
      await page.click('.close-dialog');
    }
  
    await page.goto(`${config.baseUrl}`); 
    await page.click('.product');
    const isReviewInputVisible = await page.$('#mat-input-3');

  expect(isReviewInputVisible).toBeNull(); 
  }, 30000);
});