module.exports = {
  launch: {
    headless: false,
    //slowMo: 50,
    defaultViewport: null,
    args: ['--disable-features=site-per-process'],
    executablePath: '/usr/bin/chromium-browser',
  },
  baseUrl: 'http://localhost:3000/#'
}