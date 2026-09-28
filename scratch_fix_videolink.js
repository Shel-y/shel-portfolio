const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regexVideo = /\.video-link \{ display: flex; min-height: 150px; flex-direction: column; justify-content: flex-end; gap: 8px; padding: 20px; color: #fff; text-decoration: none; border: 1px solid rgba\(0, 255, 204, 0\.35\); background: linear-gradient\(145deg, rgba\(0, 255, 204, 0\.12\), rgba\(255, 102, 178, 0\.18\)\), var\(--panel\); transition: transform 0\.2s, border-color 0\.2s; \}/;

const newVideo = `.video-link { display: flex; min-height: 150px; flex-direction: column; justify-content: flex-end; gap: 8px; padding: 20px; color: #fff; text-decoration: none; border: 1px solid rgba(0, 255, 204, 0.35); background: transparent; transition: transform 0.2s, border-color 0.2s; position: relative; transform-style: preserve-3d; }
        .video-link::before { content: ""; position: absolute; inset: 0; background: linear-gradient(145deg, rgba(0, 255, 204, 0.12), rgba(255, 102, 178, 0.18)), var(--panel); transform: translateZ(-1px); transition: box-shadow 0.2s; }`;

html = html.replace(regexVideo, newVideo);

const regexVideoHover = /\.video-link:hover \{ transform: translateY\(-4px\); border-color: var\(--pink\); box-shadow: 0 8px 24px rgba\(255, 102, 178, 0\.18\); \}/;

const newVideoHover = `.video-link:hover { transform: translateY(-4px); border-color: var(--pink); }
        .video-link:hover::before { box-shadow: 0 8px 24px rgba(255, 102, 178, 0.18); }`;

html = html.replace(regexVideoHover, newVideoHover);

fs.writeFileSync('index.html', html);
console.log('Fixed video-link');
