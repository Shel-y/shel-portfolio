const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /#css3d-container > div > div > div \{ pointer-events: auto !important; transform-style: preserve-3d !important; \}/;
const replacement = '#css3d-container > div > div > div { pointer-events: auto !important; transform-style: flat !important; }';

html = html.replace(regex, replacement);

fs.writeFileSync('index.html', html);
console.log('Fixed overflow bug');
