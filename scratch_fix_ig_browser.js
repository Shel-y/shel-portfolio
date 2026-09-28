const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Change viewport meta tag to prevent shrink-to-fit issues on iOS IG browser
html = html.replace(
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, shrink-to-fit=no, viewport-fit=cover">'
);

// 2. Change 100vh to 100dvh for better mobile browser height calculation
html = html.replace(/min-height: 100vh;/g, 'min-height: 100dvh;');

// 3. Make the proof strip 1 column on mobile to prevent squishing
html = html.replace(
    /\.proof-strip \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/g,
    '.proof-strip { grid-template-columns: 1fr; }'
);

// 4. Reduce hero font size slightly on mobile and allow word wrap
html = html.replace(
    /body\.mode-classic \.classic-hero h1 \{ font-size: clamp\(36px, 12vw, 58px\); letter-spacing: -1px; max-width: 100%; \}/g,
    'body.mode-classic .classic-hero h1 { font-size: clamp(32px, 10vw, 48px); letter-spacing: -1px; max-width: 100%; word-break: break-word; overflow-wrap: break-word; }'
);

// 5. Ensure buttons and inputs don't zoom automatically on iOS by setting font-size to at least 16px on inputs if any (not strictly needed but good practice)

fs.writeFileSync('index.html', html);
console.log('IG Browser fixes applied');
