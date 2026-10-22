import React, {type ComponentProps} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import hardwareRoutes from '@site/src/data/hardware-routes.json';

// Resolve documentation and portal links for independently hosted documentation.
export default function DocumentationLink(props: ComponentProps<typeof Link>) {
  const {siteConfig} = useDocusaurusContext();
  const portal = siteConfig.customFields!.developerPortalUrl as string;
  const resolve = (value: string | undefined) => {
    if (value?.startsWith('/') && !value.startsWith('//')) {
      const [pathname] = value.split(/[?#]/);
      const suffix = value.slice(pathname.length);
      const relative = pathname.startsWith(siteConfig.baseUrl) ? pathname.slice(siteConfig.baseUrl.length) : pathname.slice(1);
      const route = relative.replace(/^docs\//, '').replace(/\/$/, '') + '/';
      if (hardwareRoutes.some(r => r.route === route)) return `${siteConfig.customFields!.hardwareUrl}/${route}${suffix}`;
    }
    if (value === '/docs') return '/';
    if (value?.startsWith('/docs/')) return value.slice(5);
    if (value && /^\/(hardware|software|contact|community|blog)([\/#?]|$)/.test(value)) return `${portal}${value}`;
    return value;
  };
  return <Link {...props} to={resolve(props.to)} href={resolve(props.href)} />;
}
