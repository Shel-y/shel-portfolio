const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// FIX 1: Convert outline to border for .sub-item to fix Firefox's solid outline-offset bug in CSS3D
html = html.replace('outline: 1px dashed var(--pink); outline-offset: -1px;', 'border: 1px dashed var(--pink);');

// Clean up the stray transform: translateZ(1px) that I failed to remove earlier
const strayRegex = /\.sub-item \*, \.phone-contact-link \*, \.cv-btn \*, \.github-btn \*, \.video-link \* \{[\s\S]*?-moz-backface-visibility: hidden;\s*\}/g;
html = html.replace(strayRegex, '');

// Clean up the Button Paint Isolation tool to avoid clutter
html = html.replace(/<!-- BUTTON PAINT ISOLATION -->[\s\S]*?<\/script>\s*<\/body>/gi, '</body>');

fs.writeFileSync('index.html', html);
console.log('Fixed sub-item outline and cleaned up stray CSS');
