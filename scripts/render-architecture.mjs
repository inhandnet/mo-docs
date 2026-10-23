#!/usr/bin/env node
// Source for the bilingual README diagrams. No browser or external assets needed.
import {mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const out = fileURLToPath(new URL('../architecture/', import.meta.url));
const esc = (s) => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const palette = {ink: '#172d31', muted: '#53686d', green: '#006f59', line: '#cad9d9'};
const text = (x, y, s, size = 18, color = palette.ink, weight = 400) =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" font-weight="${weight}">${esc(s)}</text>`;
const rect = (x, y, w, h, fill = '#fff', stroke = palette.line, radius = 12) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`;
const line = (d, arrow = false) => `<path d="${d}" fill="none" stroke="#769095" stroke-width="2"${arrow ? ' marker-end="url(#arrow)"' : ''}/>`;
function svg(title, description, height, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 ${height}" role="img" aria-labelledby="title description">
<title id="title">${esc(title)}</title><desc id="description">${esc(description)}</desc>
<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" fill="#769095"/></marker></defs>
<rect width="1120" height="${height}" rx="16" fill="#f4f8f7"/>
<g font-family="Inter, Noto Sans CJK SC, Microsoft YaHei, Arial, sans-serif">${content}</g></svg>\n`;
}

const copy = {
  en: {
    title: 'One developer platform. Shared and product repositories.',
    sub: 'Shared platform for the Mo series · separate ownership, builds and releases',
    websites: '01  WEBSITE PUBLISHERS',
    webnote: 'Three builds, served under one origin',
    sites: [
      ['developer', 'GitLab · main site', '/', 'Product discovery and navigation', 'Software, community, blog, contact'],
      ['mo-docs', 'GitHub · software documentation', '/docs/', 'Getting started, OS and AI guides', 'Model, toolchain and example guides'],
      ['mo-hardware', 'GitHub · hardware documentation', '/hardware-docs/', 'Interfaces, schematics and mechanics', 'Accessories and compliance'],
    ],
    references: 'Links, reviewed snapshots and browser image lookup',
    refnote: 'Source releases do not automatically rebuild the websites.',
    resources: '02  SOFTWARE & DATA SOURCES',
    sourcenote: 'Independent versions · no website deployment',
    sources: [
      ['Mo*', 'BSP & OS images', 'One repository per product', 'Mo62A / Mo68A / …'],
      ['mo-models', 'Model catalog', 'Metadata / .link files', 'Compile / benchmarks'],
      ['mo-tools', 'Development tools', 'Toolchain version pins', 'Host setup / board tests'],
      ['mo-examples', 'Application examples', 'AI and camera code', 'Runnable examples'],
    ],
    upstream: 'UPSTREAM',
    ti: 'TI model zoo & toolchain downloads',
    tinote: 'mo-models and mo-tools reference upstream assets; model binaries stay outside Git.',
    environments: 'DEPLOYMENT ENVIRONMENTS',
    env: 'Test  developer.inhand.online     /     Production target  developer.inhand.com',
    foot: 'Independent repository versions, integrated through links and reviewed snapshots.',
    flowtitle: 'How mo-docs reaches the website',
    flowsub: 'GitHub workflow · separate test and production builds · publish before deployment',
    steps: [
      ['1', 'Pull request', 'English commit messages', 'Checks + website build'],
      ['2', 'Protected master', 'Admin merges', 'GitHub Pages preview'],
      ['3', 'Tag + validation', 'VX.Y.Z-rcN / VX.Y.Z', 'Admin → tag CI'],
      ['4', 'Build + release', 'EN entries / EN-ZH titles', 'Archives + SHA256'],
    ],
    test: ['Test platform', 'Every release tag', 'developer.inhand.online'],
    prod: ['Production target', 'Final VX.Y.Z only · credentials required', 'developer.inhand.com'],
    boundary: 'DEPLOYMENT BOUNDARY',
    boundarytext: 'mo-docs deploys /docs/ only. Main-site and hardware directories stay independently owned.',
    note: 'Separate test / production builds. Failed checks or missing credentials stop publication or deployment.',
  },
  'zh-CN': {
    title: '一个开发者平台，共用仓库与产品仓库协同',
    sub: 'Mo 系列共用框架 · 内容各自维护，独立构建与发布',
    websites: '01  构成网站的三个仓库',
    webnote: '三份构建产物，通过同一域名访问',
    sites: [
      ['developer', 'GitLab · 主站框架与统一入口', '/', '产品介绍、主站导航与资源入口', '软件、社区、博客与联系页面'],
      ['mo-docs', 'GitHub · 软件文档', '/docs/', '入门、系统使用与 AI 开发指南', '模型、工具链与示例使用说明'],
      ['mo-hardware', 'GitHub · 硬件资料', '/hardware-docs/', '接口、原理图与机械资料', '配件与合规文档'],
    ],
    references: '链接、经审阅的快照与浏览器镜像查询',
    refnote: '来源仓库发布新版本，不会自动触发网站重新构建。',
    resources: '02  BSP、工具、模型与示例仓库',
    sourcenote: '各有独立版本 · 不部署网站页面',
    sources: [
      ['Mo*', 'BSP 与系统镜像', '每个产品型号独立维护仓库', 'Mo62A / Mo68A / …'],
      ['mo-models', '模型清单', '元数据与 .link 下载引用', '编译方法、基准与实测记录'],
      ['mo-tools', '开发与测试工具', '工具链版本约定', '主机环境配置与板测工具'],
      ['mo-examples', '应用示例', 'AI 与相机示例源码', '教程配套的可运行程序'],
    ],
    upstream: '上游来源',
    ti: 'TI 模型库与工具链下载',
    tinote: 'mo-models、mo-tools 引用上游发布物；模型二进制不放进 Git。',
    environments: '部署环境',
    env: '测试  developer.inhand.online     /     正式目标  developer.inhand.com',
    foot: '各仓库独立管理版本，通过链接与经审查的数据快照协同。',
    flowtitle: 'mo-docs 如何发布到网站',
    flowsub: 'GitHub 流程 · 测试与正式分别构建 · Release 发布成功后部署',
    steps: [
      ['1', '合并请求 PR', '英文提交信息', '规范检查、测试与构建'],
      ['2', '受保护的 master', 'Admin 合并', '生成 GitHub Pages 预览'],
      ['3', '标签与发布校验', 'VX.Y.Z-rcN / VX.Y.Z', 'Admin 推送后由 CI 校验'],
      ['4', '构建与 Release', '中英标题 · 英文变更条目', '环境归档与 SHA256'],
    ],
    test: ['测试平台', '每个发布标签均部署', 'developer.inhand.online'],
    prod: ['正式平台目标', '仅正式 VX.Y.Z · 需配置部署凭据', 'developer.inhand.com'],
    boundary: '部署边界',
    boundarytext: 'mo-docs 仅部署 /docs/，主站目录和 /hardware-docs/ 保持独立。',
    note: '测试与正式域名分别构建；校验失败或缺少配置时阻断相应发布、部署步骤。',
  },
};

function repositoryMap(c) {
  let s = text(40, 42, 'MO / DEVELOPER PLATFORM', 13, palette.green, 700);
  s += text(40, 92, c.title, 30, palette.ink, 700) + text(40, 124, c.sub, 17, palette.muted);
  s += text(40, 178, c.websites, 15, palette.green, 700) + text(720, 178, c.webnote, 16, palette.muted);
  for (const [i, site] of c.sites.entries()) {
    const x = 40 + i * 356;
    s += rect(x, 202, 328, 220, i === 1 ? '#e7f3ee' : '#fff');
    s += text(x + 22, 242, site[0], 26, palette.ink, 700);
    s += text(x + 22, 270, site[1], 15, palette.muted);
    s += rect(x + 22, 289, 284, 36, '#f2f6f5', '#dbe6e2', 6);
    s += text(x + 34, 314, site[2], 19, palette.green, 600);
    s += text(x + 22, 359, site[3], 16) + text(x + 22, 387, site[4], 16);
  }
  s += line('M204 486 V426', true) + line('M560 486 V426', true);
  s += rect(40, 486, 1040, 84, '#eaf0f4', '#cad9df');
  s += text(64, 520, c.references, 21, palette.ink, 600) + text(64, 548, c.refnote, 16, palette.muted);
  s += text(40, 600, c.resources, 15, palette.green, 700) + text(687, 600, c.sourcenote, 16, palette.muted);
  const sourceGap = 16;
  const sourceWidth = (1040 - sourceGap * (c.sources.length - 1)) / c.sources.length;
  const sourceCenter = (i) => 40 + i * (sourceWidth + sourceGap) + sourceWidth / 2;
  s += line(`M${sourceCenter(0)} 616 H${sourceCenter(c.sources.length - 1)}`);
  s += line('M560 616 V574', true);
  for (const [i, source] of c.sources.entries()) {
    const x = 40 + i * (sourceWidth + sourceGap);
    s += line(`M${sourceCenter(i)} 616 V636`);
    s += rect(x, 640, sourceWidth, 174);
    s += text(x + 16, 675, source[0], 23, palette.ink, 700);
    s += text(x + 16, 706, source[1], 18, palette.green, 600);
    s += text(x + 16, 752, source[2], 16) + text(x + 16, 779, source[3], 16);
  }
  s += rect(40, 838, 1040, 86, '#f1f0f8', '#d9d5e9');
  s += text(60, 865, c.upstream, 12, '#63557c', 700) + text(190, 866, c.ti, 19, palette.ink, 600);
  s += text(190, 899, c.tinote, 16, palette.muted);
  s += line('M40 950 H1080');
  s += text(40, 979, c.environments, 12, palette.green, 700);
  s += text(40, 1009, c.env, 18, palette.ink, 500) + text(40, 1042, c.foot, 15, palette.muted);
  return svg(c.title, c.sub + '. ' + c.refnote, 1070, s);
}

function releaseFlow(c) {
  let s = text(40, 42, 'MO / DELIVERY', 13, palette.green, 700);
  s += text(40, 90, c.flowtitle, 30, palette.ink, 700) + text(40, 124, c.flowsub, 17, palette.muted);
  for (const [i, step] of c.steps.entries()) {
    const x = 40 + i * 264;
    s += rect(x, 164, 248, 156);
    s += rect(x + 18, 182, 30, 30, '#e7f3ee', '#e7f3ee', 8);
    s += text(x + 28, 204, step[0], 18, palette.green, 700);
    s += text(x + 18, 245, step[1], 22, palette.ink, 700);
    s += text(x + 18, 274, step[2], 16) + text(x + 18, 300, step[3], 16);
    if (i < 3) s += line(`M${x + 248} 237 h12`, true);
  }
  s += line('M956 320 V350 H292 V386', true);
  for (const [i, target] of [c.test, c.prod].entries()) {
    const x = 40 + i * 536;
    s += rect(x, 390, 504, 126, i === 0 ? '#e7f3ee' : '#fff');
    s += text(x + 24, 425, target[0], 23, palette.ink, 700);
    s += text(x + 24, 459, target[1], 17, palette.muted);
    s += text(x + 24, 490, target[2], 21, palette.green, 500);
  }
  s += line('M546 453 H574', true);
  s += text(40, 563, c.boundary, 13, palette.green, 700);
  s += text(40, 593, c.boundarytext, 17);
  s += text(40, 625, c.note, 16, palette.muted);
  return svg(c.flowtitle, c.flowsub + '. ' + c.note, 654, s);
}


function documentationMap(lang) {
  const zh = lang === 'zh-CN';
  const title = zh ? 'mo-docs：从已核验内容到可发布的网站' : 'mo-docs: from verified content to a published site';
  const subtitle = zh ? '指南与证据在源码中维护，数据更新经过审阅' : 'Maintain guides and evidence in source; review data updates explicitly';
  const cards = zh ? [
    ['01  内容与证据', 'docs/mo-* · 共用 partial · 安全指南', '板卡、镜像、命令、结果与验证边界'],
    ['02  公开附件', 'static/img · static/downloads', '截图、授权素材、示例与原始证据'],
    ['03  数据与外部资源', 'GitHub Release 快照 · 上游链接', '浏览器独立解析稳定镜像与校验文件'],
    ['04  共用文档组件', '链接路由 · 表格 · 下载 · 搜索界面', '33 条硬件旧地址保留参数与锚点'],
    ['05  Docusaurus + Pagefind', '配置、主题与环境地址 → 静态页面', '本地搜索索引 · 字体许可 · 部署标记'],
    ['06  验证与交付', '单元测试 · 类型检查 · 浏览器与布局', '审阅附件 / Pages / 分环境发布归档'],
  ] : [
    ['01  Content and evidence', 'docs/mo-* · shared partials · security', 'Board, image, commands, results and limits'],
    ['02  Public assets', 'static/img · static/downloads', 'Captures, licensed media, examples, evidence'],
    ['03  Data and upstream resources', 'GitHub Release snapshot · source links', 'Browser resolves a stable image/checksum pair'],
    ['04  Shared documentation UI', 'Route links · tables · downloads · search', '33 hardware redirects keep query and fragment'],
    ['05  Docusaurus + Pagefind', 'Config, theme and target URLs → static pages', 'Local index · font notices · deployment marker'],
    ['06  Validation and delivery', 'Unit tests · type checks · browser and layout', 'Review artifacts / Pages / release archives'],
  ];
  let s = text(40, 42, 'MO / DOCUMENTATION', 13, palette.green, 700);
  s += text(40, 92, title, 29, palette.ink, 700) + text(40, 124, subtitle, 17, palette.muted);
  s += rect(24, 150, 1072, 392, '#edf3f2', '#dce6e4', 16);
  for (const [i, card] of cards.entries()) {
    const x = i < 4 ? 40 + (i % 2) * 536 : 40;
    const y = i < 4 ? 166 + Math.floor(i / 2) * 200 : 600 + (i - 4) * 200;
    s += rect(x, y, i < 4 ? 504 : 1040, 160, i >= 4 ? '#e7f3ee' : '#fff');
    s += text(x + 24, y + 42, card[0], 23, palette.ink, 700);
    s += text(x + 24, y + 85, card[1], 18) + text(x + 24, y + 122, card[2], 18, palette.muted);
  }
  s += line('M560 546 V596', true) + line('M560 764 V796', true);
  s += text(40, 1004, zh ? '独立部署边界' : 'INDEPENDENT DEPLOYMENT', 14, palette.green, 700);
  s += text(40, 1038, zh ? '/docs/ 与主站 /、硬件站 /hardware-docs/ 分别构建与部署。' : '/docs/ is built and deployed separately from / and /hardware-docs/.', 19);
  s += text(40, 1073, zh ? '普通构建不刷新 Release 数据；开发板观察不自动代表原始发布镜像。' : 'Normal builds do not refresh release data; board observations remain scoped evidence.', 17, palette.muted);
  return svg(title, subtitle, 1104, s);
}

await mkdir(out, {recursive: true});
for (const [lang, c] of Object.entries(copy)) {
  await writeFile(`${out}/documentation.${lang}.svg`, documentationMap(lang));
  await writeFile(`${out}/repository-map.${lang}.svg`, repositoryMap(c));
  await writeFile(`${out}/release-flow.${lang}.svg`, releaseFlow(c));
}
console.log('Updated six architecture diagrams in architecture/.');
