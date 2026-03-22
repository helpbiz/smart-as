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
  try {
    await page.goto('http://localhost:8081', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Page loaded!');
    
    // Wait for React to render
    await delay(10000);
    
    console.log('Title:', await page.title());
    console.log('URL:', page.url());
    
    // Get page content
    const bodyText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 500) : 'No body');
    console.log('Body text:', bodyText);
    
    // Check root element
    const rootHtml = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML.slice(0, 500) : 'No root element';
    });
    console.log('Root HTML:', rootHtml);
    
    // Take screenshot
    await page.screenshot({ path: 'tmp/tech-app.png', fullPage: true });
    console.log('Screenshot saved to tmp/tech-app.png');
  } catch (e) {
    console.error('Error:', e.message);
  }
  
  await browser.close();
  console.log('Test completed!');
})();
