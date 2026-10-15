// Components available in every docs page without an import.
import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import {ComingSoon, BoardSpecs, ReleaseNotes, VersionMap, Only, BoardDownloads} from '@site/src/components/DocBlocks';

import DocumentationLink from '@site/src/components/DocumentationLink';

export default {
  ...MDXComponents,
  a: DocumentationLink,
  Tabs,
  TabItem,
  ComingSoon,
  BoardSpecs,
  ReleaseNotes,
  VersionMap,
  Only,
  BoardDownloads,
};
