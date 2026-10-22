import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes} from 'prism-react-renderer';
import hardwareRoutes from './src/data/hardware-routes.json';

const baseUrl = process.env.DOCS_BASE_URL ?? '/';
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(baseUrl)) throw new Error('DOCS_BASE_URL must start and end with /');
const portal = (process.env.DEVELOPER_PORTAL_URL ?? 'https://www.inhand.com/developer').replace(/\/$/, '');
const preview = process.env.DOCS_PREVIEW === '1';
const hardwareUrl = (process.env.HARDWARE_URL ?? 'https://developer.inhand.online/hardware-docs').replace(/\/$/, '');
if (!/^https?:\/\//.test(hardwareUrl)) throw new Error('HARDWARE_URL must be an absolute HTTP(S) URL');
const config: Config = {
  title: 'InHand Developer Documentation',
  tagline: 'Build with InHand. Documentation for Mo single-board computers.',
  favicon: 'img/favicon.png',
  url: process.env.DOCS_SITE_URL ?? 'https://www.inhand.com',
  baseUrl,
  customFields: {developerPortalUrl: portal, hardwareUrl},
  trailingSlash: true,
  organizationName: 'inhandnet', projectName: 'mo-docs',
  onBrokenLinks: 'throw',
  onBrokenAnchors: 'throw',
  markdown: {hooks: {onBrokenMarkdownLinks: 'throw', onBrokenMarkdownImages: 'throw'}},
  i18n: {defaultLocale: 'en', locales: ['en']},
  headTags: preview ? [{tagName: 'meta', attributes: {name: 'robots', content: 'noindex, nofollow'}}] : [],
  plugins: ['./plugins/build-cache.mjs', './plugins/search.mjs', './plugins/font-license.mjs'],
  presets: [['classic', {
    docs: {path: 'docs', routeBasePath: '/', sidebarPath: './sidebars.ts', editUrl: 'https://github.com/inhandnet/mo-docs/edit/master/', showLastUpdateTime: false, showLastUpdateAuthor: false, breadcrumbs: true,
      async sidebarItemsGenerator(args) {
        const items = await args.defaultSidebarItemsGenerator(args);
        const migrate = (item: any): any => {
          if (item.type === 'category') {
            // Docusaurus category links must remain doc links. Their landing
            // pages redirect; individual children link directly to hardware.
            return {...item, items: item.items.map(migrate)};
          }
          const record = hardwareRoutes.find(r => r.doc === item.id);
          if (!record) return item;
          const metadata = args.docs.find(d => d.id === item.id);
          return {type:'link', label:item.label ?? metadata?.title ?? item.id,
            href:`${hardwareUrl}/${record.route}`};
        };
        return items.map(migrate);
      },
    },
    blog: false, pages: false,
    sitemap: preview ? false : {changefreq: 'weekly',
      ignorePatterns: hardwareRoutes.map(r => `${baseUrl}${r.route}`)},
    theme: {customCss: './src/css/custom.css'},
  } satisfies Preset.Options]],
  themeConfig: {
    colorMode: {defaultMode: 'light', disableSwitch: true, respectPrefersColorScheme: false},
    docs: {sidebar: {hideable: true, autoCollapseCategories: true}},
    announcementBar: preview ? {id: 'mo-docs-preview', content: 'Preview of the InHand developer documentation. Content marked <b>Coming soon</b> is planned but not yet written.', isCloseable: true} : undefined,
    navbar: {
      title: 'Developer', logo: {alt: 'InHand Networks', src: 'img/logo.svg', href: portal, target: '_self'},
      items: [
        {href: `${portal}/`, label: 'Home', position: 'left', target: '_self'},
        {href: `${portal}/hardware`, label: 'Hardware', position: 'left', target: '_self'},
        {href: `${portal}/software`, label: 'Software', position: 'left', target: '_self'},
        {type: 'docSidebar', sidebarId: 'documentation', label: 'Documentation', position: 'left', activeBaseRegex: '.*'},
        {href: `${portal}/blog`, label: 'Blog', position: 'left', target: '_self'},
        {href: `${portal}/community`, label: 'Community', position: 'left', target: '_self'},
        {href: `${portal}/contact`, label: 'Contact', position: 'left', target: '_self'},
        {type: 'search', position: 'right'},
        {href: 'https://inhandgo.com', label: 'Buy', position: 'right', className: 'navbar-buy'},
      ],
    },
    footer: {style: 'light', copyright: 'InHand Networks · Developer Documentation · Content: CC BY-SA 4.0'},
    prism: {theme: themes.github, additionalLanguages: ['bash', 'json', 'python']},
  } satisfies Preset.ThemeConfig,
};
export default config;
