const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /<!-- DIAGNOSTIC LAYER INSPECTOR -->[\s\S]*?<\/script>/gi;
html = html.replace(regex, '');

fs.writeFileSync('index.html', html);
console.log('Removed diagnostic tool');
