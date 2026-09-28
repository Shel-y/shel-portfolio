const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Eliminar cualquier bloque de toggles anterior
html = html.replace(/<!-- FIREFOX BUTTON TOGGLES -->[\s\S]*?<\/script>\s*<\/body>/gi, '</body>');
html = html.replace(/<!-- FIREFOX COMPAT TOGGLES -->[\s\S]*?<\/script>\s*<\/body>/gi, '</body>');
html = html.replace(/<!-- FIREFOX COMPAT TOGGLES 2 -->[\s\S]*?<\/script>\s*<\/body>/gi, '</body>');

html = html.replace(/<\/body>\s*<\/html>/gi, '');

const inspector = `
<!-- ADVANCED LAYER INSPECTOR -->
<div id="ff-layer-inspector" style="position:fixed; bottom:20px; left:20px; z-index:9999999; background:#222; color:#fff; border:2px solid #0ff; padding:15px; font-family:monospace; border-radius:8px; display:flex; flex-direction:column; gap:10px; font-size:13px; max-width:400px; box-shadow:0 0 20px rgba(0,255,255,0.3);">
    <strong style="color:#0ff; font-size:15px;">🔬 Firefox Layer Inspector</strong>
    <button id="btn-inspect-layer" style="background:#0ff; color:#000; padding:8px; border:none; cursor:pointer; font-weight:bold; text-align:left;">🔬 Inspect Layer (Hover)</button>
    <button id="btn-pick-pixel" style="background:#f0f; color:#fff; padding:8px; border:none; cursor:pointer; font-weight:bold; text-align:left;">🎯 Pick problematic pixel</button>
</div>

<div id="inspector-panel" style="display:none; position:fixed; top:20px; right:20px; bottom:20px; width:450px; z-index:10000000; background:rgba(0,0,0,0.95); color:#0f0; border:1px solid #0f0; padding:15px; font-family:monospace; font-size:12px; overflow-y:auto; overflow-x:hidden;">
    <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
        <strong style="color:#fff; font-size:14px;">DIAGNÓSTICO DE CAPAS</strong>
        <button id="btn-close-panel" style="background:transparent; color:#fff; border:none; cursor:pointer; font-size:16px;">✖</button>
    </div>
    <button id="btn-copy-stack" style="background:#0f0; color:#000; width:100%; padding:8px; border:none; cursor:pointer; font-weight:bold; margin-bottom:15px;">📋 Copy Layer Stack</button>
    <pre id="stack-output" style="white-space:pre-wrap; word-wrap:break-word; margin:0; line-height:1.4;"></pre>
</div>

<style>
    .layer-inspect-hover { outline: 2px solid #0ff !important; outline-offset: -2px; background: rgba(0,255,255,0.1) !important; cursor: crosshair !important; }
    .layer-inspect-active * { cursor: crosshair !important; }
</style>

<script>
(function(){
    const btnInspect = document.getElementById('btn-inspect-layer');
    const btnPick = document.getElementById('btn-pick-pixel');
    const panel = document.getElementById('inspector-panel');
    const btnClose = document.getElementById('btn-close-panel');
    const btnCopy = document.getElementById('btn-copy-stack');
    const output = document.getElementById('stack-output');

    let mode = null; // 'inspect' or 'pick'
    let hoveredEl = null;
    let stackDataStr = "";

    function resetMode() {
        mode = null;
        document.body.classList.remove('layer-inspect-active');
        if(hoveredEl) hoveredEl.classList.remove('layer-inspect-hover');
        hoveredEl = null;
        btnInspect.style.background = '#0ff'; btnInspect.style.color = '#000'; btnInspect.textContent = '🔬 Inspect Layer (Hover)';
        btnPick.style.background = '#f0f'; btnPick.style.color = '#fff'; btnPick.textContent = '🎯 Pick problematic pixel';
    }

    btnInspect.addEventListener('click', () => {
        if(mode === 'inspect') resetMode();
        else {
            resetMode();
            mode = 'inspect';
            document.body.classList.add('layer-inspect-active');
            btnInspect.style.background = '#fff'; btnInspect.textContent = '🛑 Stop Inspect';
        }
    });

    btnPick.addEventListener('click', () => {
        if(mode === 'pick') resetMode();
        else {
            resetMode();
            mode = 'pick';
            document.body.classList.add('layer-inspect-active');
            btnPick.style.background = '#fff'; btnPick.style.color = '#000'; btnPick.textContent = '🛑 Stop Pick';
        }
    });

    btnClose.addEventListener('click', () => panel.style.display = 'none');
    
    btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(stackDataStr).then(() => {
            const old = btnCopy.textContent;
            btnCopy.textContent = '✅ Copiado!';
            setTimeout(() => btnCopy.textContent = old, 1500);
        }).catch(err => {
            const ta = document.createElement('textarea');
            ta.value = stackDataStr;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            const old = btnCopy.textContent;
            btnCopy.textContent = '✅ Copiado (fallback)!';
            setTimeout(() => btnCopy.textContent = old, 1500);
        });
    });

    document.addEventListener('mouseover', (e) => {
        if(mode !== 'inspect') return;
        if(e.target.closest('#ff-layer-inspector') || e.target.closest('#inspector-panel')) return;
        if(hoveredEl) hoveredEl.classList.remove('layer-inspect-hover');
        hoveredEl = e.target;
        hoveredEl.classList.add('layer-inspect-hover');
    });

    document.addEventListener('mouseout', (e) => {
        if(mode !== 'inspect') return;
        if(hoveredEl) hoveredEl.classList.remove('layer-inspect-hover');
    });

    document.addEventListener('click', (e) => {
        if(!mode) return;
        if(e.target.closest('#ff-layer-inspector') || e.target.closest('#inspector-panel')) return;
        
        e.preventDefault();
        e.stopPropagation();

        const x = e.clientX;
        const y = e.clientY;

        let elements = [];
        if (mode === 'pick') {
            elements = document.elementsFromPoint(x, y);
        } else {
            elements = [e.target];
        }

        generateReport(elements, x, y);
        resetMode();
    }, true);

    function createsStackingContext(el, style) {
        if(el === document.documentElement) return {creates: true, reason: 'Root element'};
        const reasons = [];
        if(style.position !== 'static' && style.zIndex !== 'auto') reasons.push(\`position:\${style.position} + z-index:\${style.zIndex}\`);
        if(style.position === 'fixed' || style.position === 'sticky') reasons.push(\`position:\${style.position}\`);
        if(style.opacity < 1) reasons.push(\`opacity:\${style.opacity}\`);
        if(style.transform !== 'none') reasons.push(\`transform:\${style.transform}\`);
        if(style.mixBlendMode !== 'normal') reasons.push(\`mix-blend-mode:\${style.mixBlendMode}\`);
        if(style.filter !== 'none') reasons.push(\`filter:\${style.filter}\`);
        if(style.isolation === 'isolate') reasons.push('isolation:isolate');
        if(style.perspective !== 'none') reasons.push(\`perspective:\${style.perspective}\`);
        if(style.willChange !== 'auto') reasons.push(\`will-change:\${style.willChange}\`);
        if(style.contain && style.contain !== 'none') reasons.push(\`contain:\${style.contain}\`);
        if(style.transformStyle === 'preserve-3d') reasons.push('transform-style:preserve-3d');
        
        if(style.zIndex !== 'auto' && el.parentElement) {
            const pStyle = window.getComputedStyle(el.parentElement);
            if(pStyle.display.includes('flex') || pStyle.display.includes('grid')) {
                reasons.push('flex/grid item + z-index');
            }
        }

        return { creates: reasons.length > 0, reason: reasons.join(', ') || 'N/A' };
    }

    function getElementPath(el) {
        if(!el) return 'N/A';
        const tag = el.tagName.toLowerCase();
        const id = el.id ? '#' + el.id : '';
        const cls = typeof el.className === 'string' && el.className ? '.' + el.className.split(' ').join('.') : '';
        return tag + id + cls;
    }

    function generateReport(elements, x, y) {
        let report = \`--- LAYER STACK DIAGNOSTIC ---\\nClicked at: X=\${x}, Y=\${y}\\n\\n\`;
        
        elements.forEach((el, index) => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            const sc = createsStackingContext(el, style);
            
            if(mode === 'pick') {
                const hue = (index * 60) % 360;
                const oldOutline = el.style.outline;
                const oldOutlineOffset = el.style.outlineOffset;
                el.style.outline = \`3px solid hsl(\${hue}, 100%, 50%)\`;
                el.style.outlineOffset = \`-\${index*2}px\`;
                setTimeout(() => {
                    el.style.outline = oldOutline;
                    el.style.outlineOffset = oldOutlineOffset;
                }, 4000);
            }

            let scParent = el.parentElement;
            let scParentPath = 'None';
            while(scParent) {
                const pStyle = window.getComputedStyle(scParent);
                if(createsStackingContext(scParent, pStyle).creates) {
                    scParentPath = getElementPath(scParent);
                    break;
                }
                scParent = scParent.parentElement;
            }

            let tagDesc = el.tagName.toUpperCase();
            if(el.id) tagDesc += \`#\${el.id}\`;
            if(typeof el.className === 'string' && el.className) tagDesc += \`.\${el.className.split(' ').join('.')}\`;

            report += \`[\${index + 1}] \${tagDesc}\\n\`;
            report += \`   GEOMETRÍA: X=\${rect.x.toFixed(1)}, Y=\${rect.y.toFixed(1)}, W=\${rect.width.toFixed(1)}, H=\${rect.height.toFixed(1)}\\n\`;
            report += \`   RENDERING\\n\`;
            report += \`     Position: \${style.position}\\n\`;
            report += \`     Z-index: \${style.zIndex}\\n\`;
            report += \`     Display: \${style.display}\\n\`;
            report += \`     Opacity: \${style.opacity}\\n\`;
            report += \`     Visibility: \${style.visibility}\\n\`;
            report += \`     Overflow: \${style.overflow}\\n\`;
            report += \`     Transform: \${style.transform}\\n\`;
            report += \`     Transform-style: \${style.transformStyle}\\n\`;
            report += \`     Filter: \${style.filter}\\n\`;
            report += \`     Mix-blend-mode: \${style.mixBlendMode}\\n\`;
            report += \`     Isolation: \${style.isolation}\\n\`;
            report += \`     Pointer-events: \${style.pointerEvents}\\n\`;
            report += \`   BACKGROUND\\n\`;
            report += \`     Color: \${style.backgroundColor}\\n\`;
            report += \`     Image: \${style.backgroundImage !== 'none' ? style.backgroundImage.substring(0,40)+'...' : 'None'}\\n\`;
            report += \`   STACKING CONTEXT\\n\`;
            report += \`     Creates SC?: \${sc.creates ? 'YES' : 'NO'}\\n\`;
            report += \`     Reason: \${sc.reason}\\n\`;
            report += \`     SC Parent: \${scParentPath}\\n\\n\`;
        });

        stackDataStr = report;
        output.textContent = report;
        panel.style.display = 'block';
    }
})();
</script>
</body>
</html>
`;

fs.writeFileSync('index.html', html + inspector);
console.log('Advanced Layer Inspector injected');
