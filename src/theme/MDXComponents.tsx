// Components available in every docs page without an import.
import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {ComingSoon, BoardSpecs, ReleaseNotes, VersionMap, Only, BoardDownloads} from '@site/src/components/DocBlocks';

import DocumentationLink from '@site/src/components/DocumentationLink';
import type {ComponentProps} from 'react';

// Every Markdown table scrolls inside its own wrapper instead of widening the page.
function Table(props: ComponentProps<'table'>) {
  return (
    <div className="mo-table">
      <table {...props} />
    </div>
  );
}

export default {
  ...MDXComponents,
  a: DocumentationLink,
  table: Table,
  Tabs,
  TabItem,
  ComingSoon,
  BoardSpecs,
  ReleaseNotes,
  VersionMap,
  Only,
  BoardDownloads,
};
