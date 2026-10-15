import fs from 'node:fs/promises';
import path from 'node:path';

// Keep the bundled Roboto copyright, license, and provenance with every export.
export default function fontLicensePlugin({siteDir}) {
  return {
    name: 'font-license',
    async postBuild({outDir}) {
      const output = path.join(outDir, 'fonts');
      await fs.mkdir(output, {recursive: true});
      await Promise.all(['OFL.txt', 'SOURCES.txt'].map(file =>
        fs.copyFile(path.join(siteDir, 'src/css/fonts', file), path.join(output, file))));
    },
  };
}
