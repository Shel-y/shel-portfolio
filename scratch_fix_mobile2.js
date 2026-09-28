const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Use overflow-x: clip on classic-shell to prevent breaking sticky nav
html = html.replace(
    /body\.mode-classic \.classic-shell \{ max-width: 1080px; padding: 80px 40px 96px; overflow-x: hidden; \}/g,
    'body.mode-classic .classic-shell { max-width: 1080px; padding: 80px 40px 96px; overflow-x: clip; }'
);

// Use overflow-x: clip on body
html = html.replace(
    /overflow-x: hidden; width: 100vw;/g,
    'overflow-x: clip; width: 100%;'
);

// Hide stickers on mobile to completely prevent them from breaking the narrow layout or overlapping text
html = html.replace(
    /body\.mode-classic \.classic-hero p \{ max-width: 100%; \}/g,
    'body.mode-classic .classic-hero p { max-width: 100%; }\n            .floating-sticker { display: none; }'
);

fs.writeFileSync('index.html', html);
console.log('Mobile layout tweaks applied');
