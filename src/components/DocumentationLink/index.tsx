import React, {type ComponentProps} from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// Resolve documentation and portal links for independently hosted documentation.
export default function DocumentationLink(props: ComponentProps<typeof Link>) {
  const {siteConfig} = useDocusaurusContext();
  const portal = siteConfig.customFields!.developerPortalUrl as string;
  const resolve = (value: string | undefined) => {
    if (value === '/docs') return '/';
    if (value?.startsWith('/docs/')) return value.slice(5);
    if (value && /^\/(hardware|software|contact|community|blog)([\/#?]|$)/.test(value)) return `${portal}${value}`;
    return value;
  };
  return <Link {...props} to={resolve(props.to)} href={resolve(props.href)} />;
}
