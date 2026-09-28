const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Eliminar Advanced Layer Inspector
html = html.replace(/<!-- ADVANCED LAYER INSPECTOR -->[\s\S]*?<\/script>\s*<\/body>/gi, '</body>');
html = html.replace(/<\/body>\s*<\/html>/gi, '');

const paintTest = `
<!-- FIREFOX PAINT TEST -->
<div id="ff-paint-test" style="position:fixed; bottom:20px; right:20px; z-index:9999999; background:rgba(0,0,0,0.9); color:#fff; border:2px solid #ff0; padding:15px; font-family:monospace; border-radius:8px; display:flex; flex-direction:column; gap:10px; font-size:13px; max-width:350px;">
    <h3 style="margin:0 0 5px 0; color:#ff0; font-size:15px; text-transform:uppercase;">🧪 Firefox Paint Test</h3>
    
    <div style="background:#222; padding:10px; border-radius:4px; margin-bottom:10px; border:1px solid #555;">
        <strong>STATUS:</strong><br>
        A: <span id="status-a" style="color:#f55;">OFF</span><br>
        B: <span id="status-b" style="color:#f55;">OFF</span><br>
        C: <span id="status-c" style="color:#f55;">OFF</span>
    </div>
    
    <button id="btn-test-a" style="background:#444; color:#fff; padding:8px; border:1px solid #fff; cursor:pointer; font-weight:bold; text-align:left;">A — overflow:hidden</button>
    <button id="btn-test-b" style="background:#444; color:#fff; padding:8px; border:1px solid #fff; cursor:pointer; font-weight:bold; text-align:left;">B — remove child transform</button>
    <button id="btn-test-c" style="background:#444; color:#fff; padding:8px; border:1px solid #fff; cursor:pointer; font-weight:bold; text-align:left;">C — remove phone transform</button>
    
    <button id="btn-reset-all" style="background:#f00; color:#fff; padding:8px; border:none; cursor:pointer; font-weight:bold; margin-top:10px;">Reset all</button>
</div>

<style id="ff-paint-styles"></style>

<script>
(function(){
    const styleEl = document.getElementById('ff-paint-styles');
    const state = { a: false, b: false, c: false };

    const rules = {
        a: '#phone-screen { overflow: hidden !important; }',
        b: '#phone-screen .sub-item { transform: none !important; }',
        c: '#phone-screen { transform: none !important; }'
    };

    function updateUI() {
        document.getElementById('status-a').textContent = state.a ? 'ON' : 'OFF';
        document.getElementById('status-a').style.color = state.a ? '#0f0' : '#f55';
        
        document.getElementById('status-b').textContent = state.b ? 'ON' : 'OFF';
        document.getElementById('status-b').style.color = state.b ? '#0f0' : '#f55';
        
        document.getElementById('status-c').textContent = state.c ? 'ON' : 'OFF';
        document.getElementById('status-c').style.color = state.c ? '#0f0' : '#f55';

        document.getElementById('btn-test-a').style.background = state.a ? '#007700' : '#444';
        document.getElementById('btn-test-b').style.background = state.b ? '#007700' : '#444';
        document.getElementById('btn-test-c').style.background = state.c ? '#007700' : '#444';

        let css = '';
        if(state.a) css += rules.a + '\\n';
        if(state.b) css += rules.b + '\\n';
        if(state.c) css += rules.c + '\\n';
        styleEl.innerHTML = css;
    }

    document.getElementById('btn-test-a').addEventListener('click', () => { state.a = !state.a; updateUI(); });
    document.getElementById('btn-test-b').addEventListener('click', () => { state.b = !state.b; updateUI(); });
    document.getElementById('btn-test-c').addEventListener('click', () => { state.c = !state.c; updateUI(); });
    
    document.getElementById('btn-reset-all').addEventListener('click', () => {
        state.a = false; state.b = false; state.c = false;
        updateUI();
    });
})();
</script>
</body>
</html>
`;

fs.writeFileSync('index.html', html + paintTest);
console.log('Paint test injected');
