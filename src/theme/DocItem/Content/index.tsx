import React from 'react';
import Original from '@theme-original/DocItem/Content';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import type {Props} from '@theme/DocItem/Content';
import hardwareRoutes from '@site/src/data/hardware-routes.json';

export default function Content(props: Props) {
  const {metadata} = useDoc();
  const productId = metadata.id.split('/')[0];
  const product = productId.startsWith('mo-') ? productId.replace('mo-', 'Mo ').toUpperCase().replace('MO ', 'Mo ') : 'General';
  return <div data-pagefind-body={hardwareRoutes.some(r => r.doc === metadata.id) ? undefined : true}>
    <span hidden data-pagefind-meta="title">{metadata.title}</span><span hidden data-pagefind-filter="product">{product}</span>
    <Original {...props} />
  </div>;
}
