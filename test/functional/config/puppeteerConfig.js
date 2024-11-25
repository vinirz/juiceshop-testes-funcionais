module.exports = {
  launch: {
    headless: false,
    //slowMo: 50,
    defaultViewport: null,
    args: ['--disable-features=site-per-process'],
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  },
  baseUrl: 'http://localhost:3000/#'
}