import puppeteer from 'puppeteer';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  
  // Set mobile viewport
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  
  console.log('Navigating to technician app...');
  await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await delay(5000);
  
  console.log('Page loaded!');
  await page.screenshot({ path: 'tmp/tech-login.png', fullPage: true });
  
  // Fill in phone number
  console.log('Filling phone number...');
  await page.type('input[placeholder="연락처"]', '010-9999-8888');
  
  // Fill in password
  console.log('Filling password...');
  await page.type('input[placeholder="비밀번호"]', 'test1234');
  
  await page.screenshot({ path: 'tmp/tech-login-filled.png', fullPage: true });
  
  // Click login button
  console.log('Clicking login button...');
  await page.click('text=로그인');
  
  await delay(5000);
  
  console.log('URL after login:', page.url());
  await page.screenshot({ path: 'tmp/tech-after-login.png', fullPage: true });
  
  const bodyText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 500) : 'No body');
  console.log('Body text after login:', bodyText);
  
  await browser.close();
  console.log('Test completed!');
})();
