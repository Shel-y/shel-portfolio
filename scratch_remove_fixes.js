const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /\/\* --- FIREFOX CSS3D COMPATIBILITY FIXES --- \*\/[\s\S]*?display: block;\s*\}/g;
html = html.replace(regex, '');

fs.writeFileSync('index.html', html);
console.log('Removed extra fixes');
