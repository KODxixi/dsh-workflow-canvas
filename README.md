<div align="center">

# DSH Workflow Canvas

**编排多 Agent，像画流程图一样简单。**

<br/>

<img src="https://img.shields.io/badge/v0.1.0-0a0a0a?style=flat-square" />
<img src="https://img.shields.io/badge/DSH%200.2+-0a0a0a?style=flat-square" />
<img src="https://img.shields.io/badge/MIT-0a0a0a?style=flat-square" />

<br/><br/>

<img src="demo.gif" alt="Demo" width="880" style="border-radius:12px"/>

<br/><br/>

[快速开始](#开始用) · [功能](#功能) · [快捷键](#快捷键)

</div>

---

## 为什么做这个

DSH 里多 Agent 跑起来是黑盒——谁调了谁、数据怎么流、哪一步炸了，全靠翻日志。

Workflow Canvas 把它变成一张图。拖节点、连线、配 prompt，整条流水线一眼看清。

---

## 功能

<div align="center">

| | | |
|:---:|:---:|:---:|
| 📥 **垂直流水线**<br/>输入 → 执行器 → 输出 | ✨ **原地展开**<br/>点节点变大编辑 | 🎨 **类型着色**<br/>7 种节点各有颜色 |
| 🔗 **拖线连线**<br/>out → in port | ➕ **双击加节点**<br/>radial 菜单 | 🗺️ **小地图**<br/>右下角导航 |
| 🔄 **数据流回放**<br/>动画跑一遍 | ✅ **状态可见**<br/>跑着/成了/炸了 | 💾 **自动保存**<br/>刷新不丢 |

</div>

---

## 截图

<img src="demo-01-overview.png" width="100%" style="border-radius:12px"/>
<p align="center"><sub>全景：纯黑背景，三带垂直流水线</sub></p>

<br/>

<table>
<tr>
<td width="50%"><img src="demo-02-expand.png" width="100%" style="border-radius:12px"/></td>
<td width="50%"><img src="demo-03-radial.png" width="100%" style="border-radius:12px"/></td>
</tr>
</table>
<p align="center"><sub>左：点节点原地展开 &nbsp;·&nbsp; 右：双击 radial 加节点</sub></p>

---

## 快捷键

<div align="center">

| 操作 | 快捷键 |
|:---|:---|
| 平移画布 | `左键拖空白` |
| 框选多选 | `Shift + 左键拖` |
| 缩放 | `滚轮` |
| 加节点 | `双击空白` |
| 删除 | `Delete` |
| 撤销 | `Ctrl + Z` |

</div>

---

## 开始用

```bash
cp -r . ~/.dsh/profiles/desktop/node_modules/dsh-workflow-canvas/
```

重启 DSH，侧边栏点 **Workflow Canvas**。

---

## 技术栈

纯原生 HTML / CSS / JS。零构建、零依赖。

---

<div align="center">

MIT © [KODxixi](https://github.com/KODxixi)

</div>
