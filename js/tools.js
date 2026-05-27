// ===== Tool Registry =====
const TOOLS = [
  {
    id: 'json',
    name: 'JSON 格式化',
    desc: '格式化、压缩、验证 JSON 数据',
    icon: '{ }',
    category: 'dev',
    render: () => `
      <h2>JSON 格式化</h2>
      <p class="tool-desc">粘贴 JSON 数据，自动格式化或压缩</p>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="jsonFormat('pretty')">格式化</button>
        <button class="btn" onclick="jsonFormat('compact')">压缩</button>
        <button class="btn" onclick="jsonFormat('validate')">验证</button>
        <button class="btn" onclick="jsonFormat('escape')">转义</button>
        <button class="btn" onclick="clearIO()">清空</button>
      </div>
      <label>输入</label>
      <textarea id="toolInput" placeholder='粘贴 JSON 数据，例如 {"name":"test"}'></textarea>
      <label>输出</label>
      <div class="output-box" id="toolOutput"><button class="copy-btn" onclick="copyOutput()">复制</button></div>
    `
  },
  {
    id: 'base64',
    name: 'Base64 编解码',
    desc: 'Base64 编码和解码文本与文件',
    icon: 'B64',
    category: 'dev',
    render: () => `
      <h2>Base64 编解码</h2>
      <p class="tool-desc">对文本进行 Base64 编码或解码</p>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="base64Encode()">编码</button>
        <button class="btn" onclick="base64Decode()">解码</button>
        <button class="btn" onclick="clearIO()">清空</button>
      </div>
      <label>输入</label>
      <textarea id="toolInput" placeholder="输入文本或 Base64 字符串"></textarea>
      <label>输出</label>
      <div class="output-box" id="toolOutput"><button class="copy-btn" onclick="copyOutput()">复制</button></div>
    `
  },
  {
    id: 'regex',
    name: '正则测试',
    desc: '实时测试正则表达式，高亮匹配结果',
    icon: '.*',
    category: 'dev',
    render: () => `
      <h2>正则表达式测试</h2>
      <p class="tool-desc">输入正则表达式和测试文本，实时查看匹配结果</p>
      <div class="tool-row">
        <div><label>正则表达式</label><input type="text" id="regexPattern" placeholder="例如: \\d+" oninput="regexTest()"></div>
        <div><label>标志</label><input type="text" id="regexFlags" placeholder="g i m" value="g" oninput="regexTest()" style="max-width:100px"></div>
      </div>
      <label>测试文本</label>
      <textarea id="toolInput" placeholder="输入要测试的文本" oninput="regexTest()"></textarea>
      <div class="stats-grid" id="regexStats"></div>
      <label>匹配结果</label>
      <div class="output-box" id="toolOutput"><button class="copy-btn" onclick="copyOutput()">复制</button></div>
    `
  },
  {
    id: 'diff',
    name: '文本对比',
    desc: '对比两段文本的差异',
    icon: '!=',
    category: 'dev',
    render: () => `
      <h2>文本差异对比</h2>
      <p class="tool-desc">对比两段文本，找出不同之处</p>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="textDiff()">对比</button>
        <button class="btn" onclick="clearIO()">清空</button>
      </div>
      <div class="diff-container">
        <div><label>文本 A</label><textarea id="diffA" placeholder="原始文本" style="min-height:200px"></textarea></div>
        <div><label>文本 B</label><textarea id="diffB" placeholder="修改后文本" style="min-height:200px"></textarea></div>
      </div>
      <label style="margin-top:16px">对比结果</label>
      <div class="output-box" id="toolOutput" style="max-height:none"></div>
    `
  },
  {
    id: 'timestamp',
    name: '时间戳转换',
    desc: '时间戳与日期互转，支持多时区',
    icon: '&#x23F0;',
    category: 'dev',
    render: () => `
      <h2>时间戳转换</h2>
      <p class="tool-desc">时间戳与可读日期时间互转</p>
      <div class="tool-row">
        <div><label>时间戳</label><input type="text" id="tsInput" placeholder="例如: 1700000000"></div>
        <div><label>单位</label><select id="tsUnit"><option value="s">秒</option><option value="ms">毫秒</option></select></div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="tsToDate()">时间戳 → 日期</button>
        <button class="btn" onclick="tsNow()">当前时间戳</button>
      </div>
      <div class="tool-row">
        <div><label>日期时间</label><input type="text" id="dateInput" placeholder="例如: 2024-01-15 12:30:00"></div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="dateToTs()">日期 → 时间戳</button>
      </div>
      <label>输出</label>
      <div class="output-box" id="toolOutput"><button class="copy-btn" onclick="copyOutput()">复制</button></div>
    `
  },
  {
    id: 'password',
    name: '密码生成器',
    desc: '生成安全随机密码，可自定义规则',
    icon: '&#x1F512;',
    category: 'dev',
    render: () => `
      <h2>密码生成器</h2>
      <p class="tool-desc">生成高强度随机密码</p>
      <div class="tool-row">
        <div><label>密码长度</label><input type="number" id="pwLength" value="16" min="4" max="128"></div>
      </div>
      <div class="toggle-group">
        <label class="toggle-item"><input type="checkbox" id="pwUpper" checked> 大写字母</label>
        <label class="toggle-item"><input type="checkbox" id="pwLower" checked> 小写字母</label>
        <label class="toggle-item"><input type="checkbox" id="pwNumber" checked> 数字</label>
        <label class="toggle-item"><input type="checkbox" id="pwSymbol" checked> 特殊符号</label>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="genPassword()">生成密码</button>
        <button class="btn" onclick="genBatch()">批量生成 10 个</button>
      </div>
      <label>输出</label>
      <div class="output-box" id="toolOutput"><button class="copy-btn" onclick="copyOutput()">复制</button></div>
    `
  },
  {
    id: 'url',
    name: 'URL 编解码',
    desc: 'URL 编码和解码',
    icon: 'URL',
    category: 'dev',
    render: () => `
      <h2>URL 编解码</h2>
      <p class="tool-desc">对 URL 或参数进行编码和解码</p>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="urlEncode()">编码</button>
        <button class="btn" onclick="urlDecode()">解码</button>
        <button class="btn" onclick="clearIO()">清空</button>
      </div>
      <label>输入</label>
      <textarea id="toolInput" placeholder="输入 URL 或编码后的字符串"></textarea>
      <label>输出</label>
      <div class="output-box" id="toolOutput"><button class="copy-btn" onclick="copyOutput()">复制</button></div>
    `
  },
  {
    id: 'hash',
    name: '哈希计算',
    desc: '计算文本的 MD5 / SHA 哈希值',
    icon: '#',
    category: 'dev',
    render: () => `
      <h2>哈希计算</h2>
      <p class="tool-desc">计算文本的加密哈希值</p>
      <label>输入文本</label>
      <textarea id="toolInput" placeholder="输入要计算哈希的文本"></textarea>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="calcHash('sha256')">SHA-256</button>
        <button class="btn" onclick="calcHash('sha1')">SHA-1</button>
        <button class="btn" onclick="calcHash('sha512')">SHA-512</button>
      </div>
      <label>输出</label>
      <div class="output-box" id="toolOutput"><button class="copy-btn" onclick="copyOutput()">复制</button></div>
    `
  },
  {
    id: 'wordcount',
    name: '字数统计',
    desc: '统计文本字数、字符数、行数等',
    icon: '#',
    category: 'text',
    render: () => `
      <h2>字数统计</h2>
      <p class="tool-desc">实时统计文本的各项数据</p>
      <label>输入文本</label>
      <textarea id="toolInput" placeholder="在此输入或粘贴文本，统计数据将实时更新" oninput="wordCount()"></textarea>
      <div class="stats-grid" id="toolStats"></div>
      <label>详细统计</label>
      <div class="output-box" id="toolOutput"></div>
    `
  },
  {
    id: 'case',
    name: '文本大小写转换',
    desc: 'UPPER / lower / Title / camelCase 转换',
    icon: 'Aa',
    category: 'text',
    render: () => `
      <h2>文本大小写转换</h2>
      <p class="tool-desc">将文本转换为各种大小写格式</p>
      <label>输入文本</label>
      <textarea id="toolInput" placeholder="输入要转换的文本"></textarea>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="caseConvert('upper')">UPPERCASE</button>
        <button class="btn" onclick="caseConvert('lower')">lowercase</button>
        <button class="btn" onclick="caseConvert('title')">Title Case</button>
        <button class="btn" onclick="caseConvert('camel')">camelCase</button>
        <button class="btn" onclick="caseConvert('snake')">snake_case</button>
        <button class="btn" onclick="caseConvert('kebab')">kebab-case</button>
      </div>
      <label>输出</label>
      <div class="output-box" id="toolOutput"><button class="copy-btn" onclick="copyOutput()">复制</button></div>
    `
  },
  {
    id: 'lorem',
    name: 'Lorem Ipsum',
    desc: '生成随机占位文本',
    icon: 'Lp',
    category: 'text',
    render: () => `
      <h2>Lorem Ipsum 生成器</h2>
      <p class="tool-desc">生成随机占位文本，用于设计排版</p>
      <div class="tool-row">
        <div><label>段落数</label><input type="number" id="loremCount" value="3" min="1" max="20"></div>
        <div><label>类型</label><select id="loremType"><option value="paragraph">段落</option><option value="sentence">句子</option><option value="word">词语</option></select></div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="genLorem()">生成</button>
        <button class="btn" onclick="copyOutput()">复制</button>
      </div>
      <div class="output-box" id="toolOutput"></div>
    `
  },
  {
    id: 'color',
    name: '颜色转换',
    desc: 'HEX / RGB / HSL 颜色互转',
    icon: '&#x1F3A8;',
    category: 'dev',
    render: () => `
      <h2>颜色转换</h2>
      <p class="tool-desc">在 HEX、RGB、HSL 格式之间转换颜色</p>
      <div class="tool-row">
        <div><label>输入颜色</label><input type="text" id="colorInput" placeholder="#6366f1 或 rgb(99,102,241) 或 hsl(239,84%,67%)" oninput="colorConvert()"></div>
      </div>
      <div class="color-preview" id="colorPreview"></div>
      <div class="stats-grid" id="colorResults"></div>
    `
  },
  {
    id: 'qrcode',
    name: '二维码生成',
    desc: '输入文本或链接生成二维码',
    icon: '&#x25A3;',
    category: 'life',
    render: () => `
      <h2>二维码生成器</h2>
      <p class="tool-desc">输入文本或 URL，生成二维码图片</p>
      <label>内容</label>
      <textarea id="toolInput" placeholder="输入文本或网址" style="min-height:80px"></textarea>
      <div class="tool-row">
        <div><label>尺寸</label><select id="qrSize"><option value="200">200 x 200</option><option value="300" selected>300 x 300</option><option value="400">400 x 400</option></select></div>
      </div>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="genQRCode()">生成二维码</button>
        <button class="btn" onclick="downloadQR()">下载图片</button>
      </div>
      <div id="qrOutput"></div>
    `
  },
  {
    id: 'unit',
    name: '单位换算',
    desc: '长度、重量、温度、面积等单位转换',
    icon: '&#x1F4CF;',
    category: 'life',
    render: () => `
      <h2>单位换算</h2>
      <p class="tool-desc">常见单位之间的快速转换</p>
      <div class="tool-row">
        <div><label>类别</label><select id="unitType" onchange="updateUnitOptions()"><option value="length">长度</option><option value="weight">重量</option><option value="temp">温度</option><option value="area">面积</option><option value="speed">速度</option></select></div>
      </div>
      <div class="tool-row">
        <div><label>数值</label><input type="number" id="unitValue" placeholder="输入数值" oninput="convertUnit()"></div>
        <div><label>从</label><select id="unitFrom" onchange="convertUnit()"></select></div>
        <div><label>到</label><select id="unitTo" onchange="convertUnit()"></select></div>
      </div>
      <label>结果</label>
      <div class="output-box" id="toolOutput"></div>
    `
  },
  {
    id: 'calc',
    name: '计算器',
    desc: '支持科学计算的在线计算器',
    icon: '&#x1F9EE;',
    category: 'life',
    render: () => `
      <h2>科学计算器</h2>
      <p class="tool-desc">支持基本运算和科学函数</p>
      <input type="text" id="calcDisplay" style="font-size:1.5rem;text-align:right;padding:16px;margin-bottom:12px" readonly value="0">
      <div id="calcButtons" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"></div>
      <div class="output-box" id="toolOutput" style="margin-top:12px;min-height:40px"></div>
    `
  },
  {
    id: 'encoding',
    name: '编码转换',
    desc: 'Unicode / HTML Entity / Punycode 转换',
    icon: '&#x2318;',
    category: 'dev',
    render: () => `
      <h2>编码转换</h2>
      <p class="tool-desc">在不同编码格式之间转换文本</p>
      <label>输入</label>
      <textarea id="toolInput" placeholder="输入文本"></textarea>
      <div class="tool-actions">
        <button class="btn btn-primary" onclick="encodeHTML()">HTML 实体编码</button>
        <button class="btn" onclick="decodeHTML()">HTML 实体解码</button>
        <button class="btn" onclick="encodeUnicode()">Unicode 编码</button>
        <button class="btn" onclick="decodeUnicode()">Unicode 解码</button>
      </div>
      <label>输出</label>
      <div class="output-box" id="toolOutput"><button class="copy-btn" onclick="copyOutput()">复制</button></div>
    `
  },
];
