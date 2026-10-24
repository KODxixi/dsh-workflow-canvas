<div align="center">

# DSH Workflow Canvas

**编排多 Agent，像画流程图一样简单。**

<br/>

<img src="https://img.shields.io/badge/version-0.1.0-000000?style=for-the-badge" />
<img src="https://img.shields.io/badge/DSH-0.2+-000000?style=for-the-badge" />
<img src="https://img.shields.io/badge/license-MIT-000000?style=for-the-badge" />

<br/><br/>

<img src="demo-01-overview.png" width="880" alt="DSH Workflow Canvas" style="border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,.5)"/>

</div>

<br/>

## 为什么做这个

DSH 里多 Agent 跑起来是黑盒——谁调了谁、数据怎么流、哪一步炸了，全靠看日志。

Workflow Canvas 把它变成一张图。拖节点、连线、配 prompt，整条流水线一眼看清。

<br/>

## 它长什么样

<table>
<tr>
<td width="50%">

**点节点，原地展开**

不用跳转、不用侧边栏。点一下，卡片变大，直接改配置。

<img src="demo-02-expand.png" width="100%" style="border-radius:12px; margin-top:12px"/>

</td>
<td width="50%">

**双击空白，加节点**

弹出 radial 菜单，选类型，放哪里都行。

<img src="demo-03-radial.png" width="100%" style="border-radius:12px; margin-top:12px"/>

</td>
</tr>
</table>

<br/>

## 你能做什么

<div align="center">

| | | |
|:---:|:---:|:---:|
| **拖节点**<br/>从输入到输出 | **连线**<br/>数据流可视化 | **配 prompt**<br/>点节点原地改 |
| **跑一遍**<br/>数据流回放 | **看状态**<br/>跑着/成了/炸了 | **存下来**<br/>刷新不丢 |

</div>

<br/>

## 快捷键

<div align="center">

| `拖空白` | `Shift+拖` | `滚轮` | `双击` | `Delete` | `Ctrl+Z` |
|:---:|:---:|:---:|:---:|:---:|:---:|
| 平移 | 框选 | 缩放 | 加节点 | 删除 | 撤销 |

</div>

<br/>

## 开始用

```bash
# 复制到 DSH 插件目录
cp -r . ~/.dsh/profiles/desktop/node_modules/dsh-workflow-canvas/

# 重启 DSH
```

<br/>

## 技术栈

纯原生 HTML / CSS / JavaScript。零构建、零依赖、零网络。

---

<div align="center">

MIT © KODxixi

</div>
