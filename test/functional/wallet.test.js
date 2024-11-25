const puppeteer = require('puppeteer-core');
const config = require('./config/puppeteerConfig.js');

// Função para simular requisições à API
async function makeApiRequest(page, endpoint, method, data = null) {
  return await page.evaluate(async (endpoint, method, data) => {
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
    });
    return response.json().then(res => ({
      status: response.status,
      body: res,
    }));
  }, endpoint, method, data);
}

let browser, page;

beforeAll(async () => {
  browser = await puppeteer.launch(config.launch);
  page = await browser.newPage();
});

afterAll(async () => {
  await browser.close();
});

describe('Teste Funcional - Saldo da Carteira', () => {
  test('ID 16: Verificar saldo da carteira para um usuário existente', async () => {
    const response = await makeApiRequest(page, `${config.baseUrl}/api/wallet/balance`, 'GET');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
  }, 30000);

  test('ID 17: Verificar saldo da carteira para um usuário inexistente', async () => {
    const response = await makeApiRequest(page, `${config.baseUrl}/api/wallet/nonexistent-user`, 'GET');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('status', 'error');
  }, 30000);

  test('ID 18: Adicionar saldo à carteira com cartão válido', async () => {
    const response = await makeApiRequest(page, `${config.baseUrl}/api/wallet/add`, 'POST', { amount: 100, card: 'valid-card' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
  }, 30000);

  test('ID 19: Tentar adicionar saldo com cartão inválido', async () => {
    const response = await makeApiRequest(page, `${config.baseUrl}/api/wallet/add`, 'POST', { amount: 100, card: 'invalid-card' });
    expect(response.status).toBe(402);
    expect(response.body).toHaveProperty('message', 'Payment not accepted.');
  }, 30000);

  test('ID 20: Falha ao adicionar saldo por erro no banco de dados', async () => {
    const response = await makeApiRequest(page, `${config.baseUrl}/api/wallet/add`, 'POST', { amount: 100, card: 'db-error-card' });
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('message', 'error');
  }, 30000);
});

