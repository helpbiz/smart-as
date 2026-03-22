import puppeteer from 'puppeteer';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  
  // Enable request/response logging
  page.on('request', request => {
    console.log('>>', request.method(), request.url());
  });
  page.on('response', response => {
    console.log('<<', response.status(), response.url());
  });
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  // Set mobile viewport
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  
  console.log('Navigating to technician app...');
  await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await delay(5000);
  
  console.log('Page loaded!');
  
  // Clear previous inputs and fill
  console.log('Filling phone number...');
  await page.$eval('input[placeholder="연락처"]', el => el.value = '');
  await page.type('input[placeholder="연락처"]', '010-9999-8888');
  
  console.log('Filling password...');
  await page.$eval('input[placeholder="비밀번호"]', el => el.value = '');
  await page.type('input[placeholder="비밀번호"]', 'test1234');
  
  await delay(1000);
  
  // Click login button
  console.log('Clicking login button...');
  await page.click('text=로그인');
  
  await delay(8000);
  
  console.log('URL after login:', page.url());
  const bodyText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 800) : 'No body');
  console.log('Body text after login:', bodyText);
  
  await browser.close();
})();
