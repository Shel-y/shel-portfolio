const fs = require('fs');
let js = fs.readFileSync('js/UIController.js', 'utf8');

const hamburgerScript = `
        const hamburger = document.getElementById('nav-hamburger');
        const navMenu = document.getElementById('classic-nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
                hamburger.setAttribute('aria-expanded', !isExpanded);
                navMenu.style.display = isExpanded ? 'none' : 'flex';
                hamburger.textContent = isExpanded ? '☰ MENU' : '✖ CERRAR';
            });

            // Close menu when clicking a link
            navMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.setAttribute('aria-expanded', 'false');
                    navMenu.style.display = 'none';
                    hamburger.textContent = '☰ MENU';
                });
            });
        }
`;

// Insert the hamburger script inside setupClassicInteractions
js = js.replace('const reducedMotion = window.matchMedia(\'(prefers-reduced-motion: reduce)\').matches;',
    'const reducedMotion = window.matchMedia(\'(prefers-reduced-motion: reduce)\').matches;\n\n' + hamburgerScript);

fs.writeFileSync('js/UIController.js', js);
console.log('Hamburger logic added');
