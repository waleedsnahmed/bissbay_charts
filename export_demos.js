const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const demoInfo = JSON.parse(fs.readFileSync('demo_info.json', 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const baseDir = 'bissbay_export';
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);

  for (const category of demoInfo) {
    const categoryDir = path.join(baseDir, category.category.replace(/[^a-z0-9]/gi, '_'));
    if (!fs.existsSync(categoryDir)) fs.mkdirSync(categoryDir);
    
    console.log(`Processing category: ${category.category}`);
    
    for (const demo of category.demos) {
      const fileName = demo.title.replace(/[^a-z0-9]/gi, '_') + '.html';
      const filePath = path.join(categoryDir, fileName);
      
      if (fs.existsSync(filePath)) {
        console.log(`Skipping ${demo.title}, already exists.`);
        continue;
      }

      console.log(`  Exporting ${demo.title}...`);
      try {
        await page.goto(demo.url, { waitUntil: 'networkidle' });
        // The code is usually in pre.code-HTML
        const demoCode = await page.evaluate(() => {
          const pre = document.querySelector('pre.code-HTML');
          return pre ? pre.innerText : null;
        });

        if (demoCode) {
          // Wrap in basic HTML structure if it's just the snippet
          let finalHtml = demoCode;
          if (!demoCode.includes('<!DOCTYPE html>') && !demoCode.includes('<html')) {
             finalHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${demo.title} - Bissbay Export</title>
</head>
<body>
${demoCode}
</body>
</html>`;
          }
          fs.writeFileSync(filePath, finalHtml);
        } else {
          console.log(`    Code NOT found for ${demo.title}`);
        }
      } catch (e) {
        console.log(`    Failed to export ${demo.title}: ${e.message}`);
      }
      // Small delay to be polite
      await new Promise(r => setTimeout(r, 500));
    }
  }

  await browser.close();
  console.log('Export complete!');
})();
