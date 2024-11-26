const puppeteer = require('puppeteer');

describe('Juice Shop - Atualização de Senha', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
  });

  afterAll(async () => {
    await browser.close();
  });

  it('deve atualizar a senha do usuário com sucesso', async () => {
    await page.goto('http://localhost:3001');

    await page.waitForSelector('button#navbarAccount', { visible: true });
    await page.click('button#navbarAccount');
    await page.waitForSelector('button#navbarLoginButton', { visible: true });
    await page.click('button#navbarLoginButton');

    await page.waitForSelector('input#email', { visible: true });
    await page.type('input#email', 'admin@juice-sh.op'); 
    await page.type('input#password', 'admin123'); 
    await page.click('button#loginButton');

    await page.waitForSelector('button#navbarAccount', { visible: true });

    await page.click('button#navbarAccount');
    await page.waitForSelector('button#navbarPrivacyButton', { visible: true });
    await page.click('button#navbarPrivacyButton');

   
    await page.waitForSelector('input#currentPassword', { visible: true });
    await page.type('input#currentPassword', 'admin123'); 
    await page.type('input#newPassword', 'admin456'); 
    await page.type('input#newPasswordRepeat', 'admin456'); 
    await page.click('button#changePasswordButton');

    await page.waitForSelector('.mat-simple-snackbar', { visible: true });
    const successMessage = await page.$eval('.mat-simple-snackbar', el => el.textContent);
    expect(successMessage).toContain('Password successfully changed');

    
    await page.click('button#navbarAccount');
    await page.waitForSelector('button#navbarLogoutButton', { visible: true });
    await page.click('button#navbarLogoutButton');

    
    await page.waitForSelector('button#navbarLoginButton', { visible: true });
    await page.click('button#navbarLoginButton');
    await page.type('input#email', 'admin@juice-sh.op');
    await page.type('input#password', 'admin456'); 
    await page.click('button#loginButton');

   
    await page.waitForSelector('button#navbarAccount', { visible: true });
  }, 30000); 
});