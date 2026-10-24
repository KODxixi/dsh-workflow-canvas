/**
 * DSH-agents-nodes · host 半边（脚手架，待 DSH 实机加载验证）
 *
 * 职责（按 C:\AI\memory\_canonical\DSH.md 与 README 记录的扩展点）：
 *   1. 把 web/ 静态画布挂到 host：/agents-nodes/ → web/index.html
 *   2. 暴露 /agents-nodes/api/graph：先返样例图数据，下一步接 ctx.subagents.listDescendants
 *
 * ⚠️ 诚实标注：DSH 0.2.x host 的 webServer 服务签名未在本机运行实例中核实
 *   （运行时为打包结构，未找到 dsh-host-webserver 的源码型 lib）。
 *   下方按 DSH 文档记录的扩展点写成最保守形状；实机加载时以宿主报错为准修正，
 *   在确认可加载前不要把它当已验收代码。
 */
export const name = 'dsh-agents-nodes';

export const inject = {
  optional: ['webServer'],
};

export async function apply(ctx) {
  // 1) 静态画布目录注入（保守写法，实际注册方式以实机 webServer 服务为准）
  // 目标形态：
  //   ctx.webServer.register('/agents-nodes', { root: new URL('../web', import.meta.url).pathname });
  //
  // 2) 样例图数据 API（数据源暂为 web/data.js；下一步替换为真实 agent 树）
  // 目标形态：
  //   ctx.webServer.register('/agents-nodes/api/graph', {
  //     get: async () => JSON.parse(await readFile(new URL('../web/data.js', import.meta.url), 'utf8').replace(/^window\.GRAPH\s*=\s*/, '').replace(/;\s*$/, '')),
  //   });

  ctx.logger?.info?.('[dsh-agents-nodes] host scaffold loaded (routes not yet bound — pending live API verification)');
}
