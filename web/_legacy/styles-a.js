/* 风格 1–10 */
window.STYLES = window.STYLES || [];

/* 01 n8n 深色节点编辑器 */
window.STYLES.push({
  n: 1, id: "n8n-dark", name: "01 n8n 深色编辑器",
  tag: "端口 + 贝塞尔 + 点阵网格：能直接「执行」的卡片流",
  family: "lr", dir: "lr", edge: "bezier", inspector: "right", bg: "grid",
  nodeW: 216, nodeH: 128, gapX: 62, gapY: 30,
  flags: { ports: true, msg: true, tasks: false, foot: true },
  css: `&{--bg:#161719;--ink:#e9eaee;--muted:#9aa0ad;--line:#34363c;--panel:#202124;
      --node-bg:#232427;--node-border:#34363c;--radius:8px;--accent:#ff6d5a;--ok:#4ade80;--run:#fbbf24;--err:#f87171;
      --shadow:0 6px 18px -8px rgba(0,0,0,.9);--font:Inter,-apple-system,"Segoe UI","PingFang SC",sans-serif;
      --bg-image:radial-gradient(circle,#2c2e34 1px,transparent 1px);--bg-size:22px 22px}
    & .gnode{padding:12px 13px 11px}
    & .gnode:hover{background:#2a2b2f}
    & .g-role{color:#8f939e;font-size:10px;letter-spacing:.12em}
    & .g-name{font-size:13px;font-weight:600;color:#f2f3f6}
    & .g-msg{color:#9aa0ad;font-size:11px}
    & .g-status{color:#9aa0ad;font-size:10.5px}
    & .g-foot{font-family:var(--mono);font-size:10px;color:#7e838f;border-top:1px solid #2e3035;padding-top:6px}
    & .wire{stroke:#4a4d57;stroke-width:1.8}
    & .wire.hot,& .wire.flow{stroke:#ff6d5a}
    & .wire-label{background:#1b1c1f;border-color:#35373d;color:#a9aeba}
    & .wire-label b{color:#ff8b7b;font-weight:600}
    & .insp{background:#1e1f22}
    & .gnode[data-kind="main"]{border-color:#4b4e58;box-shadow:0 0 0 1px #2b2d33,0 14px 30px -18px #000}`,
});

/* 02 浅色工作台 */
window.STYLES.push({
  n: 2, id: "n8n-light", name: "02 浅色工作台",
  tag: "同一套卡片流换成白天模式：白卡片、灰边框、一点点靛蓝",
  family: "lr", dir: "lr", edge: "bezier", inspector: "right", bg: "grid",
  nodeW: 216, nodeH: 122, gapX: 60, gapY: 32,
  flags: { ports: true, msg: true, tasks: false, foot: true },
  css: `&{--bg:#f6f7f9;--ink:#171a21;--muted:#6b7280;--line:#d6dae1;--panel:#ffffff;
      --node-bg:#ffffff;--node-border:#dfe3e9;--radius:10px;--accent:#4f46e5;--ok:#16a34a;--run:#d97706;--err:#dc2626;
      --shadow:0 1px 2px rgba(16,24,40,.06),0 10px 24px -18px rgba(16,24,40,.35);
      --bg-image:radial-gradient(circle,#dfe3ea 1px,transparent 1px);--bg-size:24px 24px}
    & .gnode{background:#fff}
    & .gnode:hover{border-color:#b9c0cd;box-shadow:0 2px 6px rgba(16,24,40,.08)}
    & .g-role{color:#8b93a2;font-size:10px;letter-spacing:.12em}
    & .g-name{color:#12151c}
    & .g-msg{color:#63707f}
    & .g-foot{color:#8b93a2;border-top:1px solid #eef1f5;padding-top:6px}
    & .wire{stroke:#b9c2d0}
    & .wire.hot,& .wire.flow{stroke:#4f46e5}
    & .wire-label{background:#fff;border-color:#e3e7ee;color:#6b7280}
    & .wire-label b{color:#4f46e5;font-weight:600}
    & .insp{background:#fff;box-shadow:0 20px 50px -30px rgba(16,24,40,.5)}
    & .insp h2{color:#12151c}`,
});

/* 03 蓝图 / CAD */
window.STYLES.push({
  n: 3, id: "blueprint", name: "03 蓝图 CAD",
  tag: "制图语言：单色线稿、正交走线、尺寸刻度与坐标网格",
  family: "layers", dir: "td", edge: "ortho", inspector: "right", bg: "grid",
  nodeW: 206, nodeH: 96, gapX: 44, gapY: 52,
  flags: { msg: false, tasks: true, foot: true, ports: true },
  css: `&{--bg:#0a2540;--ink:#cfe6ff;--muted:#7ea9d6;--line:#2f6fa8;--panel:#0d2c4b;
      --node-bg:rgba(12,45,77,.55);--node-border:#4e9ad6;--radius:2px;--accent:#7fd1ff;--ok:#8ee6c0;--run:#ffd479;--err:#ff8a8a;
      --shadow:none;--mono:"JetBrains Mono",Consolas,monospace;--font:var(--mono);
      --bg-image:linear-gradient(#123a5c 1px,transparent 1px),linear-gradient(90deg,#123a5c 1px,transparent 1px);
      --bg-size:24px 24px,24px 24px}
    & .gnode{border-style:solid;letter-spacing:.02em}
    & .gnode::before,& .gnode::after{content:"";position:absolute;width:6px;height:6px;border:1px solid #7fd1ff}
    & .gnode::before{left:-1px;top:-1px;border-right:0;border-bottom:0}
    & .gnode::after{right:-1px;bottom:-1px;border-left:0;border-top:0}
    & .g-name{font-size:12px;font-weight:600;letter-spacing:.04em}
    & .g-role{color:#8fc2ec;font-size:9.5px;letter-spacing:.18em}
    & .g-status{font-size:10px;color:#9cc8ea}
    & .g-task{font-size:9px;border-color:#2f6091;color:#9cc8ea;border-radius:0}
    & .g-foot{font-size:9.5px;color:#7ea9d6;border-top:1px dashed #2f6091;padding-top:5px}
    & .wire{stroke:#5fa6d8;stroke-width:1.1}
    & .wire.hot,& .wire.flow{stroke:#7fd1ff;stroke-width:2}
    & .wire-label{background:#0a2540;border:1px solid #2f6fa8;color:#a8cfee;border-radius:0;font-size:9.5px}
    & .wire-label b{color:#7fd1ff}
    & .hud{border:1px solid #2f6fa8;padding:4px 9px;border-radius:0;color:#9cc8ea}
    & .insp{border-radius:0;border-color:#2f6fa8}
    & .insp h2{font-size:14px;letter-spacing:.04em}`,
});

/* 04 终端 */
window.STYLES.push({
  n: 4, id: "terminal", name: "04 终端",
  tag: "把任务图当进程树看：等宽字、ASCII 走线、荧光绿状态",
  family: "layers", dir: "td", edge: "ortho", inspector: "right", bg: null,
  nodeW: 214, nodeH: 100, gapX: 40, gapY: 48,
  flags: { msg: true, tasks: false, foot: true },
  css: `&{--bg:#050706;--ink:#b8ffd0;--muted:#4f8f68;--line:#1d4a30;--panel:#071009;
      --node-bg:#071009;--node-border:#1d4a30;--radius:2px;--accent:#39ff88;--ok:#39ff88;--run:#ffd479;--err:#ff6b6b;
      --shadow:none;--mono:"JetBrains Mono",Consolas,monospace;--font:var(--mono);
      --bg-image:repeating-linear-gradient(0deg,rgba(57,255,136,.045),rgba(57,255,136,.045) 1px,transparent 1px,transparent 3px)}
    & .gnode{border-style:dashed}
    & .gnode::before{content:"› ";color:#39ff88}
    & .g-role{color:#3f7a58;font-size:9.5px;letter-spacing:.16em}
    & .g-name{font-size:12px;color:#d6ffe6}
    & .g-name::after{content:"_";animation:blink 1.1s steps(1) infinite;color:#39ff88}
    & .g-msg{color:#5c9a76;font-size:10.5px}
    & .g-msg::before{content:"// ";color:#2f5b41}
    & .g-status{font-size:10px;color:#5c9a76;text-transform:lowercase}
    & .g-foot{font-size:9.5px;color:#3f7a58;border-top:1px dotted #1d4a30;padding-top:5px}
    & .wire{stroke:#1f5334;stroke-dasharray:4 4}
    & .wire.hot,& .wire.flow{stroke:#39ff88}
    & .wire-label{background:#04100a;border-color:#1d4a30;color:#5c9a76;border-radius:0;font-family:var(--mono)}
    & .wire-label b{color:#39ff88}
    & .hint{color:#3f7a58;background:#04100a}
    & .insp{background:#06120b;border-style:dashed}
    & .stat{background:#04100a}
    @keyframes blink{50%{opacity:0}}
    & .hud b{color:#39ff88}`,
});

/* 05 瑞士海报 */
window.STYLES.push({
  n: 5, id: "swiss", name: "05 瑞士海报",
  tag: "没圆角、没阴影：字号对比 + 发丝线 + 一个红点",
  family: "layers", dir: "td", edge: "straight", inspector: "bottom", bg: null,
  nodeW: 210, nodeH: 98, gapX: 46, gapY: 44,
  flags: { msg: false, tasks: true, foot: true },
  css: `&{--bg:#f1efe9;--ink:#111110;--muted:#6b6a66;--line:#111110;--panel:#f7f5f0;
      --node-bg:#f7f5f0;--node-border:#111110;--radius:0;--accent:#e0301e;--ok:#111110;--run:#e0301e;--err:#e0301e;
      --shadow:none;--font:"Helvetica Neue",Helvetica,Arial,"PingFang SC",sans-serif}
    & .gnode{padding:11px 12px;border-width:1px}
    & .gnode::before{content:"";position:absolute;left:12px;top:0;width:22px;height:3px;background:#111110}
    & .g-role{color:#111110;font-size:9px;letter-spacing:.22em;font-weight:600}
    & .g-name{font-size:13.5px;font-weight:700;letter-spacing:-.01em;margin-top:4px}
    & .g-status{font-size:9.5px;letter-spacing:.08em;text-transform:uppercase}
    & .g-task{font-size:9px;border-color:#111110;border-radius:0;color:#111110}
    & .g-foot{font-size:9.5px;border-top:1px solid #111110;padding-top:5px;color:#6b6a66}
    & .wire{stroke:#111110;stroke-width:1}
    & .wire.hot,& .wire.flow{stroke:#e0301e;stroke-width:1.6}
    & .wire-label{background:#f1efe9;border-color:#111110;border-radius:0;color:#111110;font-size:9.5px}
    & .wire-label b{color:#e0301e;font-weight:700}
    & .insp{border-radius:0;border-color:#111110;background:#f7f5f0;left:50%;top:auto;bottom:18px;right:auto;
      transform:translateX(-50%);width:min(560px,90%)}
    & .insp h2{font-size:20px;letter-spacing:-.02em}
    & .stat{background:transparent;border:0;border-top:1px solid #111110;border-radius:0}
    & .hint{background:transparent;border-color:#111110;color:#111110;border-radius:0}`,
});

/* 06 液态玻璃 */
window.STYLES.push({
  n: 6, id: "liquid-glass", name: "06 液态玻璃",
  tag: "半透明材质叠在流动的光斑上：适合「正在发生」的流程图",
  family: "lr", dir: "lr", edge: "bezier", inspector: "right", bg: null,
  nodeW: 214, nodeH: 110, gapX: 58, gapY: 30,
  flags: { msg: true, tasks: false, foot: true, ports: true },
  css: `&{--bg:#0b1020;--ink:#eaf2ff;--muted:#a9b8d6;--line:rgba(255,255,255,.22);--panel:rgba(18,26,48,.55);
      --node-bg:linear-gradient(160deg,rgba(255,255,255,.14),rgba(255,255,255,.05));--node-border:rgba(255,255,255,.26);
      --radius:18px;--accent:#8ab4ff;--ok:#7ff0c2;--run:#ffd88a;--err:#ff9b9b;
      --shadow:0 18px 44px -22px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.22)}
    &{background:
      radial-gradient(680px 420px at 18% 12%,rgba(120,90,255,.42),transparent 62%),
      radial-gradient(560px 380px at 84% 78%,rgba(0,190,255,.32),transparent 60%),
      radial-gradient(420px 300px at 62% 22%,rgba(255,110,190,.22),transparent 64%),#0a0f1c}
    & .gnode{backdrop-filter:blur(18px) saturate(1.4);-webkit-backdrop-filter:blur(18px) saturate(1.4)}
    & .g-name{font-weight:600;letter-spacing:.005em}
    & .g-msg{color:#c7d4ec}
    & .g-foot{color:#a9b8d6;border-top:1px solid rgba(255,255,255,.14);padding-top:6px}
    & .wire{stroke:rgba(180,205,255,.55);stroke-width:1.6;filter:drop-shadow(0 0 6px rgba(138,180,255,.5))}
    & .wire.hot,& .wire.flow{stroke:#cfe0ff;stroke-width:2.4}
    & .wire-label{background:rgba(18,26,48,.7);border-color:rgba(255,255,255,.22);backdrop-filter:blur(10px);color:#c7d4ec}
    & .wire-label b{color:#cfe0ff}
    & .insp{background:rgba(16,24,45,.72);backdrop-filter:blur(22px);border-color:rgba(255,255,255,.22)}
    & .stat{background:rgba(255,255,255,.07)}`,
});

/* 07 新粗野主义 */
window.STYLES.push({
  n: 7, id: "brutal", name: "07 新粗野主义",
  tag: "3px 黑边 + 硬位移阴影 + 高饱和色块：一眼看清层级，拒绝精致",
  family: "layers", dir: "td", edge: "straight", inspector: "right", bg: null,
  nodeW: 206, nodeH: 100, gapX: 48, gapY: 46,
  flags: { msg: true, tasks: false, foot: true },
  css: `&{--bg:#ffefc2;--ink:#0a0a0a;--muted:#3a3a3a;--line:#0a0a0a;--panel:#fffdf5;
      --node-bg:#fffdf5;--node-border:#0a0a0a;--radius:0;--accent:#2f6bff;--ok:#00b34a;--run:#ff8a00;--err:#ff2d55;
      --shadow:7px 7px 0 #0a0a0a;--font:"Archivo Black","Arial Black","PingFang SC",sans-serif}
    & .gnode{border-width:3px}
    & .gnode:hover{transform:translate(-2px,-2px);box-shadow:9px 9px 0 #0a0a0a}
    & .gnode.sel{box-shadow:9px 9px 0 var(--accent)}
    & .g-role{background:#0a0a0a;color:#ffefc2;font-size:9px;letter-spacing:.14em;padding:1px 6px;width:max-content}
    & .g-name{font-size:13px;font-weight:900;letter-spacing:.01em;margin-top:4px}
    & .g-msg{font-size:10.5px;color:#262626}
    & .g-status{font-size:9.5px;font-weight:700;text-transform:uppercase}
    & .g-foot{font-size:9.5px;border-top:2px solid #0a0a0a;padding-top:5px;color:#262626;font-weight:700}
    & .wire{stroke:#0a0a0a;stroke-width:2.6}
    & .wire.hot,& .wire.flow{stroke:#2f6bff;stroke-width:3.4}
    & .wire-label{background:#fffdf5;border:2px solid #0a0a0a;border-radius:0;color:#0a0a0a;font-weight:700}
    & .wire-label b{color:#2f6bff}
    & .insp{border:3px solid #0a0a0a;border-radius:0;box-shadow:9px 9px 0 #0a0a0a;background:#fffdf5}
    & .insp h2{font-weight:900}
    & .insp-actions button{border:2px solid #0a0a0a;border-radius:0;background:#ffefc2;font-weight:700}
    & .stat{border:2px solid #0a0a0a;border-radius:0;background:#ffefc2}
    & .hint{border:2px solid #0a0a0a;border-radius:0;background:#fffdf5;color:#0a0a0a;font-weight:700}`,
});

/* 08 赛博霓虹 */
window.STYLES.push({
  n: 8, id: "cyber", name: "08 赛博霓虹",
  tag: "扫描线、霓虹描边、洋红与青色对打：夜城里的数据流",
  family: "lr", dir: "lr", edge: "bezier", inspector: "right", bg: "grid",
  nodeW: 214, nodeH: 108, gapX: 62, gapY: 34,
  flags: { msg: true, tasks: false, foot: true, ports: true },
  css: `&{--bg:#07000f;--ink:#eafcff;--muted:#7e6aa0;--line:#2a1450;--panel:#0d0418;
      --node-bg:linear-gradient(180deg,rgba(20,0,40,.9),rgba(8,0,18,.92));--node-border:#6d28d9;--radius:6px;
      --accent:#22d3ee;--ok:#34ffb0;--run:#ff4ecd;--err:#ff3b6b;
      --shadow:0 0 0 1px rgba(109,40,217,.55),0 0 28px -6px rgba(109,40,217,.55);
      --mono:"JetBrains Mono",Consolas,monospace;
      --bg-image:linear-gradient(rgba(109,40,217,.16) 1px,transparent 1px),linear-gradient(90deg,rgba(34,211,238,.10) 1px,transparent 1px);
      --bg-size:40px 40px,40px 40px}
    &::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:1;
      background:repeating-linear-gradient(0deg,rgba(255,255,255,.035),rgba(255,255,255,.035) 1px,transparent 1px,transparent 4px)}
    & .gnode{box-shadow:0 0 0 1px #6d28d9aa,0 0 22px -8px #a855f7}
    & .gnode:hover{box-shadow:0 0 0 1px #22d3ee,0 0 28px -6px #22d3ee}
    & .g-role{color:#22d3ee;font-family:var(--mono);font-size:9px;letter-spacing:.2em}
    & .g-name{color:#f5f3ff;text-shadow:0 0 12px rgba(168,85,247,.6)}
    & .g-msg{color:#a78bca}
    & .g-status{color:#c4b5fd;font-family:var(--mono);font-size:10px}
    & .g-foot{color:#7e6aa0;border-top:1px solid #341a5e;padding-top:5px;font-family:var(--mono);font-size:9.5px}
    & .wire{stroke:#6d28d9;stroke-width:1.6;filter:drop-shadow(0 0 5px rgba(168,85,247,.9))}
    & .wire.hot,& .wire.flow{stroke:#22d3ee;filter:drop-shadow(0 0 8px #22d3ee)}
    & .wire-label{background:#120420;border-color:#6d28d9;color:#c4b5fd;border-radius:3px;font-family:var(--mono);font-size:9.5px}
    & .wire-label b{color:#22d3ee}
    & .insp{background:rgba(15,4,28,.92);border-color:#6d28d9;box-shadow:0 0 40px -12px #a855f7}
    & .hint{border-color:#6d28d9;color:#c4b5fd;border-radius:3px}`,
});

/* 09 便利贴墙 */
window.STYLES.push({
  n: 9, id: "sticky", name: "09 便利贴墙",
  tag: "纸、胶带、手写：适合评审现场边贴边改的那种图",
  family: "wall", dir: "td", edge: "straight", inspector: "float", bg: "paper",
  nodeW: 196, nodeH: 128, gapX: 40, gapY: 40,
  flags: { msg: true, tasks: false, foot: false },
  css: `&{--bg:#efe9dc;--ink:#2b2a26;--muted:#7a7466;--line:#b9b0a0;--panel:#fffdf6;
      --node-bg:#fff7a8;--node-border:transparent;--radius:2px;--accent:#d97706;--ok:#3f8f4f;--run:#c2761a;--err:#c0392b;
      --shadow:0 10px 18px -12px rgba(60,50,30,.65);
      --font:"Bradley Hand","Segoe Print","Comic Sans MS","PingFang SC",cursive;
      --bg-image:radial-gradient(circle at 20% 30%,rgba(0,0,0,.03),transparent 40%),radial-gradient(circle at 80% 70%,rgba(0,0,0,.035),transparent 45%)}
    & .gnode{transform:rotate(var(--rot,0deg));padding:14px 12px 10px;border:0;
      background:linear-gradient(180deg,#fff9b8,#fff17a)}
    & .gnode:nth-child(3n+2){background:linear-gradient(180deg,#ffe0b8,#ffd08a)}
    & .gnode:nth-child(3n){background:linear-gradient(180deg,#d8f5d0,#bdeab2)}
    & .gnode::before{content:"";position:absolute;left:50%;top:-7px;width:52px;height:14px;margin-left:-26px;
      background:rgba(255,255,255,.55);border:1px solid rgba(0,0,0,.08);transform:rotate(-3deg)}
    & .gnode:hover{transform:rotate(calc(var(--rot,0deg) + .6deg)) translateY(-2px)}
    & .g-role{color:#8a6a2a;font-size:10px}
    & .g-name{font-size:14px;font-weight:600;color:#26251f}
    & .g-msg{color:#4d4a3c;font-size:11px}
    & .g-status{font-size:10px;color:#6b6250}
    & .wire{stroke:#8b8375;stroke-width:1.4;stroke-dasharray:6 5}
    & .wire.hot,& .wire.flow{stroke:#c2761a;stroke-width:1.8}
    & .wire-label{background:#fffdf6;border-color:#cfc6b4;color:#6b6250;border-radius:4px}
    & .wire-label b{color:#c2761a}
    & .insp{background:#fffdf6;border-color:#d8cfbc}
    & .hint{background:rgba(255,253,246,.9);border-color:#d8cfbc;color:#6b6250}`,
});

/* 10 等距层叠 */
window.STYLES.push({
  n: 10, id: "isometric", name: "10 等距层叠",
  tag: "沿对角线往上叠的层：用高度差表示委托深度，图本身有体积",
  family: "stack", dir: "td", edge: "straight", inspector: "right", bg: "iso",
  nodeW: 208, nodeH: 98, gapX: 50, gapY: 56,
  flags: { msg: false, tasks: true, foot: true },
  css: `&{--bg:#0d1117;--ink:#e7edf7;--muted:#8fa0b8;--line:#33415a;--panel:#141b26;
      --node-bg:linear-gradient(150deg,#1b2433,#141a25);--node-border:#3b4a63;--radius:10px;
      --accent:#7dd3fc;--ok:#5eead4;--run:#fcd34d;--err:#fb7185;
      --shadow:0 26px 40px -26px #000,0 2px 0 rgba(255,255,255,.06) inset;
      --bg-image:repeating-linear-gradient(60deg,rgba(125,211,252,.07) 0 1px,transparent 1px 46px),repeating-linear-gradient(-60deg,rgba(125,211,252,.07) 0 1px,transparent 1px 46px)}
    & .gnode::after{content:"";position:absolute;left:0;right:0;bottom:-9px;height:9px;
      background:linear-gradient(180deg,#0c1119,#080b10);border-radius:0 0 10px 10px;transform:skewX(-24deg);opacity:.9}
    & .gnode::before{content:"";position:absolute;right:-8px;top:0;bottom:-9px;width:8px;
      background:#0a0e15;border-radius:0 10px 10px 0;transform:skewY(-38deg);opacity:.9}
    & .g-name{font-size:12.5px;font-weight:600}
    & .g-role{color:#7dd3fc;font-size:9px;letter-spacing:.2em}
    & .g-foot{color:#8fa0b8;border-top:1px solid #2a3547;padding-top:5px;font-size:9.5px}
    & .wire{stroke:#3f5a7d;stroke-width:1.4}
    & .wire.hot,& .wire.flow{stroke:#7dd3fc;stroke-width:2}
    & .wire-label{background:#101823;border-color:#31445e;color:#8fa0b8}
    & .wire-label b{color:#7dd3fc}
    & .insp{background:#131a25;border-color:#31445e}`,
});

