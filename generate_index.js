const fs = require('fs');
const path = require('path');
const demoInfo = JSON.parse(fs.readFileSync('demo_info.json', 'utf8'));

let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bissbay Demos Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; background: #f4f7f6; }
        h1 { color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .category { margin-top: 30px; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .category h2 { margin-top: 0; color: #2980b9; border-bottom: 1px solid #eee; padding-bottom: 5px; }
        .demo-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px; }
        .demo-item a { text-decoration: none; color: #34495e; display: block; padding: 8px; border-radius: 4px; transition: background 0.2s; }
        .demo-item a:hover { background: #eef2f7; color: #2980b9; }
    </style>
</head>
<body>
    <h1>Bissbay Demos Export</h1>
    <p style="text-align: center;">A complete offline-capable collection of Bissbay Charts examples and maps.</p>
    
    <div id="toc">
        <h3>Categories</h3>
        <ul>
`;

demoInfo.forEach(cat => {
    const catId = cat.category.replace(/[^a-z0-9]/gi, '_');
    html += `            <li><a href="#${catId}">${cat.category}</a></li>\n`;
});

html += `        </ul>
    </div>\n\n`;

demoInfo.forEach(cat => {
    const catId = cat.category.replace(/[^a-z0-9]/gi, '_');
    html += `    <div class="category" id="${catId}">\n        <h2>${cat.category}</h2>\n        <div class="demo-list">\n`;
    
    cat.demos.forEach(demo => {
        const fileName = demo.title.replace(/[^a-z0-9]/gi, '_') + '.html';
        const relativePath = path.join(catId, fileName);
        html += `            <div class="demo-item"><a href="${relativePath}" target="_blank">${demo.title}</a></div>\n`;
    });
    
    html += `        </div>\n    </div>\n`;
});

html += `
</body>
</html>`;

fs.writeFileSync('bissbay_export/index.html', html);
console.log('Index generated at bissbay_export/index.html');
