import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const developer=path.resolve(process.env.DEVELOPER_DIR||path.join(root,'../developer'));
const child=spawn('npm',['--prefix',developer,'run','preview','--','--source',`mo-docs=${root}`,...process.argv.slice(2)],{stdio:'inherit'});
child.on('error',error=>{console.error(`Install the developer checkout and its dependencies first: ${error.message}`);process.exitCode=1;});
child.on('exit',code=>{process.exitCode=code||0;});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
