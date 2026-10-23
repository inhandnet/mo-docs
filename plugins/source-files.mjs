// Embed the maintained downloadable examples in MDX without a duplicate copy.
export default function sourceFiles() {
  return {
    name: 'mo-source-files',
    configureWebpack() {
      return {module: {rules: [{test: /\.(nft|service)$/, type: 'asset/source'}]}};
    },
  };
}
