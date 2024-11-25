const puppeteer = require('puppeteer-core');
const config = require('./config/puppeteerConfig.js');

let browser, page;

beforeAll(async () => {
    // Inicializa o navegador e a página antes de todos os testes
    browser = await puppeteer.launch(config.launch);
    page = await browser.newPage();
});

afterAll(async () => {
    // Fecha o navegador após todos os testes
    await browser.close();
});

function sleep(ms) {
    // Função para pausar a execução por um determinado número de milissegundos
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Teste Funcional - Informações do Usuário Autenticado', () => {

    test('Deve exibir informações do usuário autenticado com token válido', async () => {
        // Navega para a página de login e realiza o login com credenciais válidas
        await page.goto(`${config.baseUrl}/login`);
        await page.click('.close-dialog');

        await page.type('#email', 'admin@juice-sh.op');
        await page.type('#password', 'admin123');
        await page.click('#loginButton');

        await sleep(2000);
        await page.click(`#navbarAccount`);
        await page.click(`button[aria-label="Go to user profile"]`);

        await sleep(2000);

        // Verifica se o email do usuário exibido é o esperado
        const userEmail = await page.$eval('input#email', el => el.value.trim());
        expect(userEmail).toBe('admin@juice-sh.op');
    }, 30000);

    test('Deve bloquear acesso às informações com token inválido', async () => {
        // Testa o acesso com um token inválido
        await page.setCookie({ name: 'token', value: 'invalid-token', domain: 'localhost' });
        await page.goto(`http://localhost:3000/profile`);
  
        await sleep(2000);
        const errorMessage = await page.$eval('h2', el => el.textContent.trim());
        expect(errorMessage).toContain('Blocked illegal activity by ::1');
    }, 30000);
  
    test('Deve bloquear acesso às informações com token manipulado', async () => {
        // Testa o acesso com um token manipulado
        const manipulatedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZmFrZS11c2VyIn0.WrongSignature';
        await page.setCookie({ name: 'token', value: manipulatedToken, domain: 'localhost' });
        await page.goto(`http://localhost:3000/profile`);
        
        await sleep(2000);
        const errorMessage = await page.$eval('h2', el => el.textContent.trim());
        expect(errorMessage).toContain('Blocked illegal activity by ::1');
    }, 30000);

    // Testes de Valor Limite --> Intervalo: [1, 500]

    describe('Teste de Validação de Token a Partir da Análise do Valor Limite', () => {

        // Função de log personalizada
        const logMessage = (message, isError = false) => {
            const prefix = isError ? '[ERRO]' : '[SUCESSO]';
            console.log(`${prefix} ${message}`);
        };

        const jwt = require('jsonwebtoken'); // Importa a biblioteca jsonwebtoken

        const SECRET_KEY = 'chave_secreta'; // Chave secreta definida

        const authenticateUser  = (token) => {
            // Simulação de autenticação
            if (token.length < 20) {
                return { error: 'Token inválido' };
            }
            if (token.length > 500) {
                return { error: 'Token inválido' };
            }
            if (!token.includes('.')) {
                return { error: 'Token inválido' };
            }

            try {
                // Verifica a assinatura do token
                const decoded = jwt.verify(token, SECRET_KEY);
                return { user: decoded.user }; // Retorna o usuário decodificado
            } catch (err) {
                logMessage(`Erro ao verificar token: ${err.message}`, true); // Log do erro
                return { error: 'Token inválido' }; // Se a verificação falhar, retorna erro
            }
        };

        // Criação de um token válido
        const validToken = jwt.sign({ user: 'usuario-simulado' }, SECRET_KEY, { expiresIn: '1h' });

        // Teste direto da verificação do token
        it('Deve decodificar o token válido', () => {
            const decoded = jwt.verify(validToken, SECRET_KEY);
            logMessage(`Token decodificado diretamente: ${JSON.stringify(decoded)}`);
            expect(decoded).toEqual({ user: 'usuario-simulado', iat: expect.any(Number), exp: expect.any(Number) });
            logMessage('Teste "Deve decodificar o token válido" passou com sucesso.');
        });

        // Teste para token muito curto (0 a 19 caracteres)
        it('Deve bloquear acesso com token muito curto', () => {
            const shortToken = 'short'; // 5 caracteres
            const response = authenticateUser (shortToken);
            logMessage(`Resposta para token muito curto: ${JSON.stringify(response)}`);
            expect(response).toEqual({ error: 'Token inválido' });
            logMessage('Teste "Deve bloquear acesso com token muito curto" passou com sucesso.');
        });

        // Teste para token vazio (0 caracteres)
        it('Deve bloquear acesso com token vazio', () => {
            const emptyToken = ''; // 0 caracteres
            const response = authenticateUser (emptyToken);
            logMessage(`Resposta para token vazio: ${JSON.stringify(response)}`);
            expect(response).toEqual({ error: 'Token inválido' });
            logMessage('Teste "Deve bloquear acesso com token vazio" passou com sucesso.');
        });

        // Teste para token válido (20 a 500 caracteres)
        it('Deve permitir acesso com token válido', () => {
            const response = authenticateUser (validToken); // Usando validToken
            logMessage(`Resposta do token válido: ${JSON.stringify(response)}`);
            expect(response).toEqual({ user: 'usuario-simulado' });
            logMessage('Teste "Deve permitir acesso com token válido" passou com sucesso.');
        });

        // Teste para token muito longo (> 500 caracteres)
        it('Deve bloquear acesso com token muito longo', () => {
            const longToken = 'a'.repeat(501); // 501 caracteres
            const response = authenticateUser (longToken);
            logMessage(`Resposta para token muito longo: ${JSON.stringify(response)}`);
            expect(response).toEqual({ error: 'Token inválido' });
            logMessage('Teste "Deve bloquear acesso com token muito longo" passou com sucesso.');
        });

        // Teste para token malformado (sem estrutura correta)
        it('Deve bloquear acesso com token sem estrutura correta', () => {
            const malformedToken = 'invalid-token'; // Não contém partes separadas por pontos
            const response = authenticateUser (malformedToken);
            logMessage(`Resposta para token malformado: ${JSON.stringify(response)}`);
            expect(response).toEqual({ error: 'Token inválido' });
            logMessage('Teste "Deve bloquear acesso com token sem estrutura correta" passou com sucesso.');
        });

        // Teste para token manipulado de tamanho correto (20 a 500 caracteres, mas com assinatura inválida)
        it('Deve bloquear acesso com token manipulado de tamanho correto', () => {
            // Gera um token válido
            const validToken = jwt.sign({ user: 'usuario-simulado' }, SECRET_KEY, { expiresIn: '1h' });
            
            // Manipula a assinatura do token
            const manipulatedToken = validToken.split('.'); // Divide o token em partes
            manipulatedToken[2] = 'InvalidSignature'; // Altera a parte da assinatura
            const alteredToken = manipulatedToken.join('.'); // Junta as partes novamente

            const response = authenticateUser  (alteredToken);
            logMessage(`Resposta para token manipulado: ${JSON.stringify(response)}`);
            expect(response).toEqual({ error: 'Token inválido' });
            logMessage('Teste "Deve bloquear acesso com token manipulado de tamanho correto" passou com sucesso.');
        });
    });
});