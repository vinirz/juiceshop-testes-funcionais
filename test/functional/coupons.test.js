const puppeteer = require('puppeteer-core');
const config = require('./config/puppeteerConfig.js');

let browser, page;

beforeAll(async () => {
    browser = await puppeteer.launch(config.launch);
});

afterAll(async () => {
    if (browser) {
        await browser.close();
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Teste Funcional - Análise de Valor Limite para Cupom de Desconto', () => {

    beforeEach(async () => {
        page = await browser.newPage(); 
        await page.goto(`${config.baseUrl}/login`);
        await page.evaluate(() => {
            document.querySelector('#email').value = '';
            document.querySelector('#password').value = '';
        });
        await page.type('#email', 'admin@juice-sh.op');
        await page.type('#password', 'admin123');
        await page.click('#loginButton');
        await sleep(2000);
    });

    afterEach(async () => {
        if (page) {
            await page.close(); 
        }
    });

    test('Deve aplicar um cupom válido na cesta com basketId no limite inferior válido', async () => {
        const response = await page.evaluate(() => {
            return fetch('/apply-coupon', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid-token' },
                body: JSON.stringify({
                    basketId: "1",
                    couponCode: "VALIDCUPON"
                })
            }).then(res => res.json());
        });

        expect(response).toMatchObject({
            discount: expect.any(Number),
            basket: {
                id: "1",
                coupon: "VALIDCUPON"
            }
        });
    }, 30000);

    test('Deve rejeitar um basketId abaixo do limite inferior (inválido)', async () => {
        const response = await page.evaluate(() => {
            return fetch('/apply-coupon', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid-token' },
                body: JSON.stringify({
                    basketId: "0",
                    couponCode: "VALIDCUPON"
                })
            }).then(res => ({
                status: res.status,
                body: res.json()
            }));
        });

        expect(response.status).toBe(400);
        expect(await response.body).toMatchObject({
            error: "Invalid basketId."
        });
    }, 30000);

    test('Deve aplicar um cupom válido na cesta com basketId no limite superior válido', async () => {
        const response = await page.evaluate(() => {
            return fetch('/apply-coupon', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid-token' },
                body: JSON.stringify({
                    basketId: "9999",
                    couponCode: "VALIDCUPON"
                })
            }).then(res => res.json());
        });

        expect(response).toMatchObject({
            discount: expect.any(Number),
            basket: {
                id: "9999",
                coupon: "VALIDCUPON"
            }
        });
    }, 30000);

    test('Deve rejeitar um basketId acima do limite superior (inválido)', async () => {
        const response = await page.evaluate(() => {
            return fetch('/apply-coupon', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid-token' },
                body: JSON.stringify({
                    basketId: "10000",
                    couponCode: "VALIDCUPON"
                })
            }).then(res => ({
                status: res.status,
                body: res.json()
            }));
        });

        expect(response.status).toBe(400);
        expect(await response.body).toMatchObject({
            error: "Invalid basketId."
        });
    }, 30000);

    test('Deve aplicar um cupom no limite superior de comprimento válido', async () => {
        const validCoupon = "A".repeat(50);

        const response = await page.evaluate(() => {
            return fetch('/apply-coupon', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid-token' },
                body: JSON.stringify({
                    basketId: "123",
                    couponCode: validCoupon
                })
            }).then(res => res.json());
        });

        expect(response).toMatchObject({
            discount: expect.any(Number),
            basket: {
                id: "123",
                coupon: validCoupon
            }
        });
    }, 30000);

    test('Deve rejeitar um cupom acima do limite superior de comprimento', async () => {
        const invalidCoupon = "A".repeat(51);

        const response = await page.evaluate(() => {
            return fetch('/apply-coupon', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer valid-token' },
                body: JSON.stringify({
                    basketId: "123",
                    couponCode: invalidCoupon
                })
            }).then(res => ({
                status: res.status,
                body: res.json()
            }));
        });

        expect(response.status).toBe(400);
        expect(await response.body).toMatchObject({
            error: "Invalid coupon code."
        });
    }, 30000);

});


