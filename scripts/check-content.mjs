import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const lock=JSON.parse(fs.readFileSync(path.join(root,'validation/contract-lock.json'),'utf8'));
if(lock.schema_version!==1||lock.contract_version!==1||!/^[a-f0-9]{40}$/.test(lock.commit))throw Error('Invalid pinned validation contract');
for(const [name,expected] of Object.entries(lock.files)) {
  if(!/^[a-z-]+\.mjs$/.test(name))throw Error('Unsafe validation file name');
  const actual=createHash('sha256').update(fs.readFileSync(path.join(root,'validation',name))).digest('hex');
  if(actual!==expected)throw Error(`Validation contract differs from developer ${lock.commit}: ${name}`);
}
const {checkContent}=await import('../validation/check.mjs');
const report=checkContent(root);
if(report.errors.length){console.error(report.errors.join('\n'));process.exitCode=1;}
else console.log(`Validated ${report.documents} document inputs and ${report.assets} mapped hardware assets with content contract ${lock.contract_version}.`);
