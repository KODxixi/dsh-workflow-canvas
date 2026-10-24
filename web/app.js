/* DSH-agents-nodes · 引擎 v2：垂直流水线（输入 → 执行器 → 输出）
   布局 → 正交连线 → 卡片 → 平移/缩放/框选/拖线/回放/看板/撤销 */
(function () {
  'use strict';
  const G = window.GRAPH;
  if (!G.groups) G.groups = [];
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* ── 基础工具 ─────────────────────────────────────── */
  const $ = (s, r = document) => r.querySelector(s);
  const el = (t, c, h) => {
    const n = document.createElement(t);
    if (c) n.className = c;
    if (h !== undefined) n.innerHTML = h;
    return n;
  };
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ── 索引 ─────────────────────────────────────────── */
  const byId = new Map();
  const edgeById = new Map();
  function rebuildIndices() {
    byId.clear(); edgeById.clear();
    G.nodes.forEach((n) => byId.set(n.id, n));
    G.edges.forEach((e) => edgeById.set(e.id, e));
  }
  rebuildIndices();

  /* ── 图标字典（Morphicons：stroke · 24 网格 · 圆头圆角） ── */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    repeat: '<polyline points="17 2 21 6 17 10"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 22 3 18 7 14"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  };
  const iconSvg = (key) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[key] || ICONS.code}</svg>`;

  /* ── 语义映射 ──────────────────────────────────────── */
  const ROLE_LABEL = { input: '输入', output: '输出' };
  const EXEC_LABEL = { scout: '侦察', builder: '实现', review: '审查', regression: '回归', pipeline: '流水线' };
  const roleLabel = (n) => (n.role === 'exec' ? EXEC_LABEL[n.exec] || '执行器' : ROLE_LABEL[n.role]);
  const statusWord = (n) => (G.status[n.status]?.word || n.status);
  const TOOL_LABEL = { web: 'web搜索', code: '代码', shell: 'shell', mcp: 'MCP', skill: 'skill' };
  const TOOL_KEYS = Object.keys(TOOL_LABEL);

  /* ── 世界尺寸与三带 ───────────────────────────────── */
  let worldW = 1500, worldH = 820;
  const BANDS = [
    { cls: 'band band-input', tag: '输入', top: 60, height: 200 },
    { cls: 'band band-exec', tag: '执行器', top: 300, height: 280 },
    { cls: 'band band-output', tag: '输出', top: 620, height: 200 },
  ];

  /* ── 全局状态 ─────────────────────────────────────── */
  let view = 'canvas';
  let selectedEdge = null;
  let selSet = new Set();
  let pos = new Map();                 // id -> {x,y,w,h}
  const viewState = { x: 0, y: 0, k: 1 };
  let nodeEls = new Map(), wireEls = new Map(), wireDelEls = new Map();
  let playing = false, flowTimer = null;
  let tmpWire = null, edgeDrag = null;
  let radialBox = null;
  const history = [];   // 执行历史（仅内存）
  let draggedAt = 0;
  let spaceDown = false;
  let keepView = false;   // restore 命中时保留已保存的 view，不被 fitView 冲掉

  const viewport = $('#viewport'), scene = $('#scene'), canvas = $('#canvas'), world = $('#world');
  const svg = $('#wires'), deco = $('#deco'), nodesBox = $('#nodes');
  const kanban = $('#kanban'), chips = $('#chips');
  const flowbar = $('#flowbar'), flowTxt = $('#flowTxt');
  const minimap = $('#minimap'), mmVp = $('#mmVp');
  const snapV = $('#snapV'), snapH = $('#snapH');
  const groupsBox = $('#groupsBox');

  /* ── 卡片模板（严格按 DOM 契约） ──────────────────── */
  function nodeHTML(n) {
    const hasIn = n.role !== 'input';
    const hasOut = n.role !== 'output';
    const tools = TOOL_KEYS.map((t) =>
      `<button class="g-tool${n.tools?.includes(t) ? ' sel' : ''}" data-tool="${t}">${TOOL_LABEL[t]}</button>`
    ).join('');
    return `
      ${hasIn ? '<div class="port in"></div>' : ''}
      ${hasOut ? '<div class="port out"></div>' : ''}
      <div class="g-row">
        <div class="g-ico">${iconSvg(n.icon)}</div>
        <div class="g-main"><div class="g-role">${esc(roleLabel(n))}</div><div class="g-name">${esc(n.name)}</div></div>
        <div class="g-pill"><i></i><span>${esc(statusWord(n))}</span></div>
      </div>
      <div class="g-form">
        <input class="g-name-input" placeholder="节点名" value="${esc(n.name)}" />
        <textarea class="g-prompt" placeholder="Prompt / 输入条件">${esc(n.msg || '')}</textarea>
        <div class="g-tools">${tools}</div>
      </div>`;
  }

  /* ── 布局 ─────────────────────────────────────────── */
  function buildPosFromNodes() {
    pos.clear();
    G.nodes.forEach((n) => pos.set(n.id, { x: n.x ?? 100, y: n.y ?? 100, w: 246, h: 52 }));
  }
  /* 自动布局：按 role 分三带，同带水平均匀、垂直居中 */
  function autoLayout() {
    const W = 240, GAP = 70;
    const put = (list, cy) => {
      if (!list.length) return;
      const total = list.length * W + (list.length - 1) * GAP;
      const x0 = (worldW - total) / 2;
      list.forEach((n, i) => {
        n.x = x0 + i * (W + GAP);
        n.y = cy - 26;
        const b = pos.get(n.id);
        if (b) { b.x = n.x; b.y = n.y; }
      });
    };
    put(G.nodes.filter((n) => n.role === 'input'), 160);
    put(G.nodes.filter((n) => n.role === 'exec'), 430);
    put(G.nodes.filter((n) => n.role === 'output'), 710);
  }

  /* Sugiyama 分层：最长路径分层 + barycenter 2-3 轮减交叉 */
  function sugiyamaLayout() {
    const ids = new Set(G.nodes.map((n) => n.id));
    const edges = G.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
    const rank = new Map(G.nodes.map((n) => [n.id, 0]));
    /* 最长路径松弛，迭代 n 轮打破环/回边 */
    for (let it = 0; it < G.nodes.length; it++) {
      edges.forEach((e) => {
        if (rank.get(e.to) <= rank.get(e.from)) rank.set(e.to, rank.get(e.from) + 1);
      });
    }
    const layers = new Map();
    G.nodes.forEach((n) => {
      const r = rank.get(n.id);
      if (!layers.has(r)) layers.set(r, []);
      layers.get(r).push(n);
    });
    const layerRanks = [...layers.keys()].sort((a, b) => a - b);
    layerRanks.forEach((r) => layers.get(r).sort((a, b) => (pos.get(a.id).x || 0) - (pos.get(b.id).x || 0)));
    const idxOf = (nid) => {
      const arr = layers.get(rank.get(nid));
      return arr.findIndex((n) => n.id === nid);
    };
    for (let round = 0; round < 3; round++) {
      for (let li = 1; li < layerRanks.length; li++) {
        layers.get(layerRanks[li]).sort((a, b) => {
          const pa = edges.filter((e) => e.to === a.id).map((e) => idxOf(e.from));
          const pb = edges.filter((e) => e.to === b.id).map((e) => idxOf(e.from));
          const ba = pa.length ? pa.reduce((x, y) => x + y, 0) / pa.length : 0;
          const bb = pb.length ? pb.reduce((x, y) => x + y, 0) / pb.length : 0;
          return ba - bb;
        });
      }
      for (let li = layerRanks.length - 2; li >= 0; li--) {
        layers.get(layerRanks[li]).sort((a, b) => {
          const sa = edges.filter((e) => e.from === a.id).map((e) => idxOf(e.to));
          const sb = edges.filter((e) => e.from === b.id).map((e) => idxOf(e.to));
          const ba = sa.length ? sa.reduce((x, y) => x + y, 0) / sa.length : 0;
          const bb = sb.length ? sb.reduce((x, y) => x + y, 0) / sb.length : 0;
          return ba - bb;
        });
      }
    }
    const W = 246, GAPX = 90, GAPY = 165;
    layerRanks.forEach((r, li) => {
      const layer = layers.get(r);
      const total = layer.length * W + (layer.length - 1) * GAPX;
      const x0 = (worldW - total) / 2;
      layer.forEach((n, i) => {
        const tx = x0 + i * (W + GAPX);
        const ty = 70 + li * GAPY;
        n.x = tx; n.y = ty;
        const b = pos.get(n.id);
        if (b) { b.x = tx; b.y = ty; }
      });
    });
  }
  function runAutoLayout() {
    pushUndo();
    sugiyamaLayout();
    nodesBox.classList.add('anim-layout');
    nodeEls.forEach((card, id) => {
      const b = pos.get(id);
      if (b) { card.style.left = `${b.x}px`; card.style.top = `${b.y}px`; }
    });
    setTimeout(() => {
      nodesBox.classList.remove('anim-layout');
      /* 根据实际节点范围扩 worldH，防止底部节点被裁 */
      let maxY = 0;
      pos.forEach((b) => { maxY = Math.max(maxY, b.y + b.h); });
      worldH = Math.max(maxY + 120, 820);
      recalcGroupBoxes();
      renderWires();
      renderGroups();
      renderMinimap();
      persist();
      toast('已自动整理');
    }, 400);
  }
  /* 重算折叠组包围盒（成员位置变化后调用） */
  function recalcGroupBoxes() {
    G.groups.forEach((g) => {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      g.members.forEach((id) => {
        const b = pos.get(id);
        if (!b) return;
        minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.w); maxY = Math.max(maxY, b.y + b.h);
      });
      if (!isFinite(minX)) return;
      const pad = 20;
      g.x = minX - pad; g.y = minY - pad;
      g.w = (maxX - minX) + pad * 2; g.h = (maxY - minY) + pad * 2;
    });
  }

  /* 折叠组成员的端口等效为组卡片 */
  function effectiveBox(id) {
    const b = pos.get(id);
    if (!b) return null;
    for (const g of G.groups) {
      if (g.members.includes(id)) return { x: g.x, y: g.y, w: g.w, h: g.h };
    }
    return b;
  }
  /* ── 连线几何：底部 out → 竖直 → r14 圆角拐肘 → 水平跳线 → 竖直 → 顶部 in ── */
  function edgePath(e) {
    const A = effectiveBox(e.from), B = effectiveBox(e.to);
    if (!A || !B) return null;
    const s = { x: A.x + A.w / 2, y: A.y + A.h - 7 };
    const t = { x: B.x + B.w / 2, y: B.y + 7 };
    const r = 14;
    let d;
    if (Math.abs(s.x - t.x) < 1) {
      d = `M${s.x},${s.y} V${t.y}`;
    } else {
      const yj = clamp((s.y + t.y) / 2, s.y + r + 4, t.y - r - 4);
      const dir = t.x > s.x ? 1 : -1;
      d = `M${s.x},${s.y} V${yj - r} Q${s.x},${yj} ${s.x + dir * r},${yj} H${t.x - dir * r} Q${t.x},${yj} ${t.x},${yj + r} V${t.y}`;
    }
    const mid = { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 };
    return { d, mid };
  }

  /* ── 渲染：三带 / 连线 / 节点 ─────────────────────── */
  function renderBands() {
    deco.innerHTML = '';
    BANDS.forEach((b) => {
      const band = el('div', b.cls);
      band.style.left = '40px';
      band.style.top = `${b.top}px`;
      band.style.width = `${worldW - 80}px`;
      band.style.height = `${b.height}px`;
      band.append(el('div', 'band-tag', b.tag));
      deco.append(band);
    });
  }

  function renderWires() {
    svg.querySelectorAll('path.wire, path.wire-hit').forEach((p) => p.remove());
    world.querySelectorAll('div.wire-del').forEach((n) => n.remove());
    wireEls.clear();
    wireDelEls.clear();
    G.edges.forEach((e) => {
      const g = edgePath(e);
      if (!g) return;
      const fromN = byId.get(e.from), toN = byId.get(e.to);
      const isErr = fromN?.status === 'error' || toN?.status === 'error';
      const p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', g.d);
      p.setAttribute('class', 'wire' + (selectedEdge === e.id ? ' sel' : '') + (isErr ? ' err' : ''));
      p.dataset.edge = e.id;
      svg.append(p);
      wireEls.set(e.id, p);

      const hit = document.createElementNS(SVGNS, 'path');
      hit.setAttribute('d', g.d);
      hit.setAttribute('class', 'wire-hit');
      hit.dataset.edge = e.id;
      svg.append(hit);

      const btn = el('div', 'wire-del', '×');
      btn.dataset.edge = e.id;
      btn.style.left = `${g.mid.x}px`;
      btn.style.top = `${g.mid.y}px`;
      world.append(btn);
      wireDelEls.set(e.id, btn);
    });
  }

  function renderNodes() {
    nodesBox.innerHTML = '';
    nodeEls.clear();
    G.nodes.forEach((n) => {
      const b = pos.get(n.id);
      if (!b) return;
      const card = el('div', 'gnode', nodeHTML(n));
      card.dataset.id = n.id;
      card.dataset.role = n.role;
      card.dataset.exec = n.role === 'exec' ? n.exec : n.role;
      card.dataset.status = n.status;
      card.dataset.type = n.icon || 'code';
      card.style.left = `${b.x}px`;
      card.style.top = `${b.y}px`;
      if (n._expanded) card.classList.add('expanded');
      nodesBox.append(card);
      nodeEls.set(n.id, card);
    });
    /* 测量 CSS 决定的真实宽高（世界坐标，offsetWidth 不受 transform scale 影响，不要再除 k） */
    nodeEls.forEach((card, id) => {
      const b = pos.get(id);
      b.w = card.offsetWidth || 246;
      b.h = card.offsetHeight || 54;
    });
    nodeEls.forEach((card, id) => {
      if (selSet.has(id)) card.classList.add('sel');
      bindForm(id);
    });
  }

  function bindForm(id) {
    const card = nodeEls.get(id);
    const n = byId.get(id);
    if (!card || !n) return;
    const form = card.querySelector('.g-form');
    if (form) {
      form.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      form.addEventListener('click', (ev) => ev.stopPropagation());
    }
    const nameI = card.querySelector('.g-name-input');
    if (nameI) nameI.oninput = () => {
      n.name = nameI.value;
      const nm = card.querySelector('.g-name');
      if (nm) nm.textContent = nameI.value;
      persist();
    };
    const ta = card.querySelector('.g-prompt');
    if (ta) ta.oninput = () => { n.msg = ta.value; persist(); };
    card.querySelectorAll('.g-tool').forEach((btn) => {
      btn.onclick = (ev) => {
        ev.stopPropagation();
        btn.classList.toggle('sel');
        const t = btn.dataset.tool;
        n.tools = n.tools || [];
        n.tools = n.tools.includes(t) ? n.tools.filter((x) => x !== t) : [...n.tools, t];
        persist();
      };
    });
  }

  /* ── 视口控制 ─────────────────────────────────────── */
  const applyView = () => { world.style.transform = `translate(${viewState.x}px,${viewState.y}px) scale(${viewState.k})`; syncMinimapView(); };
  const setZoomPct = () => { $('#zoomPct').textContent = `${Math.round(viewState.k * 100)}%`; };
  function animateView() {
    world.classList.add('anim');
    clearTimeout(world._at);
    world._at = setTimeout(() => world.classList.remove('anim'), 400);
  }
  function fitView(animate = false) {
    const vw = viewport.clientWidth || 1000, vh = viewport.clientHeight || 700;
    const k = clamp(Math.min((vw - 60) / worldW, (vh - 80) / worldH), 0.25, 1.3);
    viewState.k = k;
    viewState.x = (vw - worldW * k) / 2;
    viewState.y = (vh - worldH * k) / 2;
    if (animate) animateView();
    applyView();
    setZoomPct();
  }
  function focusNode(id) {
    const b = pos.get(id);
    if (!b) return;
    const vw = viewport.clientWidth || 1000, vh = viewport.clientHeight || 700;
    viewState.k = Math.max(viewState.k, 0.9);
    const expandedH = 180; // 展开后高度
    viewState.x = vw / 2 - (b.x + b.w / 2) * viewState.k;
    viewState.y = vh / 2 - (b.y + expandedH / 2) * viewState.k;
    animateView();
    applyView();
    setZoomPct();
  }
  function zoomAt(mx, my, factor) {
    const next = clamp(viewState.k * factor, 0.25, 2.5);
    const ratio = next / viewState.k;
    viewState.x = mx - (mx - viewState.x) * ratio;
    viewState.y = my - (my - viewState.y) * ratio;
    viewState.k = next;
    applyView();
    setZoomPct();
  }

  /* ── 小地图 ───────────────────────────────────────── */
  const MM_W = 160, MM_H = 120;
  const mmScale = () => ({ sx: MM_W / worldW, sy: MM_H / worldH });
  const MM_COLOR = { done: '#3ecf8e', running: '#e5b04a', error: '#ef5b5b', idle: '#56565f' };
  function renderMinimap() {
    minimap.querySelectorAll('.mm-dot').forEach((d) => d.remove());
    const { sx, sy } = mmScale();
    G.nodes.forEach((n) => {
      const b = pos.get(n.id);
      if (!b) return;
      const dot = el('div', 'mm-dot');
      dot.style.left = `${(b.x + b.w / 2) * sx}px`;
      dot.style.top = `${(b.y + b.h / 2) * sy}px`;
      dot.style.background = MM_COLOR[kKey(n.status)] || MM_COLOR.idle;
      minimap.append(dot);
    });
    syncMinimapView();
  }
  function syncMinimapView() {
    if (!mmVp) return;
    const vw = viewport.clientWidth || 1000, vh = viewport.clientHeight || 700;
    const { sx, sy } = mmScale();
    const left = -viewState.x / viewState.k, top = -viewState.y / viewState.k;
    mmVp.style.left = `${left * sx}px`;
    mmVp.style.top = `${top * sy}px`;
    mmVp.style.width = `${(vw / viewState.k) * sx}px`;
    mmVp.style.height = `${(vh / viewState.k) * sy}px`;
  }
  function minimapJump(ev) {
    const rect = minimap.getBoundingClientRect();
    const mx = ev.clientX - rect.left, my = ev.clientY - rect.top;
    const { sx, sy } = mmScale();
    const wx = mx / sx, wy = my / sy;
    const vw = viewport.clientWidth || 1000, vh = viewport.clientHeight || 700;
    viewState.x = vw / 2 - wx * viewState.k;
    viewState.y = vh / 2 - wy * viewState.k;
    applyView();
    setZoomPct();
  }
  function mountMinimap() {
    let mmDrag = false;
    minimap.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      mmDrag = true;
      minimap.setPointerCapture(ev.pointerId);
      minimapJump(ev);
    });
    minimap.addEventListener('pointermove', (ev) => { if (mmDrag) minimapJump(ev); });
    const end = () => { mmDrag = false; };
    minimap.addEventListener('pointerup', end);
    minimap.addEventListener('pointercancel', end);
  }

  /* ── 选中 / 展开 ───────────────────────────────────── */
  function applySelClasses() {
    nodeEls.forEach((c, id) => c.classList.toggle('sel', selSet.has(id)));
  }
  function collapseAll() {
    nodeEls.forEach((c) => c.classList.remove('expanded'));
    G.nodes.forEach((n) => { n._expanded = false; });
  }
  function activateNode(id) {
    selSet = new Set([id]);
    applySelClasses();
    collapseAll();
    const card = nodeEls.get(id);
    if (card) card.classList.add('expanded');
    const n = byId.get(id);
    if (n) n._expanded = true;
    focusNode(id);
  }

  /* ── 撤销栈（快照 nodes/edges/view） ─────────────── */
  const undoStack = [];
  function pushUndo() {
    undoStack.push(JSON.stringify({ nodes: G.nodes, edges: G.edges, groups: G.groups, view: { ...viewState } }));
    if (undoStack.length > 60) undoStack.shift();
  }
  function undo() {
    if (!undoStack.length) { toast('没有可撤销的操作'); return; }
    const snap = JSON.parse(undoStack.pop());
    G.nodes = snap.nodes; G.edges = snap.edges; G.groups = snap.groups || [];
    Object.assign(viewState, snap.view);
    selSet.clear(); selectedEdge = null;
    rebuildIndices();
    buildPosFromNodes();
    rebuildAll();
    applyView(); setZoomPct();
    persist();
    toast('已撤销');
  }

  /* ── 增删改 ───────────────────────────────────────── */
  const RADIAL_TYPES = [
    { key: 'input', name: '输入', icon: 'download', role: 'input' },
    { key: 'scout', name: '侦察', icon: 'search', role: 'exec', exec: 'scout' },
    { key: 'builder', name: '实现', icon: 'code', role: 'exec', exec: 'builder' },
    { key: 'review', name: '审查', icon: 'shield', role: 'exec', exec: 'review' },
    { key: 'regression', name: '回归', icon: 'eye', role: 'exec', exec: 'regression' },
    { key: 'pipeline', name: '流水线', icon: 'repeat', role: 'exec', exec: 'pipeline' },
    { key: 'output', name: '输出', icon: 'upload', role: 'output' },
  ];

  function addNodeAt(t, wx, wy) {
    pushUndo();
    const id = 'n' + Date.now().toString(36) + Math.floor(Math.random() * 1e3).toString(36);
    const n = {
      id, role: t.role, exec: t.exec || null, name: `${t.name}节点`,
      status: 'idle', x: wx - 120, y: wy - 26, icon: t.icon,
      msg: '', tools: ['web'], tokens: '—', time: '—', files: 0, tasks: [],
    };
    G.nodes.push(n);
    byId.set(id, n);
    pos.set(id, { x: n.x, y: n.y, w: 246, h: 52 });
    rebuildAll();
    const card = nodeEls.get(id);
    if (card) {
      card.classList.add('entering');
      setTimeout(() => card.classList.remove('entering'), 220);
    }
    activateNode(id);
    toast(`已添加 ${n.name}`);
    persist();
  }

  function addEdge(fromId, toId) {
    if (fromId === toId) { toast('不能自连'); return; }
    const to = byId.get(toId);
    if (!to || to.role === 'input') { toast('目标无输入端口'); return; }
    if (G.edges.some((e) => e.from === fromId && e.to === toId)) { toast('连线已存在'); return; }
    pushUndo();
    const e = { id: 'e' + Date.now().toString(36), from: fromId, to: toId, label: '数据流', payload: '' };
    G.edges.push(e);
    edgeById.set(e.id, e);
    rebuildAll();
    toast('已连线');
    persist();
  }

  function removeEdge(eid) {
    G.edges = G.edges.filter((x) => x.id !== eid);
    edgeById.delete(eid);
    if (selectedEdge === eid) selectedEdge = null;
  }

  function deleteSelection() {
    const ids = [...selSet];
    const eid = selectedEdge;
    if (!ids.length && !eid) return;
    pushUndo();
    if (eid) { removeEdge(eid); toast('已删除连线'); }
    if (ids.length) {
      G.nodes = G.nodes.filter((n) => !ids.includes(n.id));
      G.edges = G.edges.filter((e) => !ids.includes(e.from) && !ids.includes(e.to));
      ids.forEach((id) => { byId.delete(id); pos.delete(id); });
      G.groups.forEach((g) => { g.members = g.members.filter((m) => !ids.includes(m)); });
      G.groups = G.groups.filter((g) => g.members.length);
      toast(`已删除 ${ids.length} 个节点`);
    }
    selSet.clear();
    rebuildAll();
    persist();
  }

  function deleteNode(id) {
    pushUndo();
    G.nodes = G.nodes.filter((n) => n.id !== id);
    G.edges = G.edges.filter((e) => e.from !== id && e.to !== id);
    byId.delete(id); pos.delete(id);
    selSet.delete(id);
    G.groups.forEach((g) => { g.members = g.members.filter((m) => m !== id); });
    G.groups = G.groups.filter((g) => g.members.length);
    rebuildAll();
    persist();
    toast('已删除节点');
  }

  function renderGroups() {
    groupsBox.innerHTML = '';
    nodeEls.forEach((c) => c.classList.remove('dim'));
    G.groups.forEach((g) => {
      const card = el('div', 'gcard');
      card.style.left = `${g.x}px`;
      card.style.top = `${g.y}px`;
      card.style.width = `${g.w}px`;
      card.style.height = `${g.h}px`;
      card.append(el('div', 'gcard-tag', `${esc(g.name)} · ${g.members.length} 节点`));
      card.ondblclick = (ev) => { ev.stopPropagation(); expandGroup(g.id); };
      /* 拖拽组卡：组与成员整体平移 */
      card.onpointerdown = (ev) => {
        if (ev.button !== 0) return;
        ev.preventDefault();
        ev.stopPropagation();
        const startX = ev.clientX, startY = ev.clientY;
        const gx = g.x, gy = g.y;
        const origMembers = g.members.map((id) => {
          const b = pos.get(id);
          return [id, b ? { x: b.x, y: b.y } : null];
        });
        let pushed = false;
        const move = (e2) => {
          const dx = (e2.clientX - startX) / viewState.k;
          const dy = (e2.clientY - startY) / viewState.k;
          if (Math.abs(dx) + Math.abs(dy) < 3) return;
          if (!pushed) { pushUndo(); pushed = true; }
          g.x = gx + dx; g.y = gy + dy;
          card.style.left = `${g.x}px`; card.style.top = `${g.y}px`;
          origMembers.forEach(([id, o]) => {
            if (!o) return;
            const b = pos.get(id);
            if (b) { b.x = o.x + dx; b.y = o.y + dy; }
            const c = nodeEls.get(id);
            if (c) { c.style.left = `${b.x}px`; c.style.top = `${b.y}px`; }
          });
          renderWires();
        };
        const up = () => {
          removeEventListener('pointermove', move);
          removeEventListener('pointerup', up);
          if (pushed) {
            g.members.forEach((id) => { const b = pos.get(id), n = byId.get(id); if (b && n) { n.x = b.x; n.y = b.y; } });
            renderMinimap();
            persist();
          }
        };
        addEventListener('pointermove', move);
        addEventListener('pointerup', up);
      };
      groupsBox.append(card);
      g.members.forEach((id) => nodeEls.get(id)?.classList.add('dim'));
    });
  }
  function foldGroup() {
    if (selSet.size < 2) { toast('请先框选至少 2 个节点'); return; }
    pushUndo();
    const ids = [...selSet];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    ids.forEach((id) => {
      const b = pos.get(id);
      if (!b) return;
      minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.w); maxY = Math.max(maxY, b.y + b.h);
    });
    const pad = 20;
    G.groups.push({
      id: 'g' + Date.now().toString(36),
      name: `组 ${G.groups.length + 1}`,
      members: ids,
      x: minX - pad, y: minY - pad,
      w: (maxX - minX) + pad * 2, h: (maxY - minY) + pad * 2,
    });
    rebuildAll();
    persist();
    toast('已折叠为组');
  }
  function expandGroup(gid) {
    pushUndo();
    G.groups = G.groups.filter((g) => g.id !== gid);
    rebuildAll();
    persist();
    toast('已展开组');
  }
  function rebuildAll() {
    renderBands();
    renderWires();
    renderNodes();
    renderGroups();
    buildChips();
    buildKanban();
    renderMinimap();
    $('#hud').innerHTML = `<b>${G.nodes.length}</b> 节点 · <b>${G.edges.length}</b> 链路`;
  }

  /* ── radial 圆菜单 ────────────────────────────────── */
  function closeRadial() {
    if (radialBox) { radialBox.remove(); radialBox = null; }
  }
  function openRadial(wx, wy) {
    closeRadial();
    let box = document.getElementById('radial');
    if (!box) box = el('div', 'radial');
    box.innerHTML = '';
    box.style.left = `${wx}px`;
    box.style.top = `${wy}px`;
    if (box.parentElement !== world) world.append(box);
    RADIAL_TYPES.forEach((t, i) => {
      const ang = (i / RADIAL_TYPES.length) * Math.PI * 2 - Math.PI / 2;
      const R = 64;
      const item = el('div', 'radial-item', `${iconSvg(t.icon)}<span class="tip">${t.name}</span>`);
      item.dataset.type = t.key;
      item.style.left = `${Math.cos(ang) * R}px`;
      item.style.top = `${Math.sin(ang) * R}px`;
      item.style.transitionDelay = `${i * 40}ms`;
      item.onclick = (ev) => {
        ev.stopPropagation();
        closeRadial();
        addNodeAt(t, wx, wy);
      };
      box.append(item);
    });
    radialBox = box;
    requestAnimationFrame(() => box.classList.add('open'));
  }

  /* ── 交互装配 ─────────────────────────────────────── */
  function mountCanvas() {
    let drag = null, nd = null, boxSel = null;
    let suppressClick = false;

    /* 画布空白：左键平移 / Shift+左键框选 / 中键或空格也平移 */
    canvas.addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('.gnode, .port, .wire-del, .nmenu, .radial-item, .gcard')) return;
      if (ev.button === 1 || spaceDown || (ev.button === 0 && !ev.shiftKey)) {
        drag = { sx: ev.clientX, sy: ev.clientY, ox: viewState.x, oy: viewState.y };
        canvas.classList.add('dragging');
        canvas.setPointerCapture(ev.pointerId);
      } else if (ev.button === 0 && ev.shiftKey) {
        boxSel = { sx: ev.clientX, sy: ev.clientY, el: null };
        canvas.setPointerCapture(ev.pointerId);
      }
    });
    canvas.addEventListener('pointermove', (ev) => {
      if (drag) {
        viewState.x = drag.ox + (ev.clientX - drag.sx);
        viewState.y = drag.oy + (ev.clientY - drag.sy);
        applyView();
      }
      if (boxSel) {
        if (!boxSel.el) { boxSel.el = el('div', 'selbox'); scene.append(boxSel.el); }
        const r = canvas.getBoundingClientRect();
        const x1 = Math.min(boxSel.sx, ev.clientX) - r.left;
        const y1 = Math.min(boxSel.sy, ev.clientY) - r.top;
        const x2 = Math.max(boxSel.sx, ev.clientX) - r.left;
        const y2 = Math.max(boxSel.sy, ev.clientY) - r.top;
        boxSel.el.style.left = `${x1}px`;
        boxSel.el.style.top = `${y1}px`;
        boxSel.el.style.width = `${x2 - x1}px`;
        boxSel.el.style.height = `${y2 - y1}px`;
      }
    });
    const endCanvas = () => {
      if (boxSel && boxSel.el) {
        const br = boxSel.el.getBoundingClientRect();
        nodeEls.forEach((card, id) => {
          const cr = card.getBoundingClientRect();
          const hit = !(cr.right < br.left || cr.left > br.right || cr.bottom < br.top || cr.top > br.bottom);
          if (hit) selSet.add(id);
        });
        boxSel.el.remove();
        applySelClasses();
        suppressClick = true;   // 阻止紧随 pointerup 的合成 click 清掉框选结果
      }
      boxSel = null;
      drag = null;
      canvas.classList.remove('dragging');
    };
    canvas.addEventListener('pointerup', endCanvas);
    canvas.addEventListener('pointercancel', endCanvas);

    /* 点空白：收起所有展开 + 清选中 + 关 radial */
    canvas.addEventListener('click', (ev) => {
      if (suppressClick) { suppressClick = false; return; }   // 框选拖动刚结束，跳过
      if (ev.target.closest('.gnode, .port, .wire-del, .radial-item, .gcard')) return;
      collapseAll();
      selSet.clear(); applySelClasses();
      selectedEdge = null;
      renderWires();
      closeRadial();
    });

    /* 滚轮：以光标为中心缩放 */
    canvas.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      const rect = canvas.getBoundingClientRect();
      zoomAt(ev.clientX - rect.left, ev.clientY - rect.top, Math.exp(-ev.deltaY * 0.0013));
    }, { passive: false });

    /* 节点拖动（多选整体平移） */
    scene.addEventListener('pointerdown', (ev) => {
      const card = ev.target.closest('.gnode');
      if (!card || ev.button !== 0) return;
      if (ev.target.closest('.port, .g-form')) return;
      const id = card.dataset.id;
      if (!selSet.has(id)) { selSet = new Set([id]); applySelClasses(); }
      const orig = new Map([...selSet].map((i) => {
        const b = pos.get(i);
        return [i, { x: b.x, y: b.y }];
      }));
      nd = { ids: [...selSet], primaryId: id, sx: ev.clientX, sy: ev.clientY, orig, moved: false, pushed: false };
      card.setPointerCapture(ev.pointerId);
    });
    function clearSnap() { snapV.style.display = 'none'; snapH.style.display = 'none'; }
    scene.addEventListener('pointermove', (ev) => {
      if (!nd) return;
      const dx = (ev.clientX - nd.sx) / viewState.k;
      const dy = (ev.clientY - nd.sy) / viewState.k;
      if (Math.abs(dx) + Math.abs(dy) > 3) {
        nd.moved = true;
        if (!nd.pushed) { pushUndo(); nd.pushed = true; }
      }
      if (!nd.moved) return;
      /* 以主拖节点中心为参考，与未拖节点中心对齐吸附 */
      const dragSet = new Set(nd.ids);
      const pb = pos.get(nd.primaryId), po = nd.orig.get(nd.primaryId);
      let snapDX = 0, snapDY = 0;
      let bestX = null, bestY = null;
      if (pb && po) {
        const pcx = po.x + dx + pb.w / 2, pcy = po.y + dy + pb.h / 2;
        G.nodes.forEach((n) => {
          if (dragSet.has(n.id)) return;
          const b = pos.get(n.id);
          if (!b) return;
          const ocx = b.x + b.w / 2, ocy = b.y + b.h / 2;
          if (Math.abs(pcx - ocx) < 8 && (!bestX || Math.abs(pcx - ocx) < Math.abs(pcx - bestX))) bestX = ocx;
          if (Math.abs(pcy - ocy) < 8 && (!bestY || Math.abs(pcy - ocy) < Math.abs(pcy - bestY))) bestY = ocy;
        });
        if (bestX != null) snapDX = bestX - pcx;
        if (bestY != null) snapDY = bestY - pcy;
      }
      if (bestX != null) {
        snapV.style.display = 'block';
        snapV.style.left = `${bestX}px`; snapV.style.top = '0px'; snapV.style.height = `${worldH}px`;
      } else snapV.style.display = 'none';
      if (bestY != null) {
        snapH.style.display = 'block';
        snapH.style.top = `${bestY}px`; snapH.style.left = '0px'; snapH.style.width = `${worldW}px`;
      } else snapH.style.display = 'none';
      nd.ids.forEach((id) => {
        const o = nd.orig.get(id), b = pos.get(id);
        if (!o || !b) return;
        b.x = o.x + dx + snapDX; b.y = o.y + dy + snapDY;
        const c = nodeEls.get(id);
        if (c) { c.style.left = `${b.x}px`; c.style.top = `${b.y}px`; }
      });
      renderWires();
    });
    const endNodeDrag = () => {
      if (!nd) return;
      clearSnap();
      if (nd.moved) {
        nd.ids.forEach((id) => { const b = pos.get(id), n = byId.get(id); if (b && n) { n.x = b.x; n.y = b.y; } });
        draggedAt = performance.now();
        renderMinimap();
        persist();
      }
      nd = null;
    };
    scene.addEventListener('pointerup', endNodeDrag);
    scene.addEventListener('pointercancel', endNodeDrag);

    /* 单击节点：选中 + 展开 + 聚焦（Ctrl/Cmd+点：多选切换） */
    scene.addEventListener('click', (ev) => {
      const card = ev.target.closest('.gnode');
      if (!card) return;
      if (ev.target.closest('.port, .g-form')) return;
      if (performance.now() - draggedAt < 300) return;
      const id = card.dataset.id;
      if (ev.ctrlKey || ev.metaKey) {
        if (selSet.has(id)) selSet.delete(id); else selSet.add(id);
        applySelClasses();
        return;
      }
      activateNode(id);
    });

    /* 右键节点菜单 */
    const nmenu = $('#nmenu');
    scene.addEventListener('contextmenu', (ev) => {
      const card = ev.target.closest('.gnode');
      if (!card) return;
      ev.preventDefault();
      const id = card.dataset.id;
      if (!selSet.has(id)) { selSet = new Set([id]); applySelClasses(); }
      $('#nmenuFold').hidden = selSet.size < 2;
      const r = scene.getBoundingClientRect();
      nmenu.hidden = false;
      nmenu.style.left = `${clamp(ev.clientX - r.left, 8, r.width - 150)}px`;
      nmenu.style.top = `${clamp(ev.clientY - r.top, 8, r.height - 100)}px`;
    });
    nmenu.querySelectorAll('button').forEach((b) => {
      b.onclick = () => {
        const act = b.dataset.act;
        const id = [...selSet][0];
        nmenu.hidden = true;
        if (act === 'fold') { foldGroup(); return; }
        if (!id) return;
        if (act === 'rename') {
          activateNode(id);
          const inp = nodeEls.get(id)?.querySelector('.g-name-input');
          if (inp) { inp.focus(); inp.select(); }
        }
        if (act === 'delete') deleteNode(id);
      };
    });
    scene.addEventListener('pointerdown', (ev) => {
      if (!nmenu.contains(ev.target)) nmenu.hidden = true;
    });

    /* 双击空白：radial 圆菜单 */
    canvas.addEventListener('dblclick', (ev) => {
      if (ev.target.closest('.gnode, .port, .wire-del, .nmenu, .radial-item, .gcard')) return;
      if (radialBox) { closeRadial(); return; }
      const r = canvas.getBoundingClientRect();
      const wx = (ev.clientX - r.left - viewState.x) / viewState.k;
      const wy = (ev.clientY - r.top - viewState.y) / viewState.k;
      openRadial(wx, wy);
    });

    /* 从 out 端口拖线 */
    scene.addEventListener('pointerdown', (ev) => {
      const port = ev.target.closest('.port.out');
      if (!port || ev.button !== 0) return;
      ev.stopPropagation();
      ev.preventDefault();
      edgeDrag = { fromId: port.closest('.gnode').dataset.id };
      tmpWire = document.createElementNS(SVGNS, 'path');
      tmpWire.setAttribute('class', 'wire tmp');
      svg.append(tmpWire);
      scene.setPointerCapture(ev.pointerId);
    });
    scene.addEventListener('pointermove', (ev) => {
      if (!edgeDrag) return;
      const r = canvas.getBoundingClientRect();
      const mx = (ev.clientX - r.left - viewState.x) / viewState.k;
      const my = (ev.clientY - r.top - viewState.y) / viewState.k;
      const A = pos.get(edgeDrag.fromId);
      const sx = A.x + A.w / 2, sy = A.y + A.h;
      const midy = (sy + my) / 2;
      tmpWire.setAttribute('d', `M${sx},${sy} V${midy} H${mx} V${my}`);
      document.querySelectorAll('.port.in').forEach((p) => p.classList.remove('hot'));
      document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.port.in')?.classList.add('hot');
    });
    const endEdgeDrag = (ev) => {
      if (!edgeDrag) return;
      document.querySelectorAll('.port').forEach((p) => p.classList.remove('hot'));
      let bestIn = null, bestD = 18;
      document.querySelectorAll('.port.in').forEach((p) => {
        const r = p.getBoundingClientRect();
        const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
        const d = Math.hypot(cx - ev.clientX, cy - ev.clientY);
        if (d < bestD) { bestD = d; bestIn = p; }
      });
      if (bestIn) addEdge(edgeDrag.fromId, bestIn.closest('.gnode').dataset.id);
      if (tmpWire) { tmpWire.remove(); tmpWire = null; }
      edgeDrag = null;
    };
    scene.addEventListener('pointerup', endEdgeDrag);
    scene.addEventListener('pointercancel', endEdgeDrag);

    /* 连线点击选中（.wire-hit 热区） */
    svg.addEventListener('click', (ev) => {
      const hit = ev.target.closest('path.wire-hit');
      if (!hit) { selectedEdge = null; renderWires(); return; }
      selectedEdge = hit.dataset.edge;
      renderWires();
    });
    /* 连线 hover → 中点删除钮加 .show + 实线加 .hot（CSS 默认 opacity:0） */
    svg.addEventListener('pointerover', (ev) => {
      const hit = ev.target.closest('path.wire-hit');
      if (!hit) return;
      const eid = hit.dataset.edge;
      wireDelEls.get(eid)?.classList.add('show');
      wireEls.get(eid)?.classList.add('hot');
    });
    svg.addEventListener('pointerout', (ev) => {
      const hit = ev.target.closest('path.wire-hit');
      if (!hit) return;
      const eid = hit.dataset.edge;
      wireDelEls.get(eid)?.classList.remove('show');
      wireEls.get(eid)?.classList.remove('hot');
    });

    /* 中点 × 按钮删线（委托；右键连线不删线） */
    world.addEventListener('click', (ev) => {
      const btn = ev.target.closest('.wire-del');
      if (!btn) return;
      ev.stopPropagation();
      pushUndo();
      removeEdge(btn.dataset.edge);
      rebuildAll();
      persist();
      toast('已删除连线');
    });
  }

  /* ── 数据流回放 ───────────────────────────────────── */
  function playFlow() {
    if (playing) return;
    if (view !== 'canvas') switchView('canvas');
    playing = true;
    /* 回放前把所有 error 节点重置回 idle */
    G.nodes.forEach((n) => { if (n.status === 'error') n.status = 'idle'; });
    flowbar.hidden = false;
    const bar = flowbar.querySelector('.fp i');
    const flow = G.flow || [];
    let i = 0;
    const tick = () => {
      if (i >= flow.length) {
        flowTxt.textContent = '完成';
        const rec = {
          ts: Date.now(),
          total: G.nodes.length,
          done: G.nodes.filter((n) => n.status === 'done').length,
          error: G.nodes.filter((n) => n.status === 'error').length,
          running: G.nodes.filter((n) => n.status === 'running').length,
        };
        history.push(rec);
        if (history.length > 5) history.shift();
        setTimeout(() => {
          playing = false;
          flowbar.hidden = true;
          wireEls.forEach((p) => p.classList.remove('flow'));
          rebuildAll();
        }, 1000);
        return;
      }
      const eid = flow[i];
      wireEls.get(eid)?.classList.add('flow');
      const e = edgeById.get(eid);
      if (e) {
        const to = byId.get(e.to);
        if (to) {
          to.status = 'running';
          updateNodeStatusUI(to);
          setTimeout(() => {
            const n = byId.get(e.to);
            if (n && n.status === 'running') {
              if (Math.random() < 0.2) {
                n.status = 'error';
                updateNodeStatusUI(n);
                renderWires();
                toast(`节点 ${n.name} 执行失败`);
              } else {
                n.status = 'done';
                updateNodeStatusUI(n);
              }
            }
          }, 480);
        }
      }
      flowTxt.textContent = `${i + 1}/${flow.length} · ${e?.label || ''}`;
      bar.style.width = `${((i + 1) / flow.length) * 100}%`;
      i++;
      flowTimer = setTimeout(tick, 680);
    };
    tick();
  }
  function updateNodeStatusUI(n) {
    const card = nodeEls.get(n.id);
    if (!card) return;
    card.dataset.status = n.status;
    const span = card.querySelector('.g-pill span');
    if (span) span.textContent = statusWord(n);
    buildChips();
  }

  /* ── 状态看板 / 顶栏 chips ────────────────────────── */
  const KCOLS = [
    { key: 'done', word: '已完成', tone: 'ok' },
    { key: 'running', word: '进行中', tone: 'run' },
    { key: 'error', word: '阻塞', tone: 'err' },
    { key: 'idle', word: '待命', tone: 'idle' },
  ];
  const kKey = (s) => (KCOLS.some((c) => c.key === s) ? s : 'idle');
  function buildKanban() {
    kanban.innerHTML = '';
    KCOLS.forEach((col) => {
      const items = G.nodes.filter((n) => kKey(n.status) === col.key);
      const sec = el('section', 'kcol');
      sec.innerHTML = `<div class="kcol-hd ${col.tone}"><i></i><b>${col.word}</b><span class="ct">${items.length}</span></div>`;
      const body = el('div', 'kcol-body');
      items.forEach((n) => {
        const c = el('article', 'kcard');
        c.innerHTML = `
          <div class="g-ico">${iconSvg(n.icon)}</div>
          <div class="g-main"><div class="g-role">${esc(roleLabel(n))}</div><div class="g-name">${esc(n.name)}</div></div>
          <div class="g-pill"><i></i><span>${esc(statusWord(n))}</span></div>`;
        c.onclick = () => { switchView('canvas'); activateNode(n.id); };
        body.append(c);
      });
      sec.append(body);
      kanban.append(sec);
    });
  }
  function buildChips() {
    chips.innerHTML = '';
    KCOLS.forEach((c) => {
      const cnt = G.nodes.filter((n) => kKey(n.status) === c.key).length;
      chips.append(el('span', `chip ${c.tone}`, `<i></i>${c.word}<b>${cnt}</b>`));
    });
  }

  /* ── 视图切换 ─────────────────────────────────────── */
  function switchView(v) {
    view = v;
    document.querySelectorAll('.seg button').forEach((b) => {
      const on = b.dataset.view === v;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
    });
    scene.style.display = v === 'canvas' ? '' : 'none';
    kanban.hidden = v !== 'kanban';
    if (v === 'kanban') buildKanban();
    else if (keepView) { applyView(); setZoomPct(); }
    else requestAnimationFrame(fitView);
  }

  /* ── 持久化（v2） ─────────────────────────────────── */
  const LS_KEY = 'dsh-agents-nodes-v2';
  function persist() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        nodes: G.nodes, edges: G.edges, groups: G.groups,
        view: { x: viewState.x, y: viewState.y, k: viewState.k },
      }));
    } catch (e) {}
  }
  function restore() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (!d.nodes?.length) return false;
      G.nodes = d.nodes;
      G.edges = d.edges || [];
      G.groups = d.groups || [];
      if (d.view) Object.assign(viewState, d.view);
      rebuildIndices();
      return true;
    } catch (e) { return false; }
  }

  /* ── 小工具 ───────────────────────────────────────── */
  let toastTimer = null;
  function toast(text) {
    const t = $('#toast');
    t.textContent = text;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1500);
  }

  /* ── 执行历史面板 ─────────────────────────────────── */
  function renderHistory() {
    const panel = $('#histPanel');
    panel.innerHTML = '';
    if (!history.length) { panel.append(el('div', 'hist-empty', '暂无执行记录')); return; }
    panel.append(el('div', 'hist-hd', '最近 5 次执行'));
    [...history].reverse().forEach((r) => {
      const d = new Date(r.ts);
      const p2 = (x) => String(x).padStart(2, '0');
      const row = el('div', 'hist-row');
      row.innerHTML = `<span class="t">${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}</span>` +
        `<span>完成 <b class="ok">${r.done}</b> · 错误 <b class="err">${r.error}</b></span>`;
      panel.append(row);
    });
  }

  /* ── 启动 ─────────────────────────────────────────── */
  function boot() {
    const restored = restore();
    keepView = restored;
    if (!G.nodes.some((n) => n.x != null)) autoLayout();
    buildPosFromNodes();

    $('#sessName').textContent = G.meta.session;
    $('#sessMeta').textContent = `${G.meta.run} · ${G.meta.updated}`;
    $('#hud').innerHTML = `<b>${G.nodes.length}</b> 节点 · <b>${G.edges.length}</b> 链路`;
    buildChips();
    renderBands();
    renderWires();
    renderNodes();
    renderGroups();
    buildKanban();
    renderMinimap();
    mountCanvas();
    mountMinimap();
    switchView('canvas');
    if (restored) toast('已恢复上次画布');

    document.querySelectorAll('.seg button').forEach((b) => {
      b.onclick = () => switchView(b.dataset.view);
    });
    $('#replayBtn').onclick = playFlow;
    $('#historyBtn').onclick = (ev) => {
      ev.stopPropagation();
      const panel = $('#histPanel');
      panel.hidden = !panel.hidden;
      if (!panel.hidden) renderHistory();
    };
    document.addEventListener('pointerdown', (ev) => {
      const panel = $('#histPanel');
      if (!panel.hidden && !ev.target.closest('.hist-wrap')) panel.hidden = true;
    });
    $('#zoomIn').onclick = () => zoomAt(canvas.clientWidth / 2, canvas.clientHeight / 2, 1.18);
    $('#zoomOut').onclick = () => zoomAt(canvas.clientWidth / 2, canvas.clientHeight / 2, 1 / 1.18);
    $('#zoomFit').onclick = () => fitView(true);
    $('#autoLayoutBtn').onclick = runAutoLayout;
    addEventListener('resize', () => { if (view === 'canvas') requestAnimationFrame(fitView); });

    addEventListener('keydown', (ev) => {
      if (ev.key === ' ') { ev.preventDefault(); spaceDown = true; }
      if (ev.key === 'Escape') {
        closeRadial();
        if (edgeDrag) { if (tmpWire) { tmpWire.remove(); tmpWire = null; } edgeDrag = null; }
        collapseAll();
      }
      if ((ev.key === 'Delete' || ev.key === 'Backspace') && view === 'canvas') {
        const tag = document.activeElement?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        ev.preventDefault();
        deleteSelection();
      }
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'z' && view === 'canvas') {
        ev.preventDefault();
        undo();
      }
    });
    addEventListener('keyup', (ev) => { if (ev.key === ' ') spaceDown = false; });
  }

  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
  else boot();
})();
