'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const M=require(path.join(root,'dist/model.js'));
const layout=JSON.parse(fs.readFileSync(path.join(root,'dist/assets/templates/source-layout.json'),'utf8'));
const sandbox=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,'dist/classic-templates.js'),'utf8'),sandbox);
const C=sandbox.ClassicTemplates;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function currentProject(template='PM-FP-001'){
 const p=M.cloneProject(M.seed().projects[0]);
 return {...p,template,code:'CURRENT-REPORT-2027',customer:'ลูกค้าของงานปัจจุบัน',site:'สาขาทดลอง',date:'2027-01-10'};
}
function render(s,p=currentProject(),extra={}){
 return C.render({s,p,esc:escape,questions:M.questions,photos:[],urls:new Map(),pageNo:1,total:5,answerLabel:()=>'',testTable:()=>'',chart:()=>'<svg data-current-chart="true"></svg>',formatDate:()=>'',...extra});
}
function pngDimensions(file){
 const data=fs.readFileSync(file);
 assert.equal(data.subarray(0,8).toString('hex'),'89504e470d0a1a0a',file+' must be PNG');
 return {width:data.readUInt32BE(16),height:data.readUInt32BE(20)};
}
function hash(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')}

test('ClassicTemplates exports two independently identified source templates',()=>{
 assert(C&&typeof C.render==='function'&&typeof C.get==='function');
 assert.deepEqual(Object.keys(C.meta).sort(),['PM-FP-001','PT-FP-001']);
 const pm=C.get(currentProject('PM-FP-001')),pt=C.get(currentProject('PT-FP-001'));
 assert.equal(pm.key,'pm151');assert.equal(pt.key,'pt095');
 assert.equal(pm.pages,56);assert.equal(pt.pages,44);
 assert.equal(pm.performancePage,44);assert.equal(pt.performancePage,26);
 assert.equal(pm.landscapePage,43);assert.equal(pt.landscapePage,25);
 assert.equal(pm.title,'Preventive Maintenance');assert.equal(pt.title,'Performance Test');
});

test('both templates retain their own source PDF and native-ratio cover artwork',()=>{
 const originalNames={pm151:'PM.FP.69-151 ครัวการบินกรุงเทพ-เชียงใหม่ 1-1 2569 .pdf',pt095:'PMFP69~1.PDF'};
 const pdfHashes=[];
 for(const key of ['pm151','pt095']){
  const base=path.join(root,'dist/assets/templates',key);
  const pdf=path.join(base,'reference.pdf');
  assert(fs.statSync(pdf).size>100000,'Missing full reference PDF '+key);
  assert.equal(fs.readFileSync(pdf).subarray(0,5).toString(),'%PDF-');
  const original=path.join(root,'..',originalNames[key]);
  if(fs.existsSync(original))assert.equal(hash(pdf),hash(original),'Reference PDF changed for '+key);
  pdfHashes.push(hash(pdf));
  for(const asset of ['cover-base.png','original-cover.png']){
   const dims=pngDimensions(path.join(base,asset));
   assert(dims.width>=612&&dims.height>=792,'Insufficient cover asset resolution: '+key+'/'+asset);
   assert(Math.abs(dims.width/dims.height-612/792)<0.002,'Cover must keep native Letter ratio: '+key+'/'+asset);
  }
 }
 assert.notEqual(pdfHashes[0],pdfHashes[1],'Reference PDFs must not be substituted for one another');
 pngDimensions(path.join(root,'dist/assets/templates/pakorn-logo.png'));
});

test('source-layout accounts for all 100 pages without missing or repeated page numbers',()=>{
 assert.equal(Object.values(layout).reduce((n,d)=>n+d.pageCount,0),100);
 for(const [key,count]of [['pm151',56],['pt095',44]]){
  const doc=layout[key];assert.equal(doc.pageCount,count);assert.equal(doc.pages.length,count);
  assert.deepEqual(doc.pages.map(p=>p.page),Array.from({length:count},(_,i)=>i+1));
  for(const p of doc.pages){
   assert(Number.isFinite(p.width)&&p.width>0);assert(Number.isFinite(p.height)&&p.height>0);
   assert(Array.isArray(p.lines));
   for(const line of p.lines){
    assert.equal(typeof line.text,'string');
    for(const metric of ['x','y','width','height'])assert(Number.isFinite(line[metric]),`${key} page ${p.page}: invalid ${metric}`);
   }
  }
 }
});

test('native page geometry matches Letter including landscape 43/25 and AGC A4 annexes',()=>{
 for(const [key,landscape]of [['pm151',43],['pt095',25]]){
  for(const p of layout[key].pages){
   if(p.page===landscape){assert.equal(p.width,792);assert.equal(p.height,612)}
   else if(key==='pt095'&&p.page>=37&&p.page<=43){
    assert(Math.abs(p.width-595.2)<0.001);assert(Math.abs(p.height-841.67999)<0.001);
   }else{assert.equal(p.width,612,`${key} page ${p.page}`);assert.equal(p.height,792,`${key} page ${p.page}`)}
  }
  assert.deepEqual(layout[key].pages.filter(p=>p.width>p.height).map(p=>p.page),[landscape]);
 }
});

test('cover rendering selects separate artwork and current customer/code for each template',()=>{
 for(const [template,key,title]of [['PM-FP-001','pm151','Preventive Maintenance'],['PT-FP-001','pt095','Performance Test']]){
  const p=currentProject(template),html=render('cover',p);
  assert(html.includes(`assets/templates/${key}/cover-base.png`));
  assert(html.includes(`data-template="${key}"`));assert(html.includes(title));
  assert(html.includes(p.customer));assert(html.includes(p.code));
  assert(!html.includes('original-cover.png'),'Original customer/code must not be reused as generated cover');
  assert(!html.includes('reference.pdf'),'Entire historical report must not be generated output');
 }
});

test('generated content never reuses historical report pages or signatures',()=>{
 const p=currentProject();p.signature='HISTORICAL-SIGNATURE-SENTINEL';p.signed_by='HISTORICAL-SIGNER-SENTINEL';
 for(const s of ['cover','inspection','performance','findings','appendix']){
  const html=render(s,p);
  assert(!/<(?:iframe|object|embed)\b/i.test(html),'Historical PDF embedding is reference-only');
  assert(!html.includes('reference.pdf'));assert(!html.includes('original-cover.png'));
  assert(!html.includes('HISTORICAL-SIGNATURE-SENTINEL'));assert(!html.includes('HISTORICAL-SIGNER-SENTINEL'));
  assert(!html.includes('assets/fire-pump-reference.png'),'Historical reference photograph must not be silently imported');
 }
});

test('source reference pictures cannot satisfy current-job evidence validation',()=>{
 const p=currentProject();p.serial='CURRENT-SERIAL';p.summary='สรุปผลปัจจุบัน';
 for(const [id]of M.questions)p.answers[id]={value:'Y'};
 p.tests=p.tests.map(t=>({...t,status:'TESTED',flow:t.point*7.5,discharge:120,suction:0}));
 assert(M.validate(p,[{id:'old',source:true}]).some(i=>i.view==='photos'));
 assert.equal(M.validate(p,[{id:'new',source:false}]).length,0);
 assert.equal(M.validate(p,[{id:'old',source:true},{id:'new',source:false}]).length,0);
});

test('blank current measurements remain missing instead of copying historical values',()=>{
 for(const template of ['PM-FP-001','PT-FP-001']){
  const p=currentProject(template),html=render('performance',p);
  assert(p.tests.every(t=>t.flow===null&&t.discharge===null&&t.suction===null&&t.status==='PENDING'));
  assert(html.includes('<td>—</td>'));
  for(const old of ['116','86','150','135','115'])assert(!html.includes(`<td>${old}</td>`),'Historical pressure leaked: '+old);
  assert(html.includes('รอผู้มีอำนาจตรวจทาน'));
 }
});

test('NOT_TESTED 150% preserves missing measurements and escaped reason',()=>{
 const p=currentProject();p.tests[2]={point:150,status:'NOT_TESTED',flow:null,discharge:null,suction:null,reason:'<script>unsafe</script>'};
 const html=render('performance',p);
 assert(html.includes('ไม่สามารถทดสอบได้'));assert(html.includes('ไม่สามารถทดสอบที่ 150%'));
 assert(html.includes('&lt;script&gt;unsafe&lt;/script&gt;'));assert(!html.includes('<script>unsafe'));
});

test('dynamic customer, findings, and inspection text are escaped',()=>{
 const p=currentProject();p.customer='<img src=x onerror=alert(1)>';p.summary='<script>summary</script>';p.notes='<script>notes</script>';
 p.answers[M.questions[0][0]]={value:'N',remark:'<script>remark</script>'};
 for(const s of ['cover','inspection','findings']){
  const html=render(s,p);assert(!html.includes('<script>'));assert(!html.includes('<img src=x'));assert(html.includes('&lt;'));
 }
});
