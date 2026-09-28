const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regexSubitemHover = /\.sub-item:hover \{ background-color: rgba\(255, 102, 178, 0\.15\); transform: translateX\(4px\); \}/;
const newSubitemHover = `.sub-item { position: relative; transform-style: preserve-3d; }
        .sub-item::before { content: ""; position: absolute; inset: 0; background-color: rgba(255, 102, 178, 0.15); opacity: 0; transform: translateZ(-1px); transition: opacity 0.2s; }
        .sub-item:hover { transform: translateX(4px); }
        .sub-item:hover::before { opacity: 1; }`;

html = html.replace(regexSubitemHover, newSubitemHover);

fs.writeFileSync('index.html', html);
console.log('Fixed sub-item');
