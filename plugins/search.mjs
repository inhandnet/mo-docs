import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

export default function searchPlugin({siteDir}) {
  return {
    name: 'local-documentation-search',
    configureWebpack(_config, isServer) {
      // The search bar loads the Pagefind index in the browser with
      // import(/* webpackIgnore: true */ url). For the server build, Docusaurus
      // rewrites import() into require(url), which webpack reports as a
      // "Critical dependency". That code never runs during prerendering, so
      // only this exact server-side warning is ignored.
      if (!isServer) return {};
      return {
        ignoreWarnings: [
          {module: /src[\\/]theme[\\/]SearchBar[\\/]index\.tsx$/, message: /Critical dependency: the request of a dependency is an expression/},
        ],
      };
    },
    async postBuild({outDir}) {
      // Native ESM subprocess avoids the framework's CommonJS config loader.
      const {stdout} = await promisify(execFile)(process.execPath, [path.join(siteDir, 'scripts/index-search.mjs'), outDir]);
      console.log(stdout.trim());
    },
  };
}
