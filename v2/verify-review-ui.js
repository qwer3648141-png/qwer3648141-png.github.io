"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const core=require("./review-core.js"),batch=require("./review-batch.js");
const js=fs.readFileSync(path.join(__dirname,"review-ui.js"),"utf8");
const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
new vm.Script(js,{filename:"review-ui.js"});
for(const source of ["review-core.js","review-batch.js","review-ui.js"])
 assert(html.includes('src="v2/'+source+'"'),"Missing browser script "+source);
assert(html.includes('href="v2/review-ui.css"'));
assert(html.includes('reviewDetailed:JSON.parse(localStorage.getItem("enjpV2ReviewDetailedV1")'));
assert(html.includes('JSON.stringify(payload.reviewDetailed)'));
const idx=["review-core.js","review-batch.js","review-ui.js"].map(s=>html.indexOf('src="v2/'+s+'"'));
assert(idx[0]<idx[1]&&idx[1]<idx[2],"Invalid script dependency order");
let panel=null,legacyCalls=0,grammarCalls=0;
const els=new Map(),data=new Map();
class Element {
 constructor(){this.value="";this.innerHTML="";this.textContent="";this.hidden=false;this.disabled=false;this.children=[];this.onclick=null;}
 insertAdjacentElement(position,v){assert.equal(position,"afterend");panel=v}
 replaceChildren(){this.children=[];this.textContent=""}
 append(v){this.children.push(v)}
 querySelectorAll(){return this.children}
 scrollIntoView(){}
}
const shelf=new Element();
function get(id){if(!els.has(id))els.set(id,new Element());return els.get(id)}
const document={readyState:"complete",getElementById:id=>id==="v2ModeShelf"?shelf:id==="v2ReviewPanel"?null:get(id),createElement:()=>new Element()};
const storage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};
class FixedDate extends Date {constructor(...args){super(...(args.length?args:["2026-11-03T12:00:00Z"]))}}
const oldLex={"verb:書く":{seen:2,due:"2026-11-01"}};
const window={ENJP_V2_REVIEW:core,ENJP_V2_BATCH:batch};
const ctx={window,document,localStorage:storage,Date:FixedDate,console,
  LEX_WORDS:()=>[{kind:"verb",word:"書く",reading:"かく",meaning:"寫",level:"N5"}],
  grammarBank:[{f:"～てもいい",m:"可以",lv:"N5"},{f:"～てはいけない",m:"不可以",lv:"N5"}],
  lexState:{items:oldLex},store:{grammar:{"～てもいい":{seen:3,due:"2026-11-02"}}},
  lexVerbForms:()=>({"て形":"書いて"}),lexAdjForms:()=>({}),
  lexMark:()=>legacyCalls++,markGrammar:()=>grammarCalls++,
  jpRubySurface:()=>"<ruby>書<rt>か</rt></ruby>く"};
vm.runInNewContext(js,ctx);
assert(window.ENJP_V2_REVIEW_UI,"UI did not register");
window.ENJP_V2_REVIEW_UI.open();
assert.equal(panel.hidden,false);
assert(get("v2ReviewStats").textContent.includes("到期 2 題"));
get("v2ReviewKind").value="verb";get("v2ReviewKind").onchange({target:{value:"verb"}});
get("v2ReviewStartDue").onclick();
assert.equal(get("v2ReviewQuestion").hidden,false);
get("v2ReviewInput").value="書いて";get("v2ReviewCheck").onclick();get("v2ReviewCheck").onclick();
assert.equal(legacyCalls,1,"Repeated click must not score twice");
assert.equal(Object.keys(JSON.parse(data.get("enjpV2ReviewDetailedV1"))).length,1);
get("v2ReviewNext").onclick();
get("v2ReviewKind").value="grammar";get("v2ReviewKind").onchange({target:{value:"grammar"}});get("v2ReviewStartDue").onclick();
const correct=get("v2ReviewOptions").children.find(b=>b.textContent==="可以");
assert(correct,"Grammar answer was not shown");
correct.onclick();correct.onclick();
assert.equal(grammarCalls,1,"Grammar double answer scored twice");
assert.equal(Object.keys(JSON.parse(data.get("enjpV2ReviewDetailedV1"))).length,2);
assert.equal(oldLex["verb:書く"].seen,2,"Adapter directly mutated old records");
console.log("PASS — new batch review UI loads, starts mixed due sessions, prevents double scoring and keeps backup keys");
