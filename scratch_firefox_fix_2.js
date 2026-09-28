const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove the previous quick fix I just appended
html = html.replace(/\/\* FIREFOX CSS3D FIXES \*\/[\s\S]*?-moz-backface-visibility: hidden;\s*\}/g, '');

const solidFix = `
        /* --- FIREFOX CSS3D COMPATIBILITY FIXES --- */
        /* Force hardware acceleration and stable 3D layers for interactive elements */
        #phone-screen .sub-item, 
        #phone-screen .phone-contact-link, 
        #phone-screen .cv-btn, 
        #phone-screen .github-btn,
        #phone-screen .video-link {
            backface-visibility: hidden;
            -moz-backface-visibility: hidden;
            transform-style: preserve-3d;
            /* A subtle translateZ forces Firefox to allocate a stable composite layer */
            transform: translateZ(1px);
        }
        
        /* Fix for .sub-item hover translating */
        #phone-screen .sub-item:hover {
            transform: translateX(4px) translateZ(1px);
        }

        /* Fix for button scale */
        #phone-screen .github-btn:hover, 
        #phone-screen .cv-btn:hover { 
            transform: scale(1.02) translateZ(1px); 
        }

        /* Text occlusion fix: ensure text nodes inside buttons sit slightly in front of the background */
        #phone-screen .sub-item > *,
        #phone-screen .video-link > * {
            transform: translateZ(2px);
            display: block;
        }
`;

html = html.replace('</style>', solidFix + '\n    </style>');
fs.writeFileSync('index.html', html);
console.log('Applied solid Firefox CSS3D fix');
