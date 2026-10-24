/* 风格 11–20 */
window.STYLES = window.STYLES || [];

/* 11 地铁线路图 */
window.STYLES.push({
  n: 11, id: "metro", name: "11 地铁线路图",
  tag: "把数据流画成线路：粗色线 + 站点 + 45° 折线，一眼看清换乘关系",
  family: "metro", dir: "lr", edge: "metro", inspector: "right", bg: null,
  nodeW: 196, nodeH: 76, gapX: 96, gapY: 54,
  flags: { msg: false, tasks: false, foot: false, ports: false },
  css: `&{--bg:#fbfbfa;--ink:#16181d;--muted:#6b7280;--line:#c9ced6;--panel:#ffffff;
      --node-bg:transparent;--node-border:transparent;--radius:10px;--accent:#e11d48;--ok:#16a34a;--run:#d97706;--err:#dc2626;
      --shadow:none;--font:"Helvetica Neue",Arial,"PingFang SC",sans-serif}
    & .gnode{padding-left:30px;background:transparent;border:0;box-shadow:none}
    & .gnode::before{content:"";position:absolute;left:4px;top:50%;width:13px;height:13px;margin-top:-6.5px;border-radius:50%;
      background:#fff;border:3px solid var(--line);box-shadow:0 0 0 2px #fff}
    & .gnode[data-status="done"]::before{border-color:#16a34a}
    & .gnode[data-status="running"]::before{border-color:#e11d48;animation:beat 1.4s infinite}
    & .gnode[data-status="error"]::before{border-color:#dc2626;background:#dc2626}
    & .gnode:hover::before{box-shadow:0 0 0 4px rgba(225,29,72,.16)}
    & .g-role{color:#8b93a1;font-size:9.5px;letter-spacing:.14em}
    & .g-name{font-size:13px;font-weight:700;color:#16181d}
    & .g-status{font-size:10px;color:#6b7280}
    & .wire{stroke:#0f766e;stroke-width:7;stroke-linecap:round;stroke-linejoin:round;opacity:.9}
    & .wire:nth-of-type(3n+1){stroke:#e11d48}
    & .wire:nth-of-type(3n+2){stroke:#2563eb}
    & .wire:nth-of-type(3n+3){stroke:#f59e0b}
    & .wire.hot,& .wire.flow{stroke-width:9;filter:saturate(1.3)}
    & .wire.dim{opacity:.18}
    & .wire-label{background:#fff;border-color:#d7dbe2;color:#4b5563;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.06)}
    & .wire-label b{color:#111827;font-weight:700}
    & .hint{background:#fff;border-color:#e3e7ee;color:#6b7280}
    & .insp{background:#fff;border-color:#e3e7ee}`,
});

/* 12 看板 */
window.STYLES.push({
  n: 12, id: "kanban", name: "12 看板分组",
  tag: "不画线，按状态分列：卡片自己在队列里移动，适合盯进度",
  family: "kanban", dir: "td", edge: "straight", inspector: "right", bg: null,
  nodeW: 204, nodeH: 104, gapX: 26, gapY: 16,
  flags: { msg: true, tasks: false, foot: true },
  css: `&{--bg:#f3f5f8;--ink:#141821;--muted:#6c7686;--line:#dfe4ec;--panel:#ffffff;
      --node-bg:#ffffff;--node-border:#e3e8f0;--radius:12px;--accent:#3b82f6;--ok:#22c55e;--run:#f59e0b;--err:#ef4444;
      --shadow:0 1px 2px rgba(20,24,33,.06),0 8px 20px -16px rgba(20,24,33,.35);
      --font:Inter,-apple-system,"Segoe UI","PingFang SC",sans-serif}
    & .gnode{border-left:4px solid #cbd5e1;border-top:0;padding:12px 12px 10px}
    & .gnode[data-status="done"]{border-left-color:#22c55e}
    & .gnode[data-status="running"]{border-left-color:#f59e0b}
    & .gnode[data-status="error"]{border-left-color:#ef4444}
    & .g-role{color:#8a94a6;font-size:9.5px;letter-spacing:.16em}
    & .g-name{font-size:12.5px;font-weight:600}
    & .g-msg{font-size:10.5px;color:#6c7686}
    & .g-foot{font-size:9.5px;border-top:1px solid #eef1f6;padding-top:5px;color:#9aa4b5}
    & .wire{stroke:#dbe1ea;stroke-width:1.2}
    & .wire.hot,& .wire.flow{stroke:#3b82f6;stroke-width:2}
    & .wire-label{background:#fff;border-color:#e3e8f0;color:#6c7686}
    & .wire-label b{color:#3b82f6}
    & .insp{background:#fff;border-color:#e3e8f0}
    & .hint{background:#fff;border-color:#e3e8f0}`,
});

/* 13 时间轴 */
window.STYLES.push({
  n: 13, id: "timeline", name: "13 时间轴",
  tag: "按发生顺序往下排：左侧是时间脊，适合复盘「谁先谁后」",
  family: "timeline", dir: "td", edge: "spine", inspector: "right", bg: null,
  nodeW: 520, nodeH: 76, gapX: 0, gapY: 14, indent: 56,
  flags: { msg: true, tasks: false, foot: true },
  css: `&{--bg:#fbfaf7;--ink:#1b1a17;--muted:#7b766c;--line:#d9d4c8;--panel:#ffffff;
      --node-bg:#ffffff;--node-border:#e3ded2;--radius:8px;--accent:#b45309;--ok:#15803d;--run:#b45309;--err:#b91c1c;
      --shadow:0 1px 2px rgba(0,0,0,.05);--mono:"JetBrains Mono",Consolas,monospace;
      --font:"Georgia","Songti SC","PingFang SC",serif}
    & .gnode{padding:12px 14px 10px 18px;border-left:3px solid var(--accent)}
    & .gnode::before{content:"";position:absolute;left:-8px;top:50%;width:11px;height:11px;margin-top:-5.5px;
      border-radius:50%;background:#fff;border:3px solid var(--line)}
    & .gnode[data-status="done"]::before{border-color:#15803d}
    & .gnode[data-status="running"]::before{border-color:#b45309}
    & .gnode[data-status="error"]::before{border-color:#b91c1c;background:#b91c1c}
    & .g-role{font-family:var(--mono);font-size:9px;letter-spacing:.16em;color:#a09888}
    & .g-name{font-size:13px;font-weight:600}
    & .g-msg{font-size:11px;color:#7b766c;font-style:italic}
    & .g-foot{font-size:9.5px;border-top:1px dotted #e3ded2;padding-top:5px;color:#a09888}
    & .wire{stroke:#cfc8ba;stroke-width:1.2}
    & .wire.hot,& .wire.flow{stroke:#b45309;stroke-width:2}
    & .wire-label{background:#fff;border-color:#e3ded2;color:#7b766c}
    & .wire-label b{color:#b45309}
    & .insp{background:#fff;border-color:#e3ded2}
    & .hint{background:#fff;border-color:#e3ded2}`,
});

/* 14 轨道 */
window.STYLES.push({
  n: 14, id: "orbit", name: "14 轨道",
  tag: "中心 + 环绕：不是树，是引力场。适合一个主代理带一圈成员的场景",
  family: "radial", dir: "td", edge: "bezier", inspector: "right", bg: "space",
  nodeW: 186, nodeH: 92, r1: 320, r2: 200,
  flags: { msg: false, tasks: true, foot: true },
  css: `&{--bg:#050a15;--ink:#e6f0ff;--muted:#8fa6c8;--line:#1d3350;--panel:#0a1526;
      --node-bg:rgba(11,25,44,.86);--node-border:#1e3a5f;--radius:16px;
      --accent:#a78bfa;--ok:#5eead4;--run:#fbbf24;--err:#fb7185;
      --shadow:0 20px 50px -30px #000,0 0 0 1px rgba(167,139,250,.16);
      --bg-image:radial-gradient(circle at 12% 18%,rgba(255,255,255,.9) .8px,transparent 1.4px),
        radial-gradient(circle at 72% 32%,rgba(255,255,255,.7) .7px,transparent 1.2px),
        radial-gradient(circle at 38% 76%,rgba(255,255,255,.6) .7px,transparent 1.2px),
        radial-gradient(circle at 86% 84%,rgba(255,255,255,.8) .8px,transparent 1.4px),
        radial-gradient(circle at 52% 54%,rgba(255,255,255,.4) .6px,transparent 1px);
      --bg-size:340px 300px,280px 260px,420px 380px,360px 320px,220px 200px}
    & .gnode[data-kind="main"]{background:radial-gradient(circle at 30% 25%,#2b1d5c,#120a2c);border-color:#7c5cff;
      box-shadow:0 0 0 1px #7c5cff,0 0 60px -12px #7c5cff}
    & .gnode{backdrop-filter:blur(4px)}
    & .g-role{color:#9db4d8;font-size:9px;letter-spacing:.22em}
    & .g-name{font-size:12.5px;font-weight:600;color:#eef4ff}
    & .g-foot{font-size:9.5px;color:#8fa6c8;border-top:1px solid #16304d;padding-top:5px}
    & .wire{stroke:#2a4a76;stroke-width:1.2;stroke-dasharray:2 5}
    & .wire.hot,& .wire.flow{stroke:#a78bfa;stroke-width:2;stroke-dasharray:none;filter:drop-shadow(0 0 6px #a78bfa)}
    & .wire-label{background:#081120;border-color:#1d3350;color:#8fa6c8}
    & .wire-label b{color:#c4b5fd}
    & .insp{background:rgba(8,17,32,.95);border-color:#1d3350}
    & .hint{background:rgba(8,17,32,.8);border-color:#1d3350}`,
});

/* 15 管道 */
window.STYLES.push({
  n: 15, id: "pipes", name: "15 管道",
  tag: "粗管子 + 阀门节点：数据是有体积的，流量一眼可见",
  family: "lr", dir: "lr", edge: "ortho", inspector: "right", bg: "grid",
  nodeW: 200, nodeH: 104, gapX: 88, gapY: 40,
  flags: { msg: true, tasks: false, foot: true, ports: true },
  css: `&{--bg:#0b1016;--ink:#dbe7f3;--muted:#7d8ea3;--line:#1d2a3a;--panel:#101923;
      --node-bg:linear-gradient(180deg,#16212e,#0f1722);--node-border:#243447;--radius:14px;
      --accent:#38bdf8;--ok:#34d399;--run:#fbbf24;--err:#fb7185;
      --shadow:0 18px 40px -28px #000,inset 0 1px 0 rgba(255,255,255,.06);
      --bg-image:linear-gradient(#101923 1px,transparent 1px);--bg-size:100% 34px}
    & .gnode::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;
      background:linear-gradient(90deg,transparent,var(--accent),transparent);opacity:.55}
    & .port{width:14px;height:14px;margin-top:-7px;background:#0d1620;border:2px solid #3d5773}
    & .port.in{left:-8px}& .port.out{right:-8px}
    & .gnode:hover .port{border-color:var(--accent);box-shadow:0 0 10px -1px var(--accent)}
    & .g-name{font-size:12.5px;font-weight:650}
    & .g-role{color:#7d8ea3;font-size:9px;letter-spacing:.2em}
    & .g-msg{color:#94a7bc;font-size:10.5px}
    & .g-foot{color:#7d8ea3;border-top:1px solid #1b2736;padding-top:5px;font-size:9.5px}
    & .wire{stroke:#1b2a3b;stroke-width:13;stroke-linecap:round;stroke-linejoin:round}
    & .wire:hover,& .wire.hot{stroke:#21405a}
    & .wire.flow{stroke:#38bdf8;stroke-width:13;filter:drop-shadow(0 0 10px rgba(56,189,248,.8));stroke-dasharray:none}
    & .wire-label{background:#0c141d;border-color:#243447;color:#8fa3ba;border-radius:4px}
    & .wire-label b{color:#38bdf8}
    & .insp{background:#0f1822;border-color:#243447}`,
});

/* 16 线框低保真 */
window.STYLES.push({
  n: 16, id: "wireframe", name: "16 线框低保真",
  tag: "灰阶、虚线、等宽标注：先谈结构不谈视觉，评审时最不容易跑题",
  family: "layers", dir: "td", edge: "ortho", inspector: "right", bg: null,
  nodeW: 208, nodeH: 98, gapX: 46, gapY: 44,
  flags: { msg: true, tasks: false, foot: true },
  css: `&{--bg:#f2f2f2;--ink:#3a3a3a;--muted:#8a8a8a;--line:#b5b5b5;--panel:#f7f7f7;
      --node-bg:#f7f7f7;--node-border:#9a9a9a;--radius:2px;--accent:#6b6b6b;--ok:#6b6b6b;--run:#6b6b6b;--err:#6b6b6b;
      --shadow:none;--mono:"JetBrains Mono",Consolas,monospace;--font:var(--mono)}
    & .gnode{border-style:dashed;border-width:1.5px;border-radius:0}
    & .gnode:hover{border-style:solid;background:#fff}
    & .g-role{font-size:9px;letter-spacing:.18em;color:#8a8a8a}
    & .g-name{font-size:12px;font-weight:600;color:#333}
    & .g-msg{font-size:10px;color:#8a8a8a}
    & .g-msg::before{content:"[";}& .g-msg::after{content:"]"}
    & .g-status{font-size:9.5px}
    & .g-foot{font-size:9px;border-top:1px dashed #c8c8c8;padding-top:5px;color:#9a9a9a}
    & .wire{stroke:#a8a8a8;stroke-width:1;stroke-dasharray:3 4}
    & .wire.hot,& .wire.flow{stroke:#555;stroke-width:1.6}
    & .wire-label{background:#f2f2f2;border:1px dashed #b5b5b5;border-radius:0;color:#7a7a7a;font-size:9px}
    & .wire-label b{color:#444}
    & .insp{background:#f7f7f7;border:1px dashed #9a9a9a;border-radius:0}
    & .stat{border-style:dashed;border-radius:0;background:transparent}
    & .hint{background:#f7f7f7;border-style:dashed;border-radius:0;color:#8a8a8a}`,
});

/* 17 蒸汽波 */
window.STYLES.push({
  n: 17, id: "vapor", name: "17 蒸汽波",
  tag: "紫粉渐变 + 透视网格 + 铬色字：把工程图放进 1987 年的商场里",
  family: "lr", dir: "lr", edge: "straight", inspector: "right", bg: "vapor",
  nodeW: 208, nodeH: 102, gapX: 66, gapY: 36,
  flags: { msg: true, tasks: false, foot: true },
  css: `&{--bg:#1b0b2e;--ink:#ffe9ff;--muted:#c9a6e6;--line:#ff5fd2;--panel:#2a0f45;
      --node-bg:linear-gradient(160deg,rgba(60,10,90,.92),rgba(24,4,40,.94));--node-border:#ff5fd2;--radius:6px;
      --accent:#22e6ff;--ok:#5cffb1;--run:#ffd166;--err:#ff4d6d;
      --shadow:0 0 0 1px rgba(34,230,255,.6),0 0 26px -6px rgba(255,95,210,.75);
      --font:"Verdana","PingFang SC",sans-serif}
    &{background:
      linear-gradient(180deg,#2b0a3d 0%,#4b0f52 42%,#a3206e 62%,#ff7ab6 74%,#150524 100%)}
    &::before{content:"";position:absolute;left:-20%;right:-20%;bottom:-12%;height:56%;pointer-events:none;
      background:linear-gradient(180deg,rgba(34,230,255,.35),rgba(34,230,255,0) 70%),
        repeating-linear-gradient(90deg,rgba(34,230,255,.5) 0 1px,transparent 1px 46px),
        repeating-linear-gradient(0deg,rgba(34,230,255,.35) 0 1px,transparent 1px 30px);
      transform:perspective(320px) rotateX(64deg);transform-origin:bottom;opacity:.5}
    & .gnode{box-shadow:0 0 0 1px #ff5fd2aa,0 0 26px -10px #ff5fd2}
    & .g-role{color:#ff8fe0;font-size:9px;letter-spacing:.24em;text-shadow:0 0 8px #ff5fd2}
    & .g-name{font-style:italic;font-weight:800;letter-spacing:.04em;color:#fff;
      text-shadow:0 0 10px rgba(255,95,210,.9),2px 2px 0 rgba(34,230,255,.5)}
    & .g-msg{color:#e2c4f5}
    & .g-status{color:#ffd6f6}
    & .g-foot{color:#c9a6e6;border-top:1px solid rgba(255,95,210,.35);padding-top:5px;font-size:9.5px}
    & .wire{stroke:#ff5fd2;stroke-width:1.6;stroke-dasharray:6 4}
    & .wire.hot,& .wire.flow{stroke:#22e6ff;stroke-width:2.4;filter:drop-shadow(0 0 6px #22e6ff)}
    & .wire-label{background:rgba(42,15,69,.95);border-color:#ff5fd2;color:#ffd6f6;border-radius:3px}
    & .wire-label b{color:#22e6ff}
    & .insp{background:rgba(32,8,52,.96);border-color:#ff5fd2}
    & .hint{background:rgba(32,8,52,.9);border-color:#ff5fd2;color:#ffd6f6}`,
});

/* 18 水墨 */
window.STYLES.push({
  n: 18, id: "zen", name: "18 水墨留白",
  tag: "一张宣纸上的几条笔触：只留必要信息，适合给甲方讲主次",
  family: "radial", dir: "td", edge: "bezier", inspector: "float", bg: "paper",
  nodeW: 196, nodeH: 88, r1: 300, r2: 190,
  flags: { msg: false, tasks: false, foot: true },
  css: `&{--bg:#f4f1ea;--ink:#1f1d1a;--muted:#8a8378;--line:#b9b2a4;--panel:#f8f5ee;
      --node-bg:transparent;--node-border:transparent;--radius:2px;
      --accent:#9a3412;--ok:#3f6212;--run:#9a3412;--err:#7f1d1d;
      --shadow:none;--font:"Songti SC","Noto Serif SC",Georgia,serif;
      --bg-image:radial-gradient(circle at 22% 18%,rgba(0,0,0,.05),transparent 46%),
        radial-gradient(circle at 78% 82%,rgba(0,0,0,.045),transparent 42%),
        radial-gradient(circle at 60% 40%,rgba(0,0,0,.025),transparent 36%)}
    & .gnode{border-bottom:1px solid rgba(31,29,26,.35);padding:10px 6px 9px;background:transparent}
    & .gnode::before{content:"";position:absolute;left:6px;top:10px;width:1px;height:calc(100% - 22px);
      background:linear-gradient(180deg,rgba(31,29,26,.5),transparent)}
    & .gnode:hover{border-bottom-color:#9a3412}
    & .g-role{color:#9a958b;font-size:9px;letter-spacing:.3em}
    & .g-name{font-size:14px;font-weight:600;letter-spacing:.04em;color:#1f1d1a}
    & .g-foot{font-size:9.5px;color:#8a8378;border:0;padding-top:4px;justify-content:flex-start}
    & .wire{stroke:#a9a29a;stroke-width:.9;opacity:.85}
    & .wire.hot,& .wire.flow{stroke:#9a3412;stroke-width:1.6;opacity:1}
    & .wire-label{background:#f4f1ea;border:0;color:#8a8378;font-size:9.5px;padding:0 4px}
    & .wire-label b{color:#9a3412;font-weight:500}
    & .insp{background:#f8f5ee;border-color:#d8d2c6;border-radius:2px}
    & .insp h2{font-size:18px;font-weight:600}
    & .hint{background:transparent;border:0;color:#8a8378}
    & .hud b{font-weight:600;letter-spacing:.1em}`,
});

/* 19 Material You */
window.STYLES.push({
  n: 19, id: "material", name: "19 材质色调",
  tag: "大圆角 + 填充色块 + 状态色系统：移动端也能点得动的那一版",
  family: "kanban", dir: "td", edge: "bezier", inspector: "right", bg: null,
  nodeW: 206, nodeH: 102, gapX: 24, gapY: 14,
  flags: { msg: true, tasks: false, foot: true },
  css: `&{--bg:#f7f4fb;--ink:#1b1a21;--muted:#5f5a6b;--line:#dcd6e8;--panel:#fffbfe;
      --node-bg:#f2ecf9;--node-border:transparent;--radius:22px;--accent:#6750a4;--ok:#386a20;--run:#7d5700;--err:#ba1a1a;
      --shadow:0 1px 3px rgba(27,26,33,.08),0 12px 26px -20px rgba(27,26,33,.4);
      --font:"Roboto","PingFang SC",-apple-system,sans-serif}
    & .gnode[data-status="done"]{background:#e6f1d8}
    & .gnode[data-status="running"]{background:#fdf1cf}
    & .gnode[data-status="error"]{background:#ffe1e0}
    & .gnode[data-status="idle"]{background:#ece7f4}
    & .g-role{color:#6b6478;font-size:9.5px;letter-spacing:.14em}
    & .g-name{font-weight:500;font-size:13px;letter-spacing:.01em}
    & .g-msg{font-size:10.5px;color:#5f5a6b}
    & .g-foot{font-size:9.5px;border-top:1px solid rgba(27,26,33,.08);padding-top:5px;color:#7a7387}
    & .g-task{border:0;background:rgba(103,80,164,.12);color:#4b3a78}
    & .wire{stroke:#c9c1da;stroke-width:2.4;stroke-linecap:round}
    & .wire.hot,& .wire.flow{stroke:#6750a4;stroke-width:3}
    & .wire-label{background:#fffbfe;border-color:#e6e0ee;color:#5f5a6b;border-radius:99px}
    & .wire-label b{color:#6750a4}
    & .insp{background:#fffbfe;border:0;box-shadow:0 18px 40px -26px rgba(27,26,33,.5)}
    & .stat{background:#f2ecf9;border:0;border-radius:14px}
    & .hint{background:#fffbfe;border-color:#e6e0ee;border-radius:99px}`,
});

/* 20 数据台账 */
window.STYLES.push({
  n: 20, id: "ledger", name: "20 数据台账",
  tag: "不画图，画表：把图摊平成台账，适合对账、验收与留档",
  family: "rows", dir: "rows", edge: "spine", inspector: "right", bg: null,
  nodeW: 860, nodeH: 58, gapX: 0, gapY: 8,
  flags: { msg: false, tasks: false, foot: true },
  css: `&{--bg:#fbfaf5;--ink:#1c1b17;--muted:#79746a;--line:#d8d2c4;--panel:#fffef9;
      --node-bg:#fffef9;--node-border:#e2dccd;--radius:0;--accent:#1d4ed8;--ok:#15803d;--run:#a16207;--err:#b91c1c;
      --shadow:none;--mono:"JetBrains Mono",Consolas,monospace;--font:var(--mono)}
    & .gnode{display:flex;flex-direction:row;align-items:center;gap:16px;padding:0 16px;border-radius:0}
    & .gnode::after{content:"›";position:absolute;right:12px;color:#c4bda9;font-size:14px}
    & .g-top{margin:0;flex:0 0 132px;flex-direction:column;align-items:flex-start;gap:2px}
    & .g-name{margin:0;flex:1;font-size:12px;font-weight:600;-webkit-line-clamp:1}
    & .g-msg,& .g-tasks{display:none}
    & .g-status{position:absolute;right:18px;top:50%;transform:translateY(-50%);font-size:10px}
    & .g-foot{margin:0 108px 0 auto;padding:0;border:0;gap:14px;flex:0 0 auto;font-size:10px;color:#8b8578}
    & .g-foot span:last-child{margin-left:0}
    & .wire{stroke:#cfc8b8;stroke-width:1}
    & .wire.hot,& .wire.flow{stroke:#1d4ed8;stroke-width:1.6}
    & .wire-label{background:#fffef9;border-color:#e2dccd;border-radius:0;color:#79746a;font-family:var(--mono);font-size:9px}
    & .wire-label b{color:#1d4ed8}
    & .insp{background:#fffef9;border-color:#e2dccd;border-radius:0}
    & .hint{background:#fffef9;border-color:#e2dccd;border-radius:0;font-family:var(--mono)}`,
});


