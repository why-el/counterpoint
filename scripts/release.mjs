import {execFileSync} from 'node:child_process';import {writeFileSync} from 'node:fs';
let revision='uncommitted';try{revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();}catch{}
writeFileSync('dist/release.json',JSON.stringify({name:'Counterpoint',version:'1.0.0',revision,builtAt:new Date().toISOString()},null,2)+'\n');
