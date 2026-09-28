const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /\/\* FIREFOX CSS3D FIXES \*\/[\s\S]*?-moz-backface-visibility: hidden;\s*\}/g;
html = html.replace(regex, '');

fs.writeFileSync('index.html', html);
console.log('Cleaned stray fixes');
