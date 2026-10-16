'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),runtime=path.join(root,'extension');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{assert.ok(!e.isSymbolicLink(),'No runtime symlinks');const p=path.join(dir,e.name);return e.isDirectory()?files(p):[p];});}
function check(){
 const manifest=JSON.parse(fs.readFileSync(path.join(runtime,'manifest.json'),'utf8')),pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')),config=require('./package.config.json');
 assert.equal(manifest.manifest_version,3);assert.equal(manifest.version,pkg.version,'Package/manifest versions differ');
 const actual=files(runtime).map(p=>path.relative(runtime,p).replaceAll('\\','/')).sort();
 assert.deepEqual(actual,[...config.files].sort(),'Only allowlisted runtime files belong in extension/');
 const refs=[...(manifest.content_scripts||[]).flatMap(c=>[...(c.js||[]),...(c.css||[])]),...Object.values(manifest.icons||{}),manifest.background?.service_worker,manifest.action?.default_popup,manifest.options_ui?.page].filter(Boolean);
 for(const resource of (manifest.web_accessible_resources||[]).flatMap(r=>r.resources||[]))if(!resource.includes('*'))refs.push(resource);
 for(const ref of refs){const rel=ref.replace(/^\/+/,'');assert.ok(!rel.split('/').includes('..')&&!/^[a-z]+:/i.test(rel));assert.ok(actual.includes(rel),'Missing manifest asset: '+rel);}
 for(const rel of actual){const full=path.join(runtime,rel);if(/\.(c?js|mjs)$/.test(rel))execFileSync(process.execPath,['--check',full]);if(rel.endsWith('.json'))JSON.parse(fs.readFileSync(full,'utf8'));}
 if(manifest.default_locale){for(const locale of ['en','de']){const messages=JSON.parse(fs.readFileSync(path.join(runtime,'_locales',locale,'messages.json'),'utf8'));for(const field of ['name','description']){const key=/^__MSG_(\w+)__$/.exec(manifest[field])?.[1];assert.ok(key&&messages[key]?.message,'Missing translation: '+locale+' '+field);}assert.ok(messages.extensionDescription.message.length<=132);}}
 if(config.extraCheck)execFileSync(process.execPath,[path.join(root,config.extraCheck)],{stdio:'inherit'});
 console.log('PASS: extension/ manifest, version, resource allowlist and JavaScript syntax ('+actual.length+' files).');
 return {manifest,config,actual,runtime};
}
module.exports=check;if(require.main===module)check();
