const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Fix max-width on hero for mobile
html = html.replace(
    /body\.mode-classic \.classic-hero h1 \{ font-size: clamp\(36px, 12vw, 58px\); letter-spacing: -1px; \}/g,
    'body.mode-classic .classic-hero h1 { font-size: clamp(36px, 12vw, 58px); letter-spacing: -1px; max-width: 100%; }\n            body.mode-classic .classic-hero p { max-width: 100%; }'
);

// 2. Fix horizontal overflow on body
html = html.replace(
    /body\.mode-classic \{ background: radial-gradient\(circle at 80% 8%, rgba\(255, 102, 178, 0\.12\), transparent 28rem\), var\(--ink\); \}/g,
    'body.mode-classic { background: radial-gradient(circle at 80% 8%, rgba(255, 102, 178, 0.12), transparent 28rem), var(--ink); overflow-x: hidden; width: 100vw; }'
);

// 3. Fix horizontal overflow in .classic-shell
html = html.replace(
    /body\.mode-classic \.classic-shell \{ max-width: 1080px; padding: 80px 40px 96px; \}/g,
    'body.mode-classic .classic-shell { max-width: 1080px; padding: 80px 40px 96px; overflow-x: hidden; }'
);

// 4. Fix carousel width on mobile
const carouselMobileRegex = /@media \(max-width: 768px\) \{/;
html = html.replace(carouselMobileRegex, `@media (max-width: 768px) {
            .crew-card { min-width: 85vw; }`);

fs.writeFileSync('index.html', html);
console.log('Mobile layout fixes applied');
