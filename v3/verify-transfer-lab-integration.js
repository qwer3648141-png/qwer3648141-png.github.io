"use strict";
const fs=require("node:fs");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const get=p=>fs.readFileSync(p,"utf8");
const giving=get("v3/giving-receiving.js");
const app=get("v3/app.js");
const css=get("v3/giving-receiving.css");
const index=get("v3/index.html");
const standalone=get("transfer-lab/index.html");
const fakeWindow={
  ENJP_COURSES:{jp:{N4:[],N3:[]}},
  ENJP_GIVING_DATA:{headings:[["overview","方向總覽"],["ageru","あげる"],["kureru","くれる"],["morau","もらう"],["te","Vて"],["quiz","測驗"]],examples:{},quiz:[]},
  ENJP_Audio:{}
};
vm.runInNewContext(giving,{window:fakeWindow});
for(const level of ["N4","N3"]){
  const chapters=fakeWindow.ENJP_COURSES.jp[level];
  assert.equal(chapters.filter(c=>c.id==="jp-transfer-lab-"+level.toLowerCase()).length,1,level+" lab chapter");
  assert(chapters.some(c=>c.id==="jp-n4-giving"||level==="N3"),"Original N4 giving course remains");
  assert(chapters.find(c=>c.id==="jp-transfer-lab-"+level.toLowerCase()).sections.some(s=>s.id==="jp-n4-giving-lab"));
}
assert.equal(typeof fakeWindow.ENJP_GivingReceiving.render,"function");
assert.match(giving,/key==="lab"/);
assert.match(giving,/\.\.\/transfer-lab\/index\.html\?embed=1/);
assert.match(app,/jp-n4-giving-lab/);
assert.match(css,/\.gr-lab-frame/);
assert.match(index,/giving-receiving\.js\?v=3\.8\.1/);
assert.match(standalone,/URLSearchParams\(location\.search\)/);
assert.match(standalone,/body\.is-embedded main/);
assert.match(standalone,/transferLabV1_localStudy/);
assert.match(standalone,/transferLabV1_audioPreferences/);
console.log("Transfer Lab integration: N4/N3 navigation, embedded access, old lessons and isolated storage OK");
