#!/usr/bin/env node
import {mkdir,writeFile} from 'node:fs/promises';
const out=new URL('../architecture/',import.meta.url);
const esc=value=>value.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const groups={
 en:{
  documentation:['Content sources → one developer website',[
   ['mo-docs','docs/ · Markdown and controlled MDX','hardware/ · facts, design files, training','static/ · media and evidence'],
   ['developer integration','Fixed source commits and file hashes','Content contract and route mapping','Generated pages and compatibility paths'],
   ['One Docusaurus website','Components, navigation and search','Integrated preview and browser checks','Complete site release and rollback']]],
  'repository-map':['One owner per maintained source',[
   ['Content and resources','mo-docs: software / hardware content','mo-tools: toolchains / Studio','mo-models: model records / benchmarks'],
   ['Products and applications','Mo*: BSP / images / system integration','mo-examples: complete applications','Independent ordinary source releases'],
   ['developer','Only website frontend and deployment','Frozen release composition','RC acceptance → explicit promotion']]],
  'release-flow':['Content publication and website composition',[
   ['Source repository','Topic PR → required content checks','Admin merge → ordinary VX.Y.Z','Content / metadata / hashes in Release'],
   ['developer RC','Freeze selected source versions','Validate and build the complete site','Publish and verify the test platform'],
   ['developer final','Explicitly inherit accepted RC sources','Build for the production destination','Verify deployment; retain rollback']]],
 },
 'zh-CN':{
  documentation:['内容来源 → 唯一的 developer 网站',[
   ['mo-docs','docs/：Markdown 与受控 MDX','hardware/：事实、设计资料与培训','static/：媒体和证据'],
   ['developer 内容接入','固定来源提交与文件哈希','内容规则、路由与来源映射','生成页面与兼容下载路径'],
   ['一个 Docusaurus 网站','统一组件、导航和搜索','集成预览与浏览器验收','整站发布、部署与回滚']]],
  'repository-map':['每份人工维护源都有明确归属',[
   ['内容与业务资源','mo-docs：软硬件正文和资料','mo-tools：工具链与 Studio','mo-models：模型记录与基准'],
   ['型号与完整应用','Mo*：BSP、镜像与系统集成','mo-examples：完整应用','各源仓库独立发布普通版本'],
   ['developer','唯一的网站前端与部署','冻结发布组成清单','RC 验收后显式晋级正式版']]],
  'release-flow':['内容发布与网站组成',[
   ['源仓库','主题 PR → 必需内容检查','Admin 合并 → 普通 VX.Y.Z','Release 保存内容、元信息与哈希'],
   ['developer RC','冻结选定的来源版本','统一校验并构建完整网站','发布并验收测试平台'],
   ['developer 正式版','显式继承已验收 RC 的来源','按正式环境地址构建','核对线上身份并保留回滚产物']]],
 }
};
await mkdir(out,{recursive:true});
for(const [language,diagrams] of Object.entries(groups))for(const [name,[title,cards]] of Object.entries(diagrams)){
 const body=cards.map(([heading,...lines],index)=>{
  const x=24+index*362;
  return `<rect x="${x}" y="100" width="330" height="220" rx="12" fill="white" stroke="#c6dad4"/><text x="${x+20}" y="140" fill="#006f59" font-size="24" font-weight="700">${esc(heading)}</text>`+lines.map((line,i)=>`<text x="${x+20}" y="${185+i*36}" font-size="17">${esc(line)}</text>`).join('')+(index<2?`<path d="M${x+336} 210h20m-7-6 7 6-7 6" fill="none" stroke="#006f59" stroke-width="2"/>`:'');
 }).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1110 360" role="img" aria-labelledby="title"><title id="title">${esc(title)}</title><rect width="1110" height="360" rx="16" fill="#f3f8f5"/><g font-family="Arial, Noto Sans CJK SC, Microsoft YaHei, sans-serif" fill="#233b34"><text x="24" y="55" font-size="28" font-weight="700">${esc(title)}</text>${body}</g></svg>\n`;
 await writeFile(new URL(`${name}.${language}.svg`,out),svg);
}
console.log('Generated six bilingual architecture diagrams.');
