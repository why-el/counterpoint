import {execFileSync} from 'node:child_process';import {writeFileSync,readFileSync} from 'node:fs';
let revision='uncommitted';try{revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
writeFileSync('dist/release.json',JSON.stringify({name:'Counterpoint',version:JSON.parse(readFileSync('package.json','utf8')).version,revision,builtAt:new Date().toISOString()},null,2)+'\n');
