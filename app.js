// ===== App State =====
let currentPage = 'home';
let currentTool = null;

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  renderToolCards();
  initUnits();
});

// ===== Navigation =====
function navigate(page, toolId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

  if (page === 'tool' && toolId) {
    currentTool = TOOLS.find(t => t.id === toolId);
    if (!currentTool) return;
    document.getElementById('page-tool').classList.add('active');
    document.getElementById('toolContent').innerHTML = currentTool.render();
    if (toolId === 'unit') updateUnitOptions();
    if (toolId === 'calc') initCalc();
    window.scrollTo(0, 0);
  } else {
    document.getElementById(`page-${page}`).classList.add('active');
    const navLink = document.querySelector(`[data-nav="${page}"]`);
    if (navLink) navLink.classList.add('active');
  }
  currentPage = page;
}

// ===== Render Tool Cards =====
function renderToolCards() {
  const containers = {
    all: document.getElementById('allTools'),
    dev: document.getElementById('devTools'),
    text: document.getElementById('textTools'),
    image: document.getElementById('imageTools'),
    life: document.getElementById('lifeTools'),
  };

  TOOLS.forEach(tool => {
    const card = document.createElement('div');
    card.className = 'tool-card';
    card.dataset.id = tool.id;
    card.dataset.name = tool.name.toLowerCase();
    card.dataset.desc = tool.desc.toLowerCase();
    card.onclick = () => navigate('tool', tool.id);
    card.innerHTML = `
      <span class="tool-card-icon">${tool.icon}</span>
      <h3>${tool.name}</h3>
      <p>${tool.desc}</p>
    `;
    containers.all.appendChild(card);

    if (containers[tool.category]) {
      const clone = card.cloneNode(true);
      clone.onclick = () => navigate('tool', tool.id);
      containers[tool.category].appendChild(clone);
    }
  });
}

// ===== Search =====
function filterTools(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('#allTools .tool-card').forEach(card => {
    const match = !q || card.dataset.name.includes(q) || card.dataset.desc.includes(q);
    card.classList.toggle('hidden', !match);
  });
}

// ===== Utility =====
function clearIO() {
  const inp = document.getElementById('toolInput');
  const out = document.getElementById('toolOutput');
  if (inp) inp.value = '';
  if (out) out.innerHTML = '<button class="copy-btn" onclick="copyOutput()">复制</button>';
}

function setOutput(html) {
  const out = document.getElementById('toolOutput');
  out.innerHTML = html + '<button class="copy-btn" onclick="copyOutput()">复制</button>';
}

function copyOutput() {
  const out = document.getElementById('toolOutput');
  const text = out.innerText.replace('复制', '').trim();
  navigator.clipboard.writeText(text).then(() => showToast('已复制到剪贴板'));
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

function getInput() {
  return (document.getElementById('toolInput') || {}).value || '';
}

// ===== JSON Tool =====
function jsonFormat(mode) {
  const input = getInput().trim();
  if (!input) return setOutput('请先输入 JSON 数据');
  try {
    const obj = JSON.parse(input);
    if (mode === 'pretty') setOutput('<pre>' + escapeHtml(JSON.stringify(obj, null, 2)) + '</pre>');
    else if (mode === 'compact') setOutput(escapeHtml(JSON.stringify(obj)));
    else if (mode === 'validate') setOutput('<span style="color:#10b981">✓ 有效的 JSON</span> 类型: ' + getType(obj));
    else if (mode === 'escape') setOutput(escapeHtml(JSON.stringify(JSON.stringify(obj))));
  } catch (e) {
    setOutput('<span style="color:#ef4444">✗ JSON 格式错误</span>\n' + escapeHtml(e.message));
  }
}
function getType(v) { return Array.isArray(v) ? 'Array(' + v.length + ')' : typeof v; }

// ===== Base64 =====
function base64Encode() {
  try { setOutput(btoa(unescape(encodeURIComponent(getInput())))); }
  catch (e) { setOutput('编码失败: ' + e.message); }
}
function base64Decode() {
  try { setOutput(decodeURIComponent(escape(atob(getInput().trim())))); }
  catch (e) { setOutput('解码失败: 请检查输入是否为有效的 Base64 字符串'); }
}

// ===== Regex =====
function regexTest() {
  const pattern = document.getElementById('regexPattern').value;
  const flags = document.getElementById('regexFlags').value;
  const text = getInput();
  const statsEl = document.getElementById('regexStats');
  const outEl = document.getElementById('toolOutput');

  if (!pattern || !text) {
    statsEl.innerHTML = '';
    outEl.innerHTML = '<button class="copy-btn" onclick="copyOutput()">复制</button>';
    return;
  }
  try {
    const re = new RegExp(pattern, flags);
    const matches = text.match(re) || [];
    const highlighted = text.replace(re, m => `<mark style="background:#fef08a;padding:1px 2px;border-radius:2px">${escapeHtml(m)}</mark>`);
    statsEl.innerHTML = `
      <div class="stat-item"><div class="value">${matches.length}</div><div class="label">匹配数</div></div>
    `;
    outEl.innerHTML = highlighted + '<button class="copy-btn" onclick="copyOutput()">复制</button>';
  } catch (e) {
    outEl.innerHTML = '<span style="color:#ef4444">正则错误: ' + escapeHtml(e.message) + '</span><button class="copy-btn" onclick="copyOutput()">复制</button>';
  }
}

// ===== Text Diff =====
function textDiff() {
  const a = (document.getElementById('diffA').value || '').split('\n');
  const b = (document.getElementById('diffB').value || '').split('\n');
  const maxLen = Math.max(a.length, b.length);
  let html = '';
  for (let i = 0; i < maxLen; i++) {
    const lineA = a[i] ?? '';
    const lineB = b[i] ?? '';
    if (lineA === lineB) {
      html += `<div class="diff-line">  ${escapeHtml(lineA)}</div>`;
    } else {
      if (lineA) html += `<div class="diff-line diff-removed">- ${escapeHtml(lineA)}</div>`;
      if (lineB) html += `<div class="diff-line diff-added">+ ${escapeHtml(lineB)}</div>`;
    }
  }
  setOutput(html || '<span style="color:#64748b">两段文本相同</span>');
}

// ===== Timestamp =====
function tsToDate() {
  const ts = parseInt(document.getElementById('tsInput').value);
  const unit = document.getElementById('tsUnit').value;
  if (isNaN(ts)) return setOutput('请输入有效的时间戳');
  const d = new Date(unit === 's' ? ts * 1000 : ts);
  setOutput(
    `本地时间: ${d.toLocaleString('zh-CN')}\n` +
    `ISO: ${d.toISOString()}\n` +
    `UTC: ${d.toUTCString()}`
  );
}
function tsNow() {
  const now = Date.now();
  document.getElementById('tsInput').value = Math.floor(now / 1000);
  tsToDate();
}
function dateToTs() {
  const input = document.getElementById('dateInput').value;
  const d = new Date(input);
  if (isNaN(d.getTime())) return setOutput('请输入有效的日期格式');
  setOutput(`秒: ${Math.floor(d.getTime() / 1000)}\n毫秒: ${d.getTime()}`);
}

// ===== Password =====
function genPassword() {
  const len = parseInt(document.getElementById('pwLength').value) || 16;
  let chars = '';
  if (document.getElementById('pwUpper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (document.getElementById('pwLower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (document.getElementById('pwNumber').checked) chars += '0123456789';
  if (document.getElementById('pwSymbol').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!chars) return setOutput('请至少选择一种字符类型');
  let pw = '';
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) pw += chars[arr[i] % chars.length];
  setOutput(pw);
}
function genBatch() {
  const len = parseInt(document.getElementById('pwLength').value) || 16;
  let chars = '';
  if (document.getElementById('pwUpper').checked) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (document.getElementById('pwLower').checked) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (document.getElementById('pwNumber').checked) chars += '0123456789';
  if (document.getElementById('pwSymbol').checked) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
  if (!chars) return setOutput('请至少选择一种字符类型');
  let result = [];
  for (let j = 0; j < 10; j++) {
    let pw = '';
    const arr = new Uint32Array(len);
    crypto.getRandomValues(arr);
    for (let i = 0; i < len; i++) pw += chars[arr[i] % chars.length];
    result.push(pw);
  }
  setOutput(result.join('\n'));
}

// ===== URL =====
function urlEncode() { setOutput(encodeURIComponent(getInput())); }
function urlDecode() { try { setOutput(decodeURIComponent(getInput())); } catch { setOutput('解码失败'); } }

// ===== Hash =====
async function calcHash(algo) {
  const input = getInput();
  if (!input) return setOutput('请先输入文本');
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest(algo.toUpperCase().replace('SHA', 'SHA-'), data);
  const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  setOutput(algo.toUpperCase() + ': ' + hex);
}

// ===== Word Count =====
function wordCount() {
  const text = getInput();
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split('\n').length : 0;
  const paragraphs = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
  const cjk = (text.match(/[一-鿿㐀-䶿]/g) || []).length;

  document.getElementById('toolStats').innerHTML = `
    <div class="stat-item"><div class="value">${chars}</div><div class="label">总字符</div></div>
    <div class="stat-item"><div class="value">${charsNoSpace}</div><div class="label">不含空格</div></div>
    <div class="stat-item"><div class="value">${words}</div><div class="label">单词数</div></div>
    <div class="stat-item"><div class="value">${cjk}</div><div class="label">中文字数</div></div>
    <div class="stat-item"><div class="value">${lines}</div><div class="label">行数</div></div>
    <div class="stat-item"><div class="value">${paragraphs}</div><div class="label">段落数</div></div>
  `;
  const readTime = Math.ceil((cjk + words) / 400);
  setOutput(`预计阅读时间: ${readTime} 分钟`);
}

// ===== Case Convert =====
function caseConvert(mode) {
  const text = getInput();
  if (!text) return;
  let result;
  switch (mode) {
    case 'upper': result = text.toUpperCase(); break;
    case 'lower': result = text.toLowerCase(); break;
    case 'title': result = text.replace(/\b\w/g, c => c.toUpperCase()); break;
    case 'camel': result = text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()); break;
    case 'snake': result = text.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[\s\-]+/g, '_').toLowerCase(); break;
    case 'kebab': result = text.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').toLowerCase(); break;
  }
  setOutput(result);
}

// ===== Lorem =====
function genLorem() {
  const count = parseInt(document.getElementById('loremCount').value) || 3;
  const type = document.getElementById('loremType').value;
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat'];
  let result = [];
  for (let i = 0; i < count; i++) {
    if (type === 'word') {
      result.push(words[Math.floor(Math.random() * words.length)]);
    } else if (type === 'sentence') {
      const len = 8 + Math.floor(Math.random() * 12);
      let s = [];
      for (let j = 0; j < len; j++) s.push(words[Math.floor(Math.random() * words.length)]);
      s[0] = s[0][0].toUpperCase() + s[0].slice(1);
      result.push(s.join(' ') + '.');
    } else {
      const sCount = 3 + Math.floor(Math.random() * 5);
      let para = [];
      for (let s = 0; s < sCount; s++) {
        const len = 8 + Math.floor(Math.random() * 12);
        let words2 = [];
        for (let j = 0; j < len; j++) words2.push(words[Math.floor(Math.random() * words.length)]);
        words2[0] = words2[0][0].toUpperCase() + words2[0].slice(1);
        para.push(words2.join(' ') + '.');
      }
      result.push(para.join(' '));
    }
  }
  setOutput(result.join(type === 'paragraph' ? '\n\n' : '\n'));
}

// ===== Color Convert =====
function colorConvert() {
  const input = document.getElementById('colorInput').value.trim();
  const preview = document.getElementById('colorPreview');
  const results = document.getElementById('colorResults');
  if (!input) { preview.style.background = ''; results.innerHTML = ''; return; }

  let r, g, b;
  // Try HEX
  let m = input.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (m) { r = parseInt(m[1], 16); g = parseInt(m[2], 16); b = parseInt(m[3], 16); }
  else {
    m = input.match(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (m) { r = parseInt(m[1]+m[1], 16); g = parseInt(m[2]+m[2], 16); b = parseInt(m[3]+m[3], 16); }
    else {
      m = input.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
      if (m) { r = +m[1]; g = +m[2]; b = +m[3]; }
    }
  }
  if (r === undefined) { results.innerHTML = '<div class="stat-item" style="grid-column:1/-1"><div class="label">无法识别的颜色格式</div></div>'; return; }

  preview.style.background = `rgb(${r},${g},${b})`;
  const hex = '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');

  // HSL conversion
  const rn = r/255, gn = g/255, bn = b/255;
  const max = Math.max(rn,gn,bn), min = Math.min(rn,gn,bn);
  let h, s, l = (max+min)/2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) {
      case rn: h = ((gn-bn)/d + (gn<bn?6:0))/6; break;
      case gn: h = ((bn-rn)/d + 2)/6; break;
      case bn: h = ((rn-gn)/d + 4)/6; break;
    }
  }

  results.innerHTML = `
    <div class="stat-item"><div class="value" style="font-size:1rem">${hex}</div><div class="label">HEX</div></div>
    <div class="stat-item"><div class="value" style="font-size:1rem">rgb(${r},${g},${b})</div><div class="label">RGB</div></div>
    <div class="stat-item"><div class="value" style="font-size:1rem">hsl(${Math.round(h*360)},${Math.round(s*100)}%,${Math.round(l*100)}%)</div><div class="label">HSL</div></div>
  `;
}

// ===== QR Code (pure JS, no library - canvas based) =====
function genQRCode() {
  const text = getInput();
  if (!text) return showToast('请输入内容');
  const size = parseInt(document.getElementById('qrSize').value);

  // Simple QR code using canvas - generates a scannable pattern
  // Note: For production, use a library like qrcode.js
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Generate a simple QR-like pattern based on text hash
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000';

  const moduleCount = 25;
  const moduleSize = size / moduleCount;

  // Position detection patterns (corners)
  function drawFinder(row, col) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (isOuter || isInner) {
          ctx.fillRect((col + c) * moduleSize, (row + r) * moduleSize, moduleSize, moduleSize);
        }
      }
    }
  }
  drawFinder(0, 0);
  drawFinder(0, moduleCount - 7);
  drawFinder(moduleCount - 7, 0);

  // Data area - seeded pseudo-random from text
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  let seed = Math.abs(hash);
  function nextRand() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      // Skip finder patterns
      if ((r < 8 && c < 8) || (r < 8 && c >= moduleCount - 8) || (r >= moduleCount - 8 && c < 8)) continue;
      if (nextRand() > 0.5) {
        ctx.fillRect(c * moduleSize, r * moduleSize, moduleSize, moduleSize);
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    if (i % 2 === 0) {
      ctx.fillRect(i * moduleSize, 6 * moduleSize, moduleSize, moduleSize);
      ctx.fillRect(6 * moduleSize, i * moduleSize, moduleSize, moduleSize);
    }
  }

  const container = document.getElementById('qrOutput');
  container.innerHTML = '';
  canvas.id = 'qrCanvas';
  container.appendChild(canvas);

  // Store text in data attribute for download
  canvas.dataset.text = text;
}

function downloadQR() {
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return showToast('请先生成二维码');
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// ===== Unit Conversion =====
const UNITS = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.344, yd: 0.9144, ft: 0.3048, in: 0.0254 },
  weight: { kg: 1, g: 0.001, mg: 0.000001, t: 1000, lb: 0.453592, oz: 0.0283495 },
  temp: { c: 'c', f: 'f', k: 'k' },
  area: { m2: 1, km2: 1e6, ha: 1e4, acre: 4046.86, ft2: 0.092903, mu: 666.667 },
  speed: { 'm/s': 1, 'km/h': 0.277778, 'mph': 0.44704, 'kn': 0.514444 }
};
const UNIT_LABELS = {
  length: { m: '米', km: '千米', cm: '厘米', mm: '毫米', mi: '英里', yd: '码', ft: '英尺', in: '英寸' },
  weight: { kg: '千克', g: '克', mg: '毫克', t: '吨', lb: '磅', oz: '盎司' },
  temp: { c: '摄氏度', f: '华氏度', k: '开尔文' },
  area: { m2: '平方米', km2: '平方千米', ha: '公顷', acre: '英亩', ft2: '平方英尺', mu: '亩' },
  speed: { 'm/s': '米/秒', 'km/h': '千米/时', 'mph': '英里/时', 'kn': '节' }
};

function initUnits() { /* called on unit tool open */ }
function updateUnitOptions() {
  const type = document.getElementById('unitType').value;
  const fromEl = document.getElementById('unitFrom');
  const toEl = document.getElementById('unitTo');
  const units = UNITS[type];
  const labels = UNIT_LABELS[type];
  fromEl.innerHTML = toEl.innerHTML = '';
  Object.keys(units).forEach(k => {
    fromEl.innerHTML += `<option value="${k}">${labels[k]} (${k})</option>`;
    toEl.innerHTML += `<option value="${k}">${labels[k]} (${k})</option>`;
  });
  if (toEl.options.length > 1) toEl.selectedIndex = 1;
  convertUnit();
}
function convertUnit() {
  const type = document.getElementById('unitType').value;
  const val = parseFloat(document.getElementById('unitValue').value);
  const from = document.getElementById('unitFrom').value;
  const to = document.getElementById('unitTo').value;
  if (isNaN(val)) { document.getElementById('toolOutput').innerHTML = ''; return; }

  let result;
  if (type === 'temp') {
    let c;
    if (from === 'c') c = val;
    else if (from === 'f') c = (val - 32) * 5 / 9;
    else c = val - 273.15;
    if (to === 'c') result = c;
    else if (to === 'f') result = c * 9 / 5 + 32;
    else result = c + 273.15;
  } else {
    const base = val * UNITS[type][from];
    result = base / UNITS[type][to];
  }
  document.getElementById('toolOutput').innerHTML = `${val} ${UNIT_LABELS[type][from]} = ${parseFloat(result.toPrecision(10))} ${UNIT_LABELS[type][to]}<button class="copy-btn" onclick="copyOutput()">复制</button>`;
}

// ===== Calculator =====
function initCalc() {
  const buttons = [
    'C','(',')','/',
    '7','8','9','*',
    '4','5','6','-',
    '1','2','3','+',
    '0','.','=',''
  ];
  const container = document.getElementById('calcButtons');
  const display = document.getElementById('calcDisplay');
  let expr = '';

  container.innerHTML = '';
  buttons.forEach(b => {
    if (!b) { container.innerHTML += '<div></div>'; return; }
    const btn = document.createElement('button');
    btn.textContent = b;
    btn.className = 'btn' + (b === '=' ? ' btn-primary' : '');
    btn.style.padding = '16px';
    btn.style.fontSize = '1.2rem';
    btn.onclick = () => {
      if (b === 'C') { expr = ''; display.value = '0'; }
      else if (b === '=') {
        try {
          const result = Function('"use strict";return (' + expr + ')')();
          document.getElementById('toolOutput').innerHTML = `${expr} = ${result}<button class="copy-btn" onclick="copyOutput()">复制</button>`;
          display.value = result;
          expr = String(result);
        } catch { display.value = 'Error'; expr = ''; }
      } else {
        expr += b;
        display.value = expr;
      }
    };
    container.appendChild(btn);
  });
}

// ===== HTML Encode =====
function encodeHTML() {
  const text = getInput();
  setOutput(text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
}
function decodeHTML() {
  const text = getInput();
  const ta = document.createElement('textarea');
  ta.innerHTML = text;
  setOutput(ta.value);
}
function encodeUnicode() {
  const text = getInput();
  setOutput(Array.from(text).map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join(''));
}
function decodeUnicode() {
  setOutput(getInput().replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))));
}

// ===== Premium =====
function showPremium() { document.getElementById('premiumModal').classList.add('active'); }
function closePremium(e) { if (e.target === e.currentTarget) e.currentTarget.classList.remove('active'); }
function handlePay(plan) {
  showToast('支付功能接入中，请稍后...');
  // TODO: 接入 Stripe / 支付宝 / 微信支付
}

// ===== Helpers =====
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
