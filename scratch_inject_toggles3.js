const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove the old toggles
const oldTogglesRegex = /<!-- FIREFOX COMPAT TOGGLES 2 -->[\s\S]*?<\/script>\s*<\/body>/gi;
html = html.replace(oldTogglesRegex, '</body>');

html = html.replace(/<\/body>\s*<\/html>/gi, '');

const toggles = `
<!-- FIREFOX BUTTON TOGGLES -->
<div id="ff-toggles" style="position:fixed; bottom:20px; right:20px; z-index:9999999; background:rgba(0,0,0,0.85); color:#fff; border:2px solid #0ff; padding:15px; font-family:monospace; border-radius:8px; display:flex; flex-direction:column; gap:10px; font-size:12px;">
    <h3 style="margin:0 0 5px 0; color:#0ff; font-size:14px; text-transform:uppercase;">🧪 Debug: Botones en Firefox</h3>
    
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-hover-bg">
        Desactivar background-color en hover
    </label>

    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-hover-transform">
        Desactivar transform (translateX) en hover
    </label>
    
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-backface">
        Aplicar backface-visibility: hidden al botón
    </label>

    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-translate-z">
        Empujar texto hacia adelante (translateZ: 1px)
    </label>

    <button id="ff-toggles-close" style="margin-top:10px; background:#f0f; color:#fff; border:none; padding:5px; cursor:pointer; font-weight:bold;">Ocultar Panel</button>
</div>

<style id="ff-debug-styles"></style>

<script>
(function(){
    const styleEl = document.getElementById('ff-debug-styles');
    
    const rules = {
        bg: '#phone-screen .sub-item:hover, #phone-screen .video-link:hover { background: transparent !important; }',
        transform: '#phone-screen .sub-item:hover, #phone-screen .video-link:hover { transform: none !important; }',
        backface: '#phone-screen .sub-item, #phone-screen .video-link { backface-visibility: hidden !important; -moz-backface-visibility: hidden !important; }',
        translateZ: '#phone-screen .sub-item > *, #phone-screen .video-link > * { transform: translateZ(1px) !important; display: block; }'
    };
    
    const state = { bg: false, transform: false, backface: false, translateZ: false };
    
    function updateStyles() {
        let css = '';
        if(state.bg) css += rules.bg + '\\n';
        if(state.transform) css += rules.transform + '\\n';
        if(state.backface) css += rules.backface + '\\n';
        if(state.translateZ) css += rules.translateZ + '\\n';
        styleEl.innerHTML = css;
    }
    
    document.getElementById('toggle-hover-bg').addEventListener('change', (e) => { state.bg = e.target.checked; updateStyles(); });
    document.getElementById('toggle-hover-transform').addEventListener('change', (e) => { state.transform = e.target.checked; updateStyles(); });
    document.getElementById('toggle-backface').addEventListener('change', (e) => { state.backface = e.target.checked; updateStyles(); });
    document.getElementById('toggle-translate-z').addEventListener('change', (e) => { state.translateZ = e.target.checked; updateStyles(); });
    
    document.getElementById('ff-toggles-close').addEventListener('click', () => {
        document.getElementById('ff-toggles').style.display = 'none';
    });
})();
</script>
</body>
</html>
`;

fs.writeFileSync('index.html', html + toggles);
console.log('Button toggles injected');
