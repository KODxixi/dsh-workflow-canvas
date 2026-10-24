/**
 * DSH-agents-nodes · client 半边（脚手架，待 DSH 实机加载验证）
 *
 * 目标注册（按 README 的 cordis_inspect 结论）：
 *   - Client slot `main`（keyed，key = "agents-nodes"）→ 占满中栏的独立画布页面
 *   - Client slot `sidebar.panellist`（list）→ 侧栏入口图标
 *
 * ⚠️ 诚实标注：DSH 0.2.x 客户端插件的最终交付形态是构建产物
 *   （window.__ModuleLoader__.load({ id, factory }) 打包格式，见
 *   dsh-server-deck / dsh-better-sidebar 的 lib/client.js），不能手写伪装。
 *   本项目客户端的「本体」就是 web/ 这套纯静态应用（已验证可独立运行）；
 *   接入 DSH 时按官方 client bundle 构建流程（tsdown / tsconfig.build.json）打包，
 *   在 main 槽以 iframe 挂 /agents-nodes/index.html 即可，无需把画布重写成 React。
 *
 * 待办（装 DSH 前）：
 *   - 搭官方 client 构建链，产出真实 bundle
 *   - 在 main 槽注册 keyed 页面 + sidebar.panellist 入口（优先级用负值，防 single 槽冲突）
 *   - 用 ui-contract-lint.py 核对选择器/槽位 ALIVE
 */
export {};
