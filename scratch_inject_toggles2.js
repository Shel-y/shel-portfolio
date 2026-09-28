const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace the old toggles block
const oldTogglesRegex = /<!-- FIREFOX COMPAT TOGGLES -->[\s\S]*?<\/script>\s*<\/body>/gi;
html = html.replace(oldTogglesRegex, '</body>');

html = html.replace(/<\/body>\s*<\/html>/gi, '');

const toggles = `
<!-- FIREFOX COMPAT TOGGLES 2 -->
<div id="ff-toggles" style="position:fixed; bottom:20px; right:20px; z-index:9999999; background:rgba(0,0,0,0.85); color:#fff; border:2px solid #0ff; padding:15px; font-family:monospace; border-radius:8px; display:flex; flex-direction:column; gap:10px; font-size:12px;">
    <h3 style="margin:0 0 5px 0; color:#0ff; font-size:14px; text-transform:uppercase;">🧪 Suspect Layers & Masks</h3>
    
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-clip-path">
        #phone-screen (clip-path: inset)
    </label>

    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-z-index">
        #phone-screen (z-index)
    </label>
    
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-translate-z">
        #phone-screen * (transform: translateZ)
    </label>

    <button id="ff-toggles-close" style="margin-top:10px; background:#f0f; color:#fff; border:none; padding:5px; cursor:pointer; font-weight:bold;">Ocultar Panel</button>
</div>

<script>
(function(){
    const phoneScreen = document.getElementById('phone-screen');
    let injectedStyle = null;
    
    document.getElementById('toggle-clip-path').addEventListener('change', (e) => {
        if(phoneScreen) {
            phoneScreen.style.clipPath = e.target.checked ? 'inset(0px 0px 0px 0px round 8px)' : 'none';
        }
    });

    document.getElementById('toggle-z-index').addEventListener('change', (e) => {
        if(phoneScreen) {
            phoneScreen.style.zIndex = e.target.checked ? '999' : 'auto';
        }
    });
    
    document.getElementById('toggle-translate-z').addEventListener('change', (e) => {
        if (e.target.checked) {
            if (!injectedStyle) {
                injectedStyle = document.createElement('style');
                injectedStyle.innerHTML = '#phone-screen * { transform: translateZ(1px); }';
                document.head.appendChild(injectedStyle);
            }
        } else {
            if (injectedStyle) {
                injectedStyle.remove();
                injectedStyle = null;
            }
        }
    });
    
    document.getElementById('ff-toggles-close').addEventListener('click', () => {
        document.getElementById('ff-toggles').style.display = 'none';
    });
})();
</script>
</body>
</html>
`;

fs.writeFileSync('index.html', html + toggles);
console.log('Toggles injected 2');
