#!/usr/bin/env node
// Shared diagram source belongs to developer; this wrapper keeps the local command.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const developer=path.resolve(process.env.DEVELOPER_DIR||path.join(root,'../developer'));
execFileSync(process.execPath,[path.join(developer,'scripts/render-architecture.mjs'),'--repo','mo-docs','--out',path.join(root,'architecture')],{stdio:'inherit'});
