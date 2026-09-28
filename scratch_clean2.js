const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/\s*transform-style:\s*flat;\n?/g, '\n');

fs.writeFileSync('index.html', html);
console.log('Cleaned flat');
