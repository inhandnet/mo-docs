#!/usr/bin/env node
import {writeFileSync} from 'node:fs';
import {git} from './lib/policy.mjs';
const siteUrl = process.env.DOCS_SITE_URL || 'https://developer.inhand.com';
const baseUrl = process.env.DOCS_BASE_URL || '/';
const data = {version: process.env.DOCS_VERSION || 'development', commit: git('rev-parse', 'HEAD'),
  sourceDate: git('show', '-s', '--format=%cI', 'HEAD'),
  environment: process.env.SITE_ENVIRONMENT || 'local',
  siteUrl, baseUrl, url: new URL(baseUrl, siteUrl).href,
  preview: process.env.DOCS_PREVIEW === '1'};
writeFileSync('build/deployment.json', JSON.stringify(data, null, 2) + '\n');
