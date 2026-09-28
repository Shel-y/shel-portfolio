const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regexBtn = /\.github-btn, \.cv-btn \{\s*display: inline-flex; align-items: center; justify-content: center;\s*margin-top: 10px; margin-bottom: 15px; padding: 10px 20px;\s*background: linear-gradient\(45deg, #2b2b2b, #1a1a1a\);\s*color: var\(--cyan\) !important; text-decoration: none; border: 1px solid var\(--cyan\);\s*border-radius: 20px; font-weight: bold; font-size: 13px; transition: all 0\.2s ease; width: 100%;\s*\}/;

const newBtn = `.github-btn, .cv-btn {
            display: inline-flex; align-items: center; justify-content: center;
            margin-top: 10px; margin-bottom: 15px; padding: 10px 20px;
            background: transparent;
            color: var(--cyan) !important; text-decoration: none; border: 1px solid var(--cyan);
            border-radius: 20px; font-weight: bold; font-size: 13px; transition: all 0.2s ease; width: 100%;
            position: relative; transform-style: preserve-3d;
        }
        .github-btn::before, .cv-btn::before {
            content: ""; position: absolute; inset: 0; border-radius: 20px;
            background: linear-gradient(45deg, #2b2b2b, #1a1a1a);
            transform: translateZ(-1px); transition: all 0.2s ease;
        }`;

html = html.replace(regexBtn, newBtn);

const regexHover = /\.github-btn:hover, \.cv-btn:hover \{ background: var\(--cyan\); color: var\(--panel\) !important; transform: scale\(1\.02\); box-shadow: 0 0 15px var\(--cyan\); \}/;

const newHover = `.github-btn:hover, .cv-btn:hover { color: var(--panel) !important; transform: scale(1.02); }
        .github-btn:hover::before, .cv-btn:hover::before { background: var(--cyan); box-shadow: 0 0 15px var(--cyan); }`;

html = html.replace(regexHover, newHover);

fs.writeFileSync('index.html', html);
console.log('Fixed cv-btn text occlusion');
