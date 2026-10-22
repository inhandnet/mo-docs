// Components available in every docs page without an import.
import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {ComingSoon, BoardSpecs, ReleaseNotes, VersionMap, Only, BoardDownloads} from '@site/src/components/DocBlocks';

import DocumentationLink from '@site/src/components/DocumentationLink';
import type {ComponentProps} from 'react';
import DocumentationTable from '@site/src/components/DocumentationTable';
import HardwareRedirect from '@site/src/components/HardwareRedirect';

// A path, identifier or option is one token; commands can wrap at spaces.
function Code({children, ...props}: ComponentProps<'code'>) {
  const OriginalCode = MDXComponents.code;
  if (typeof children !== 'string' || props.className || children.includes('\n')) {
    return <OriginalCode {...props}>{children}</OriginalCode>;
  }
  return <code {...props}>{children.split(/(\s+)/).map((token, index) =>
    /^\s+$/.test(token) ? token : <span className="mo-code-token" key={index}>{token}</span>,
  )}</code>;
}

export default {
  ...MDXComponents,
  a: DocumentationLink,
  table: DocumentationTable,
  code: Code,
  Tabs,
  TabItem,
  ComingSoon,
  BoardSpecs,
  ReleaseNotes,
  VersionMap,
  Only,
  BoardDownloads,
  HardwareRedirect,
};
