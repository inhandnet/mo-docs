import React, {useEffect, useState} from 'react';
import Head from '@docusaurus/Head';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function HardwareRedirect({route}: {route: string}) {
  const {siteConfig} = useDocusaurusContext();
  const target = `${siteConfig.customFields!.hardwareUrl}/${route}`;
  const [href, setHref] = useState(target);
  useEffect(() => {
    const destination = target + window.location.search + window.location.hash;
    setHref(destination);
    window.location.replace(destination);
  }, [target]);
  return <>
    <Head><link rel="canonical" href={target} />
      {!siteConfig.customFields!.documentationPreview && <meta name="robots" content="noindex, follow" />}
    </Head>
    <p>This hardware reference has moved to the independently maintained hardware documentation.</p>
    <p><a href={href}>Continue to this page in Hardware documentation</a>.</p>
    <noscript><p>JavaScript is disabled. Follow the link above; keep any section fragment from the original address.</p></noscript>
  </>;
}
