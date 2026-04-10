const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://www.bissbay.com/demos/', { waitUntil: 'networkidle' });
  
  const demoInfo = await page.evaluate(() => {
    const results = [];
    const elements = Array.from(document.querySelectorAll('body *'));
    let currentCategory = null;
    let currentDemos = [];
    
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (el.tagName === 'H2') {
        const text = el.innerText.trim();
        if (text && !text.includes('Looking for') && !text.includes('tutorials') && !text.includes('demos')) {
          if (currentCategory && currentDemos.length > 0) {
            results.push({ category: currentCategory, demos: currentDemos });
          }
          currentCategory = text;
          currentDemos = [];
        }
      } else if (currentCategory && el.tagName === 'A') {
        const url = el.href;
        const title = el.innerText.trim();
        if (url.includes('/demos/') && !url.endsWith('/demos/') && !url.includes('#') && title && title !== 'Demo screenshot') {
          if (!currentDemos.find(d => d.url === url)) {
            currentDemos.push({ title, url });
          }
        }
      }
    }
    
    if (currentCategory && currentDemos.length > 0) {
      results.push({ category: currentCategory, demos: currentDemos });
    }
    
    return results;
  });
  
  console.log(JSON.stringify(demoInfo, null, 2));
  
  await browser.close();
})();
