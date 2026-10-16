'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),config=require('./package.config.json');
if(config.compile)execFileSync(process.execPath,[path.join(root,config.compile)],{stdio:'inherit'});
const {manifest,actual,runtime}=require('./check.cjs')();
if(!/^[a-z0-9-]+$/.test(config.slug)||!/^\d+\.\d+\.\d+$/.test(manifest.version))throw new Error('Invalid package name/version');
const dist=path.join(root,'dist'),name=config.slug+'-'+manifest.version,out=path.join(dist,name),zip=path.join(dist,name+'.zip');
fs.mkdirSync(dist,{recursive:true});
if(fs.lstatSync(dist).isSymbolicLink()||fs.realpathSync(dist).toLowerCase()!==path.resolve(dist).toLowerCase())throw new Error('Unsafe dist directory');
function confined(p){const resolved=path.resolve(p);if(!resolved.startsWith(dist+path.sep))throw new Error('Unsafe artifact path');let parent=resolved;while(parent!==dist){if(fs.existsSync(parent)&&fs.lstatSync(parent).isSymbolicLink())throw new Error('Artifact symlink not allowed');parent=path.dirname(parent);}return resolved;}
const old=[out,zip,zip+'.sha256',path.join(dist,name+'-build.json')].filter(p=>fs.existsSync(p));
if(old.length){const archive=confined(path.join(dist,'archive',Date.now()+'-'+crypto.randomUUID()));fs.mkdirSync(archive,{recursive:true});for(const source of old){confined(source);const target=confined(path.join(archive,path.basename(source)));fs.renameSync(source,target);}console.log('Previous build preserved: '+archive);}
fs.mkdirSync(out);
const chunks=[],central=[],hashes=[];let offset=0;
function crc32(bytes){let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let i=0;i<8;i++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
for(const rel of actual){
 const bytes=fs.readFileSync(path.join(runtime,rel)),target=path.join(out,rel);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);hashes.push({path:rel,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
 const entry=Buffer.from(rel),crc=crc32(bytes),header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(0x21,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(bytes.length,18);header.writeUInt32LE(bytes.length,22);header.writeUInt16LE(entry.length,26);chunks.push(header,entry,bytes);
 const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(0x21,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(bytes.length,20);c.writeUInt32LE(bytes.length,24);c.writeUInt16LE(entry.length,28);c.writeUInt32LE(offset,42);central.push(c,entry);offset+=header.length+entry.length+bytes.length;
}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(actual.length,8);end.writeUInt16LE(actual.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
fs.writeFileSync(zip,Buffer.concat([...chunks,directory,end]));const sha256=crypto.createHash('sha256').update(fs.readFileSync(zip)).digest('hex');
fs.writeFileSync(zip+'.sha256',sha256+'  '+path.basename(zip)+'\n');
fs.writeFileSync(path.join(dist,name+'-build.json'),JSON.stringify({version:manifest.version,sha256,builtAt:new Date().toISOString(),source:'extension/',manualChromeReload:'pending',files:hashes},null,2)+'\n');
console.log('Load in Chrome: '+runtime+'\nUnpacked package: '+out+'\nZIP: '+zip);
