const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Ensure we don't duplicate
html = html.replace(/<!-- FIREFOX COMPAT TOGGLES -->[\s\S]*?<\/script>/gi, '');
html = html.replace(/<\/body>\s*<\/html>/gi, '');

const toggles = `
<!-- FIREFOX COMPAT TOGGLES -->
<div id="ff-toggles" style="position:fixed; bottom:20px; right:20px; z-index:9999999; background:rgba(0,0,0,0.85); color:#fff; border:2px solid #0ff; padding:15px; font-family:monospace; border-radius:8px; display:flex; flex-direction:column; gap:10px; font-size:12px;">
    <h3 style="margin:0 0 5px 0; color:#0ff; font-size:14px; text-transform:uppercase;">🧪 Suspect Components</h3>
    
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-noise-blend" checked>
        #noise-overlay (mix-blend-mode)
    </label>
    
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-noise-display" checked>
        #noise-overlay (display)
    </label>

    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-overflow" checked>
        #phone-screen (overflow-y: scroll)
    </label>
    
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-phone-bg" checked>
        #phone-screen (background color)
    </label>

    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="toggle-preserve3d">
        #phone-screen (transform-style: flat)
    </label>
    
    <button id="ff-toggles-close" style="margin-top:10px; background:#f0f; color:#fff; border:none; padding:5px; cursor:pointer; font-weight:bold;">Ocultar Panel</button>
</div>

<script>
(function(){
    const noiseEl = document.getElementById('noise-overlay');
    const phoneScreen = document.getElementById('phone-screen');
    
    document.getElementById('toggle-noise-blend').addEventListener('change', (e) => {
        if(noiseEl) noiseEl.style.mixBlendMode = e.target.checked ? 'overlay' : 'normal';
    });
    
    document.getElementById('toggle-noise-display').addEventListener('change', (e) => {
        if(noiseEl) noiseEl.style.display = e.target.checked ? 'block' : 'none';
    });

    document.getElementById('toggle-overflow').addEventListener('change', (e) => {
        if(phoneScreen) phoneScreen.style.overflowY = e.target.checked ? 'scroll' : 'visible';
    });
    
    document.getElementById('toggle-phone-bg').addEventListener('change', (e) => {
        if(phoneScreen) phoneScreen.style.backgroundColor = e.target.checked ? 'var(--panel)' : 'transparent';
    });

    document.getElementById('toggle-preserve3d').addEventListener('change', (e) => {
        // Appending to the actual wrapper in CSS3D object hierarchy might be tricky, let's just apply to phone-screen
        if(phoneScreen) phoneScreen.style.transformStyle = e.target.checked ? 'flat' : 'preserve-3d';
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
console.log('Toggles injected');
