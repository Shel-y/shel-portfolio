const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const fixCSS = `
        /* FIREFOX CSS3D FIXES */
        .sub-item, .phone-contact-link, .cv-btn, .github-btn, .video-link {
            transform-style: preserve-3d;
            backface-visibility: hidden;
            -moz-backface-visibility: hidden;
        }
        .sub-item *, .phone-contact-link *, .cv-btn *, .github-btn *, .video-link * {
            transform: translateZ(1px);
            backface-visibility: hidden;
            -moz-backface-visibility: hidden;
        }
`;

html = html.replace('</style>', fixCSS + '\n    </style>');
fs.writeFileSync('index.html', html);
console.log('Applied Firefox CSS3D fix');
