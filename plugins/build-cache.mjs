// Docusaurus' persistent Webpack cache watches the config file, but not changes
// to the environment values it reads. CSS font URLs include output.publicPath.
// Evict cached modules when switching between office / and production /docs/.
export default function buildCachePlugin({siteConfig}) {
  return {
    name: 'deployment-aware-build-cache',
    configureWebpack(config) {
      if (!config.cache || typeof config.cache !== 'object' || config.cache.type !== 'filesystem') return {};
      return {cache: {...config.cache, version: `${config.cache.version}:${siteConfig.url}:${siteConfig.baseUrl}`}};
    },
  };
}
