/* DSH-agents-nodes · 样例执行图数据 v2（垂直流水线：输入 → 执行器 → 输出，数据自上而下）
   role: input | exec | output；exec: scout|builder|review|regression|pipeline
   节点带显式 x/y 世界坐标（collapsed 节点宽高由 CSS 决定，JS 不内联） */
window.GRAPH = {
  meta: {
    title: "ArchOS 任务图改版",
    subtitle: "一次真实的多智能体任务：图纸抓取 → 侦察/实现/审查/回归 → 交付归档",
    session: "项目标签卡-工程",
    run: "run-7f3a",
    updated: "22:04",
  },
  status: {
    done: { word: "已完成", tone: "ok" },
    running: { word: "进行中", tone: "run" },
    idle: { word: "待命", tone: "idle" },
    error: { word: "阻塞", tone: "err" },
    queued: { word: "排队", tone: "idle" },
    blocked: { word: "阻塞", tone: "err" },
  },
  nodes: [
    {
      id: "in", role: "input", name: "图纸与需求抓取",
      status: "done", x: 430, y: 140, icon: "download",
      msg: "已抓取：CAD 底图 1 份、需求纪要 3 段、参考案例 12 个。",
      tools: ["web"], tokens: "0.6M", time: "3m 20s", files: 4,
      tasks: [
        { t: "拉取 CAD 底图", s: "done" },
        { t: "整理需求纪要", s: "done" },
      ],
    },
    {
      id: "scout", role: "exec", exec: "scout", name: "设计侦察",
      status: "done", x: 80, y: 350, icon: "search",
      msg: "产出 20 种风格候选与锚点清单。",
      tools: ["web"], tokens: "0.9M", time: "6m 05s", files: 1,
      tasks: [{ t: "拆解 n8n 交互", s: "done" }],
    },
    {
      id: "builder", role: "exec", exec: "builder", name: "组件实现",
      status: "running", x: 355, y: 430, icon: "code",
      msg: "正在写第 14/20 套风格：材质卡片。",
      tools: ["code", "skill"], tokens: "2.1M", time: "12m 31s", files: 2,
      tasks: [
        { t: "卡片骨架", s: "done" },
        { t: "20 套主题", s: "running" },
      ],
    },
    {
      id: "review", role: "exec", exec: "review", name: "对抗审查",
      status: "running", x: 630, y: 430, icon: "shield",
      msg: "已挑出 3 处对比度不足、2 处焦点丢失。",
      tools: ["shell"], tokens: "1.4M", time: "4m 18s", files: 0,
      tasks: [{ t: "对比度扫描", s: "running" }],
    },
    {
      id: "pipe", role: "exec", exec: "pipeline", name: "评审流水线",
      status: "running", x: 905, y: 350, icon: "repeat",
      msg: "阶段 2/3：视觉复核。",
      tools: ["mcp"], tokens: "3.3M", time: "9m 52s", files: 0,
      tasks: [
        { t: "结构评审", s: "done" },
        { t: "视觉复核", s: "running" },
      ],
    },
    {
      id: "reg", role: "exec", exec: "regression", name: "视觉回归",
      status: "idle", x: 1180, y: 510, icon: "eye",
      msg: "等待实现产物，尚未开始。",
      tools: [], tokens: "0.2M", time: "—", files: 0,
      tasks: [{ t: "逐视口截图", s: "queued" }],
    },
    {
      id: "out", role: "output", name: "交付归档",
      status: "idle", x: 430, y: 680, icon: "upload",
      msg: "等待回归通过后归档交付包。",
      tools: [], tokens: "—", time: "—", files: 0,
      tasks: [],
    },
  ],
  edges: [
    { id: "e1", from: "in", to: "scout", label: "需求包", payload: "图纸 + 纪要" },
    { id: "e2", from: "in", to: "builder", label: "实现单", payload: "12 项 · 3 文件" },
    { id: "e3", from: "in", to: "pipe", label: "阶段门", payload: "3 阶段" },
    { id: "e4", from: "scout", to: "builder", label: "风格清单", payload: "20 套 · 锚点 9 处" },
    { id: "e5", from: "builder", to: "review", label: "补丁 v2", payload: "+523 行 · 4 文件" },
    { id: "e6", from: "builder", to: "reg", label: "构建产物", payload: "20 套主题" },
    { id: "e7", from: "review", to: "reg", label: "缺陷清单", payload: "3 对比 · 2 焦点" },
    { id: "e8", from: "pipe", to: "reg", label: "视觉门", payload: "2 张截图" },
    { id: "e9", from: "reg", to: "out", label: "回归报告", payload: "12 视口全绿" },
  ],
  flow: ["e1", "e4", "e2", "e5", "e3", "e8", "e6", "e7", "e9"],
};
