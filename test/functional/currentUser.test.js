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

describe('Teste Funcional - Informações do Usuário Autenticado', () => {

  test('Deve exibir informações do usuário autenticado com token válido', async () => {
    await page.goto(`${config.baseUrl}/login`);
    await page.click('.close-dialog');

    await page.type('#email', 'admin@juice-sh.op');
    await page.type('#password', 'admin123');
    await page.click('#loginButton');

    await sleep(2000);
    await page.click(`#navbarAccount`);
    await page.click(`button[aria-label="Go to user profile"]`);

    await sleep(2000);

    const userEmail = await page.$eval('input#email', el => el.value.trim());
    expect(userEmail).toBe('admin@juice-sh.op');
  }, 30000);

  test('Deve bloquear acesso às informações com token inválido', async () => {
    await page.setCookie({ name: 'token', value: 'invalid-token', domain: 'localhost' });
    await page.goto(`http://localhost:3000/profile`);
  
    await sleep(2000);
    const errorMessage = await page.$eval('h2', el => el.textContent.trim());
    expect(errorMessage).toContain('Blocked illegal activity by ::1');
  }, 30000);
  
  test('Deve bloquear acesso às informações com token manipulado', async () => {
    const manipulatedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZmFrZS11c2VyIn0.WrongSignature';
    await page.setCookie({ name: 'token', value: manipulatedToken, domain: 'localhost' });
    await page.goto(`http://localhost:3000/profile`);
    
    await sleep(2000);
    const errorMessage = await page.$eval('h2', el => el.textContent.trim());
    expect(errorMessage).toContain('Blocked illegal activity by ::1');
  }, 30000);

});