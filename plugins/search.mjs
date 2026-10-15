import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

export default function searchPlugin({siteDir}) {
  return {
    name: 'local-documentation-search',
    async postBuild({outDir}) {
      // Native ESM subprocess avoids the framework's CommonJS config loader.
      const {stdout} = await promisify(execFile)(process.execPath, [path.join(siteDir, 'scripts/index-search.mjs'), outDir]);
      console.log(stdout.trim());
    },
  };
}
