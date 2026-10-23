import test from 'node:test';
import assert from 'node:assert/strict';
import {validateReleaseVersion} from '../scripts/validate-release-version.mjs';
test('new content releases accept ordinary versions and reject candidate channels',()=>{
  assert.equal(validateReleaseVersion('V1.0.2','1.0.1','1.0.1'),'1.0.2');
  for(const version of ['V1.0.2-rc1','v1.0.2','V01.0.2','V1.0.2-beta1','V1.0.2 extra'])assert.throws(()=>validateReleaseVersion(version,'1.0.1','1.0.1'));
  assert.throws(()=>validateReleaseVersion('V1.0.2','1.0.1','1.0.0'));
});
