import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join, resolve} from 'node:path';
import {tmpdir} from 'node:os';

const scripts=resolve('scripts'), deploy=resolve('.github/scripts/deploy-site.sh');
function fixture(t) {
  const dir=mkdtempSync(join(tmpdir(),'mo-deploy-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
  const git=(...args)=>execFileSync('git',args,{cwd:dir,encoding:'utf8',stdio:'pipe'}).trim();
  git('init','-q');git('-c','user.name=Test','-c','user.email=test@example.invalid','commit','--allow-empty','-qm','docs: test');
  mkdirSync(join(dir,'build'));symlinkSync(scripts,join(dir,'scripts'));
  const marker={version:'V8.0.0-rc1',commit:git('rev-parse','HEAD'),environment:'test',siteUrl:'https://developer.inhand.online',baseUrl:'/docs/',url:'https://developer.inhand.online/docs/',preview:false};
  writeFileSync(join(dir,'build/index.html'),'<h1>Test</h1>');writeFileSync(join(dir,'build/deployment.json'),JSON.stringify(marker));
  const run=(file,args=[],env={})=>spawnSync('node',[join(scripts,file),...args],{cwd:dir,env:{...process.env,VERSION:marker.version,...env},encoding:'utf8'});
  assert.equal(run('package-site.mjs',['test',marker.version]).status,0);
  const archive=`dist/mo-docs-${marker.version}-test.tar.gz`;
  const checksum=()=>writeFileSync(join(dir,'dist/SHA256SUMS'),createHash('sha256').update(readFileSync(join(dir,archive))).digest('hex')+'  '+archive.slice(5)+'\n');
  checksum();return {dir,marker,run,archive,checksum};
}

test('packaging rejects the wrong target; deployment rejects wrong metadata and unlisted archives', t => {
  const f=fixture(t);
  assert.equal(f.run('package-site.mjs',['production',f.marker.version]).status,1);
  assert.equal(f.run('verify-deployment.mjs',[f.archive,'test']).status,0);
  assert.equal(f.run('verify-deployment.mjs',[f.archive,'production']).status,1);
  assert.equal(f.run('verify-deployment.mjs',[f.archive,'test'],{VERSION:'V8.0.0-rc2'}).status,1);
  writeFileSync(join(f.dir,'dist/SHA256SUMS'),'');assert.equal(f.run('verify-deployment.mjs',[f.archive,'test']).status,1);
});

test('deployment checks online version and fails when credentials are absent', t => {
  const f=fixture(t), live=join(f.dir,'live.json');writeFileSync(live,JSON.stringify(f.marker));
  assert.equal(f.run('verify-deployment.mjs',[f.archive,'test',live]).status,0);
  writeFileSync(live,JSON.stringify({...f.marker,commit:'a'.repeat(40)}));
  assert.match(f.run('verify-deployment.mjs',[f.archive,'test',live]).stderr,/Live deployment mismatch/);
  const missing=spawnSync('bash',[deploy,f.archive],{cwd:f.dir,env:{...process.env,DEPLOY_SSH_KEY:''},encoding:'utf8'});
  assert.notEqual(missing.status,0);assert.match(missing.stderr,/DEPLOY_SSH_KEY is required/);
});

test('SSH adapter completes only after the online marker agrees (isolated command stubs)', t => {
  const f=fixture(t);mkdirSync(join(f.dir,'bin'));
  writeFileSync(join(f.dir,'live.json'),JSON.stringify(f.marker));
  writeFileSync(join(f.dir,'bin/ssh'),'#!/bin/sh\ncat > /dev/null\ntouch "$TEST_SENT"\n',{mode:0o755});
  writeFileSync(join(f.dir,'bin/curl'),'#!/bin/sh\nwhile [ "$#" -gt 0 ]; do\n if [ "$1" = -o ]; then cp "$TEST_LIVE" "$2"; exit; fi\n shift\ndone\nexit 1\n',{mode:0o755});
  const result=spawnSync('bash',[deploy,f.archive],{cwd:f.dir,encoding:'utf8',env:{...process.env,PATH:join(f.dir,'bin')+':'+process.env.PATH,
    VERSION:f.marker.version,DEPLOY_PLATFORM:'test',DEPLOY_HOST:'example.invalid',DEPLOY_USER:'test',DEPLOY_SSH_KEY:'fixture only',DEPLOY_HOST_KEY:'fixture only',TEST_SENT:join(f.dir,'sent'),TEST_LIVE:join(f.dir,'live.json')}});
  assert.equal(result.status,0,result.stderr);assert.ok(existsSync(join(f.dir,'sent')));assert.match(result.stdout,/Verified online test deployment/);
});
