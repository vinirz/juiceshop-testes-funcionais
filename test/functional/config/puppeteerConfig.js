module.exports = {
  launch: {
    headless: false,
    slowMo: 50,
    defaultViewport: null,
    args: ['--disable-features=site-per-process'],
    executablePath: '/usr/bin/google-chrome-stable',
  },
  baseUrl: 'http://localhost:3000/#'
}