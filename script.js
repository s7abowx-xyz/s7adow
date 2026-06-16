// دوال التشويش
function obfuscateCodeLocally(code, level = 'standard') {
    if (!code.trim()) return '// الرجاء إدخال الكود أولاً';

    if (level === 'advanced') {
        let b64 = btoa(unescape(encodeURIComponent(code)));
        return `(function(){
const _0x${Math.random().toString(36).substring(2,6)} = atob("${b64}");
const _0x${Math.random().toString(36).substring(2,6)} = new Function(_0x${Math.random().toString(36).substring(2,6)});
return _0x${Math.random().toString(36).substring(2,6)}();
})();`;
    } else if (level === 'vm') {
        let b64 = btoa(unescape(encodeURIComponent(code)));
        return `// VM Obfuscation - محمي بالكامل
const _VM0x${Math.random().toString(36).substring(2,10)} = (function(){
const __bytecode = atob("${b64}");
const __vm = new Function(__bytecode);
return __vm;
})();
_VM0x${Math.random().toString(36).substring(2,10)}();`;
    }
    let base64 = btoa(unescape(encodeURIComponent(code)));
    return `eval(atob("${base64}"));`;
}

function obfuscateCode() {
    let input = document.getElementById('inputCode').value;
    let level = document.querySelector('input[name="level"]:checked').value;
    let result = obfuscateCodeLocally(input, level);
    document.getElementById('outputCode').innerText = result;
}

function copyResult() {
    let text = document.getElementById('outputCode').innerText;
    navigator.clipboard.writeText(text);
    alert('✅ تم نسخ الكود');
}

function downloadResult() {
    let code = document.getElementById('outputCode').innerText;
    let blob = new Blob([code], { type: 'text/javascript' });
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `obfuscated_${Date.now()}.js`;
    link.click();
}

function obfuscateDemo() {
    let beforeCode = document.querySelector('#beforeCode pre code');
    let originalCode = beforeCode.innerText;
    let obfuscated = obfuscateCodeLocally(originalCode, 'vm');
    document.querySelector('#afterCode pre code').innerText = obfuscated;
}

function resetDemo() {
    let originalAfter = `(function(){
const _0x2c6c28 = atob("ZnVuY3Rpb24gY2FsY3VsYXRlVG90YWwoaXRlbXMpIHsKICAgIGxldCB0b3RhbCA9IDA7CiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZW1zLmxlbmd0aDsgaSsrKSB7CiAgICAgICAgdG90YWwgKz0gaXRlbXNbaV0ucHJpY2U7CiAgICB9CiAgICByZXR1cm4gdG90YWw7Cn0KY29uc29sZS5sb2coY2FsY3VsYXRlVG90YWwoW3twcmljZToxMH0se3ByaWNlOjIwfSx7cmljZTozMH1dKSk7");
const _0x4e1d8c = new Function(_0x2c6c28);
return _0x4e1d8c();
})();`;
    document.querySelector('#afterCode pre code').innerText = originalAfter;
}

function scrollToObfuscator() {
    document.querySelector('.obfuscator-tool').scrollIntoView({ behavior: 'smooth' });
}

// عرض رابط API
document.addEventListener('DOMContentLoaded', function() {
    let apiUrlDisplay = document.getElementById('apiUrlDisplay');
    if (apiUrlDisplay) {
        apiUrlDisplay.innerHTML = `<code>📡 API Base URL: ${window.location.origin}/api/obfuscate</code>`;
    }
    
    // معالج API للطلبات الخارجية
    if (window.location.pathname.includes('/api/')) {
        let path = window.location.pathname;
        let params = new URLSearchParams(window.location.search);
        let code = params.get('code');
        let level = params.get('level') || 'standard';
        
        if (code) {
            let result = obfuscateCodeLocally(code, level);
            document.body.innerHTML = `<pre style="background:#0a0c10;color:#00ffcc;padding:20px;margin:0;font-family:monospace;">{
  "success": true,
  "original_length": ${code.length},
  "obfuscated": "${result.replace(/"/g, '\\"')}",
  "level": "${level}"
}</pre>`;
            document.body.style.background = '#0a0c10';
        } else {
            document.body.innerHTML = `<pre style="background:#0a0c10;color:#00ffcc;padding:20px;margin:0;font-family:monospace;">{
  "name": "Obfuscator.io API",
  "version": "1.0",
  "description": "API لتشويش أكواد JavaScript",
  "endpoints": {
    "GET /api/obfuscate": {
      "params": {
        "code": "الكود المراد تشويشه",
        "level": "standard|advanced|vm"
      },
      "example": "/api/obfuscate?code=console.log('hi')&level=vm"
    }
  }
}</pre>`;
        }
    }
});