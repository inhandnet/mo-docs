export const targets = {
  test: 'https://developer.inhand.online',
  production: 'https://developer.inhand.com',
};
export function targetEnvironment(target) {
  const url = targets[target];
  if (!url) throw new Error('Build target must be test or production.');
  return {SITE_ENVIRONMENT: target, DOCS_PREVIEW: '0', DOCS_SITE_URL: url,
    DOCS_BASE_URL: '/docs/', DEVELOPER_PORTAL_URL: url, HARDWARE_URL: `${url}/hardware-docs`};
}
