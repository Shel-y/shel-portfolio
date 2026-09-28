const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const additionalMobileCSS = `
            body.mode-classic .project-card { padding: 20px; }
            .profile-block { padding: 16px; }
            .availability-panel { padding: 20px; }
            .video-link { padding: 16px; }
            .timeline-card-container, .timeline-card-container.right { padding-left: 30px !important; }
            .project-timeline::before { left: 10px; }
            body.mode-classic .timeline-list li, body.mode-classic .session-list li { padding: 16px; }
`;

html = html.replace(
    /\.archive-intro \{ display: block; \}/g,
    '.archive-intro { display: block; }' + additionalMobileCSS
);

fs.writeFileSync('index.html', html);
console.log('Mobile padding fixes applied');
