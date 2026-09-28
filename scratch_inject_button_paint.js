const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Remove previous tools
html = html.replace(/<!-- FIREFOX PAINT TEST -->[\s\S]*?<\/script>\s*<\/body>/gi, '</body>');
html = html.replace(/<\/body>\s*<\/html>/gi, '');

const tool = `
<!-- BUTTON PAINT ISOLATION -->
<div id="ff-button-paint" style="position:fixed; bottom:20px; left:20px; z-index:9999999; background:rgba(0,0,0,0.95); color:#fff; border:2px solid #0f0; padding:15px; font-family:monospace; border-radius:8px; display:flex; flex-direction:column; gap:10px; font-size:13px; max-width:350px;">
    <h3 style="margin:0 0 5px 0; color:#0f0; font-size:15px; text-transform:uppercase;">🧪 Button Paint Isolation</h3>
    
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="bp-text-only" name="bp-radio"> 1. TEXT ONLY
    </label>
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="bp-hide-before" name="bp-radio"> 2. HIDE ::before
    </label>
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="bp-hide-after" name="bp-radio"> 3. HIDE ::after
    </label>
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="bp-hide-bg" name="bp-radio"> 4. HIDE BACKGROUND
    </label>
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="bp-hide-children" name="bp-radio"> 5. HIDE VISUAL CHILDREN
    </label>
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="bp-zindex"> 6. TEXT Z-INDEX TEST
    </label>
    <label style="cursor:pointer; display:flex; align-items:center; gap:8px;">
        <input type="checkbox" id="bp-isolate"> 7. ISOLATION TEST
    </label>
    
    <button id="btn-copy-diagnosis" style="background:#0f0; color:#000; padding:8px; border:none; cursor:pointer; font-weight:bold; margin-top:10px;">📋 Copy Firefox Button Diagnosis</button>
</div>

<style id="ff-button-styles"></style>

<script>
(function(){
    const styleEl = document.getElementById('ff-button-styles');
    const checkboxes = document.querySelectorAll('input[name="bp-radio"]');
    
    const rules = {
        textOnly: \`
            #phone-screen .cv-btn, #phone-screen .sub-item {
                background: none !important; background-color: transparent !important; background-image: none !important;
                border: none !important; outline: none !important; box-shadow: none !important;
            }
            #phone-screen .cv-btn::before, #phone-screen .sub-item::before,
            #phone-screen .cv-btn::after, #phone-screen .sub-item::after { display: none !important; }
        \`,
        hideBefore: '#phone-screen .cv-btn::before, #phone-screen .sub-item::before { display: none !important; }',
        hideAfter: '#phone-screen .cv-btn::after, #phone-screen .sub-item::after { display: none !important; }',
        hideBg: '#phone-screen .cv-btn, #phone-screen .sub-item { background: none !important; background-color: transparent !important; background-image: none !important; }',
        hideChildren: '#phone-screen .cv-btn > *:not(strong):not(small):not(span), #phone-screen .sub-item > *:not(strong):not(small):not(span) { opacity: 0 !important; visibility: hidden !important; }',
        zIndex: '#phone-screen .cv-btn > *, #phone-screen .sub-item > strong, #phone-screen .sub-item > small { position: relative !important; z-index: 9999 !important; }',
        isolate: '#phone-screen .cv-btn, #phone-screen .sub-item { isolation: isolate !important; }'
    };

    function updateStyles() {
        let css = '';
        if(document.getElementById('bp-text-only').checked) css += rules.textOnly + '\\n';
        if(document.getElementById('bp-hide-before').checked) css += rules.hideBefore + '\\n';
        if(document.getElementById('bp-hide-after').checked) css += rules.hideAfter + '\\n';
        if(document.getElementById('bp-hide-bg').checked) css += rules.hideBg + '\\n';
        if(document.getElementById('bp-hide-children').checked) css += rules.hideChildren + '\\n';
        
        if(document.getElementById('bp-zindex').checked) css += rules.zIndex + '\\n';
        if(document.getElementById('bp-isolate').checked) css += rules.isolate + '\\n';
        
        styleEl.innerHTML = css;
    }

    // Radio-like behavior for first 5 tests (don't combine them)
    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            if(e.target.checked) {
                checkboxes.forEach(other => { if(other !== e.target) other.checked = false; });
            }
            updateStyles();
        });
    });

    document.getElementById('bp-zindex').addEventListener('change', updateStyles);
    document.getElementById('bp-isolate').addEventListener('change', updateStyles);

    // Diagnosis Report Generator
    document.getElementById('btn-copy-diagnosis').addEventListener('click', () => {
        let report = "--- FIREFOX BUTTON DIAGNOSIS ---\\n\\n";
        
        const analyzeButton = (selector, name) => {
            const btn = document.querySelector(selector);
            if(!btn) { report += \`\${name} not found\\n\\n\`; return; }
            
            const style = window.getComputedStyle(btn);
            report += \`BUTTON: \${name}\\n\`;
            report += \`background: \${style.background}\\n\`;
            report += \`background-color: \${style.backgroundColor}\\n\`;
            report += \`background-image: \${style.backgroundImage}\\n\`;
            report += \`color: \${style.color}\\n\`;
            report += \`opacity: \${style.opacity}\\n\`;
            report += \`position: \${style.position}\\n\`;
            report += \`z-index: \${style.zIndex}\\n\`;
            report += \`transform: \${style.transform}\\n\`;
            report += \`transform-style: \${style.transformStyle}\\n\`;
            report += \`outline: \${style.outline}\\n\`;
            report += \`outline-offset: \${style.outlineOffset}\\n\`;
            report += \`box-shadow: \${style.boxShadow}\\n\`;
            report += \`mix-blend-mode: \${style.mixBlendMode}\\n\`;
            report += \`isolation: \${style.isolation}\\n\`;
            
            // Pseudo elements
            const before = window.getComputedStyle(btn, '::before');
            const after = window.getComputedStyle(btn, '::after');
            report += \`pseudo-before: content='\${before.content}', display=\${before.display}, position=\${before.position}, z-index=\${before.zIndex}, background=\${before.backgroundColor}\\n\`;
            report += \`pseudo-after: content='\${after.content}', display=\${after.display}, position=\${after.position}, z-index=\${after.zIndex}, background=\${after.backgroundColor}\\n\`;
            
            // Text elements / children
            Array.from(btn.children).forEach(child => {
                const cStyle = window.getComputedStyle(child);
                report += \`Child <\${child.tagName.toLowerCase()}>: position=\${cStyle.position}, z-index=\${cStyle.zIndex}, transform=\${cStyle.transform}\\n\`;
            });
            report += '\\n';
        };

        analyzeButton('#phone-screen .cv-btn', '.cv-btn (Green Button)');
        analyzeButton('#phone-screen .sub-item', '.sub-item (Black+Pink Button)');
        
        navigator.clipboard.writeText(report).then(() => {
            const btn = document.getElementById('btn-copy-diagnosis');
            const old = btn.textContent;
            btn.textContent = '✅ Copiado!';
            setTimeout(() => btn.textContent = old, 1500);
        });
    });
})();
</script>
</body>
</html>
`;

fs.writeFileSync('index.html', html + tool);
console.log('Button Paint Isolation injected');
