# DSH Workflow Canvas

> n8n 风格的可视化多 Agent 编排器。拖节点、连线、配 prompt，一条流水线就搭好了。

![version](https://img.shields.io/badge/version-0.1.0-black)
![dsh](https://img.shields.io/badge/DSH-0.2+-black)

## 这是什么

一个 DSH 插件，在画布上用节点图编排多 Agent 工作流。

```
📥 输入（文件/Webhook/手动）
   ↓
🔍 侦察 → 💻 实现 → 🛡️ 审查 → 👁️ 回归
   ↓
📤 输出（写文件/发通知）
```

每个节点是一个 Agent 实例，连线是数据流。点节点原地展开改 prompt、选工具，点外部收起。

## 功能

| 功能 | 说明 |
|---|---|
| **垂直流水线** | 输入在顶、执行器在中、输出在底，数据从上往下流 |
| **节点原地展开** | 点节点变大成可编辑表单，改名字/prompt/工具 |
| **7 种节点类型** | 输入/侦察/实现/审查/回归/流水线/输出，各有颜色 |
| **拖线连节点** | 从 out port 拖到 in port 创建连接 |
| **双击加节点** | 双击空白弹出 radial 菜单选类型 |
| **框选多选** | Shift+左键拖框选多个节点一起拖 |
| **自动整理** | 一键 Sugiyama 布局，减少交叉 |
| **小地图** | 右下角导航，点拖平移 |
| **对齐吸附** | 拖节点自动对齐其他节点 |
| **错误状态** | 节点跑炸变红，脉冲发光 |
| **数据流回放** | 点"数据流回放"看动画跑一遍 |
| **持久化** | 刷新不丢，localStorage 自动存 |
| **撤销** | Ctrl+Z |
| **折叠组** | 框选多个节点 → 右键折叠为组 |

## 快捷键

| 键 | 动作 |
|---|---|
| 左键空白拖 | 平移画布 |
| Shift+左键拖 | 框选 |
| 滚轮 | 缩放 |
| 双击空白 | 加节点 |
| 右键节点 | 菜单（重命名/删除） |
| Delete | 删除选中 |
| Ctrl+Z | 撤销 |
| 中键/空格+拖 | 平移 |

## 安装

```bash
# 复制到 DSH 插件目录
cp -r . ~/.dsh/profiles/desktop/node_modules/dsh-workflow-canvas/

# 在 package.json 加依赖和 bundle
# dependencies: "dsh-workflow-canvas": "file:./node_modules/dsh-workflow-canvas"
# bundles: "dsh-workflow-canvas"

# 重启 DSH
```

## 技术栈

- 纯原生 HTML/CSS/JS，无构建
- SVG 正交连线（直线+圆角拐弯）
- localStorage 持久化
- 纯黑背景 + Gary-UI 深色设计 token

## 目录

```
dsh-workflow-canvas/
├── package.json
├── cordis.patch.yml
├── lib/
│   ├── index.js    # host 端
│   └── client.js   # client 端
└── web/
    ├── index.html  # 画布 UI
    ├── app.js      # 全部逻辑
    └── data.js     # 样例数据
```
