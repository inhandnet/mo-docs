#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateReleaseVersion,readRepositoryVersions} from './validate-release-version.mjs';
import {git} from './lib/policy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const version=process.argv[2];
const versions=readRepositoryVersions();validateReleaseVersion(version,versions.packageVersion,versions.lockVersion);
if(git('status','--porcelain'))throw Error('Content releases require a clean checkout');
execFileSync(process.execPath,['scripts/check-content.mjs'],{stdio:'inherit'});
const commit=git('rev-parse','HEAD');const epoch=git('show','-s','--format=%ct','HEAD');
const contract=JSON.parse(fs.readFileSync('validation/contract-lock.json','utf8'));
const roots=['docs','static','hardware','content','validation','LICENSE','README.md','README.zh-CN.md','ARCHITECTURE.md','CONTRIBUTING.md','CONTRIBUTING.zh-CN.md'];
const files=[];
function collect(name){
  const info=fs.lstatSync(name);if(info.isSymbolicLink())throw Error(`Symlink in content package: ${name}`);
  if(info.isDirectory()){for(const child of fs.readdirSync(name).sort())collect(`${name}/${child}`);}
  else files.push({path:name,bytes:info.size,sha256:createHash('sha256').update(fs.readFileSync(name)).digest('hex')});
}
for(const name of roots)collect(name);
fs.mkdirSync('dist',{recursive:true});
fs.writeFileSync('dist/content-manifest.json',JSON.stringify({schema_version:1,repository:'inhandnet/mo-docs',version,commit,contract:{version:contract.contract_version,commit:contract.commit},files},null,2)+'\n');
const archive=`mo-docs-${version}-content.tar.gz`;
execFileSync('tar',['--sort=name',`--mtime=@${epoch}`,'--owner=0','--group=0','--numeric-owner','-czf',`dist/${archive}`,...roots,'-C','dist','content-manifest.json']);
execFileSync(process.execPath,['scripts/generate-changelog.mjs','--version',version,'--output','dist'],{stdio:'inherit'});
fs.writeFileSync('dist/release.json',JSON.stringify({schema_version:1,kind:'documentation-content',version,commit,archives:[{file:archive}],manifest:'content-manifest.json'},null,2)+'\n');
const artifacts=[archive,'content-manifest.json','release.json','CHANGELOG.en.md','CHANGELOG.zh-CN.md','release-notes.md'];
fs.writeFileSync('dist/SHA256SUMS',artifacts.map(name=>createHash('sha256').update(fs.readFileSync(`dist/${name}`)).digest('hex')+'  '+name+'\n').join(''));
console.log(`Packaged ${files.length} content files for ${version}; no website build or deployment.`);
