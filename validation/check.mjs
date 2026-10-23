import fs from 'node:fs';
import path from 'node:path';
import {validateMDX} from './content.mjs';
import {validateContentMap} from './content-map.mjs';
import {validateResourceMap} from './resources.mjs';
import {validateSpecifications} from './specifications.mjs';

export function checkContent(root) {
  const errors=[];let documents=0;let assets=0;
  const read=file=>JSON.parse(fs.readFileSync(path.join(root,file),'utf8'));
  function walk(directory) {
    const result=[];
    for(const item of fs.readdirSync(path.join(root,directory),{withFileTypes:true})) {
      const name=`${directory}/${item.name}`;
      if(item.isSymbolicLink()){errors.push(`${name}: symlinks are not content`);continue;}
      if(item.isDirectory())result.push(...walk(name));else result.push(name);
    }
    return result;
  }
  for(const entry of ['src','plugins','docusaurus.config.ts','sidebars.ts']) {
    if(fs.existsSync(path.join(root,entry)))errors.push(`${entry}: website implementation belongs in developer`);
  }
  for(const file of walk('docs')) {
    if(file.endsWith('.mdx')) {
      errors.push(...validateMDX(fs.readFileSync(path.join(root,file),'utf8'),{root,file}));documents++;
    } else if(file.endsWith('.json')) {try{read(file);}catch(error){errors.push(`${file}: ${error.message}`);}}
  }
  try {
    const map=validateContentMap(root,read('content/hardware-map.json'));
    documents+=map.routes.length;assets+=map.assets.length;
    for(const entry of map.routes) {
      // These sources are rendered as Markdown; HTML implementation stays out
      // of authored content. Code fences are tutorial text and are excluded.
      const source=fs.readFileSync(path.join(root,entry.source),'utf8').replace(/(^|\n)(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n\2(?=\n|$)/g,'\n');
      if(/<(script|style)\b|\bon(?:click|load|error)\s*=/i.test(source))errors.push(`${entry.source}: executable HTML is not content`);
    }
    const aliases=read('content/asset-aliases.json');
    if(aliases.schema_version!==1||!Array.isArray(aliases.aliases))throw Error('unsupported asset alias schema');
    const targets=new Set();
    for(const alias of aliases.aliases) {
      if(!/^static\/(img|downloads)\//.test(alias.target)||alias.target.includes('..')||targets.has(alias.target))throw Error(`Invalid or duplicate alias ${alias.target}`);
      targets.add(alias.target);
      const source=path.resolve(root,alias.source);
      if(!source.startsWith(path.resolve(root)+path.sep)||!fs.lstatSync(source).isFile()||!fs.realpathSync(source).startsWith(fs.realpathSync(root)+path.sep))throw Error(`Missing or unsafe alias source ${alias.source}`);
      if(fs.existsSync(path.join(root,alias.target)))throw Error(`Alias has a duplicate maintained file: ${alias.target}`);
    }
  }catch(error){errors.push(`content/hardware-map.json: ${error.message}`);}
  try {
    if(fs.existsSync(path.join(root,'content/resource-map.json'))) {
      const resources=validateResourceMap(read('content/resource-map.json'));
      for(const file of [...resources.files,...resources.bundles]) if(fs.existsSync(path.join(root,'static',file.target)))throw Error(`Resource has a duplicate maintained source: ${file.target}`);
    }
  }catch(error){errors.push(`content/resource-map.json: ${error.message}`);}
  try {
    const file='hardware/products/mo62a/overview/specifications.json';
    if(fs.existsSync(path.join(root,file)))validateSpecifications(read(file));
  }catch(error){errors.push(`Product specifications: ${error.message}`);}
  for(const directory of ['static','hardware'])for(const file of walk(directory)) {
    const descriptor=fs.openSync(path.join(root,file),'r');const head=Buffer.alloc(80);
    try{fs.readSync(descriptor,head,0,80,0);}finally{fs.closeSync(descriptor);}
    if(head.toString().startsWith('version https://git-lfs.github.com/spec/v1'))errors.push(`${file}: unresolved LFS pointer`);
  }
  return {documents,assets,errors};
}
