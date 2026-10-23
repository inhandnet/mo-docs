import fs from 'node:fs';
import path from 'node:path';
import {createProcessor} from '@mdx-js/mdx';

export const contractVersion = 1;
export const components = new Set(['Tabs','TabItem','ComingSoon','Only','BoardDownloads','ReleaseNotes','VersionMap','HardwareRedirect','Link','DocCardList','SectionCards','ChooseYourBoard','ImageDownload','ImageReleaseProvider','CodeBlock','AssetLink','MediaSource','ModelCatalog']);
const themeImports = new Set(['@theme/Tabs','@theme/TabItem','@theme/DocCardList','@theme/CodeBlock']);
const html = new Set(['a','img','picture','source','video','div','span','p','strong','em','code','pre','br','small','section','h1','h2','h3','h4','h5','h6','table','thead','tbody','tr','th','td','ul','ol','li','details','summary','sup','sub','hr']);
const processor = createProcessor({format:'mdx'});

function parseable(text) {
  // Heading IDs are Docusaurus syntax, not JavaScript expressions. Exclude
  // fenced teaching examples before normalizing only heading ID suffixes.
  let fence = null;
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, match => '\n'.repeat(match.split('\n').length-1))
    .split('\n').map(line => {
      const delimiter = line.match(/^\s*(`{3,}|~{3,})/);
      if (delimiter) { if (!fence) fence=delimiter[1]; else if(delimiter[1][0]===fence[0]&&delimiter[1].length>=fence.length)fence=null; return line; }
      return !fence && /^\s*#{1,6}\s/.test(line) ? line.replace(/\s+\{#[^}]+\}\s*$/, '') : line;
    }).join('\n');
}

export function validateMDX(text, {file, root, checkFiles = true}) {
  const errors=[]; let tree;
  const fail = (node, message) => errors.push(`${file}:${node.position?.start.line||1}: ${message}`);
  try { tree=processor.parse(parseable(text)); }
  catch(error) { return [`${file}:${error.line||1}: invalid MDX: ${error.reason||error.message}`]; }
  const bindings=new Set(); const partials=new Set();
  for(const node of tree.children.filter(n=>n.type==='mdxjsEsm')) {
    const statements=node.data?.estree?.body||[];
    for(const statement of statements) {
      if(statement.type!=='ImportDeclaration'){fail(node,'Page logic belongs in developer; exports and executable statements are not allowed');continue;}
      const source=statement.source.value;
      const asset=/\.(png|jpe?g|gif|svg|webp|mp4|pdf|nft|service)$/i.test(source);
      const partial=/\.mdx?$/.test(source);
      if(!themeImports.has(source)&&!(asset||partial)){fail(node,`Unsupported import ${source}; use registered components or content/media imports`);continue;}
      if(!themeImports.has(source)) {
        let relative;
        if(source.startsWith('@site/static/')||source.startsWith('@site/docs/'))relative=source.slice(6);
        else if(source.startsWith('.'))relative=path.relative(root,path.resolve(path.dirname(path.join(root,file)),source));
        else {fail(node,`Import must reference repository content: ${source}`);continue;}
        const resolved=path.resolve(root,relative);
        if(!resolved.startsWith(path.resolve(root)+path.sep)) {fail(node,`Import escapes content repository: ${source}`);continue;}
        if(checkFiles) {
          try {
            if(!fs.lstatSync(resolved).isFile()||!fs.realpathSync(resolved).startsWith(fs.realpathSync(root)+path.sep))throw Error();
          }catch{fail(node,`Missing or unsafe content dependency: ${source}`);}
        }
      }
      for(const item of statement.specifiers) {
        if(item.type!=='ImportDefaultSpecifier')fail(node,'Use a default content or component import');
        bindings.add(item.local.name); if(partial)partials.add(item.local.name);
      }
    }
  }
  function safeExpression(node) {
    if(!node)return false;
    if(node.type==='Literal')return ['string','number','boolean'].includes(typeof node.value)||node.value===null;
    if(node.type==='Identifier')return bindings.has(node.name);
    if(node.type==='MemberExpression')return !node.computed&&node.object.type==='Identifier'&&node.object.name==='props'&&node.property.name==='board';
    if(node.type==='TemplateLiteral')return node.expressions.every(safeExpression);
    if(node.type==='ArrayExpression')return node.elements.every(safeExpression);
    return false;
  }
  function expression(value, owner) {
    const body=value.data?.estree?.body;
    if(!body||body.some(item=>item.type!=='ExpressionStatement'||!safeExpression(item.expression)))fail(owner,'Only content/media references, literal values and props.board are allowed; page logic belongs in developer');
  }
  function visit(node) {
    if(node.type==='mdxFlowExpression'||node.type==='mdxTextExpression')expression(node,node);
    if(node.type==='mdxJsxFlowElement'||node.type==='mdxJsxTextElement') {
      if(node.name&&!components.has(node.name)&&!html.has(node.name)&&!partials.has(node.name)&&!bindings.has(node.name))fail(node,`Unregistered component: ${node.name}`);
      for(const attr of node.attributes||[]) {
        if(attr.type!=='mdxJsxAttribute'){fail(node,'JSX spreads are not content');continue;}
        if(/^(on[A-Z]|style$|dangerouslySetInnerHTML$)/.test(attr.name))fail(node,`Implementation attribute is not allowed: ${attr.name}`);
        if(typeof attr.value==='string'&&/^\s*(javascript|data):/i.test(attr.value))fail(node,'Executable URLs are not content');
        if(attr.value?.type==='mdxJsxAttributeValueExpression')expression(attr.value,node);
      }
    }
    for(const child of node.children||[])visit(child);
  }
  visit(tree);return errors;
}
