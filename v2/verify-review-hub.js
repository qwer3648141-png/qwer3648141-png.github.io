"use strict";
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm"),assert=require("node:assert/strict");
const core=require("./review-core.js"),batch=require("./review-batch.js");
const js=fs.readFileSync(path.join(__dirname,"review-hub.js"),"utf8");
new vm.Script(js,{filename:"v2/review-hub.js"});
const data=new Map(),elements=new Map();
let pane,legacyCalls=0,grammarCalls=0;
class Element {
 constructor(){this.value="";this.textContent="";this.innerHTML="";this.hidden=false;this.disabled=false;this.children=[];this.events={};}
 addEventListener(type,cb){this.events[type]=cb}
 click(){if(this.events.click)this.events.click()}
 scrollIntoView(){}
 appendChild(child){this.children.push(child)}
 replaceChildren(){this.children=[]}
 querySelectorAll(){return this.children}
 querySelector(key){if(!elements.has(key))elements.set(key,new Element());return elements.get(key)}
 insertAdjacentElement(where,el){assert.equal(where,"afterend");pane=el;}
}
const shelf=new Element(),oldLex={"verb:書く":{seen:2,due:"2026-11-01"}};
const document={
 readyState:"complete",
 getElementById(id){return id==="v2ModeShelf"?shelf:null},
 createElement(){return new Element()}
};
const storage={
 getItem(k){return data.get(k)||null},
 setItem(k,v){data.set(k,String(v))},
 removeItem(k){data.delete(k)}
};
class FixedDate extends Date {constructor(...args){super(...(args.length?args:["2026-11-03T12:00:00Z"]))}}
const window={ENJP_V2_REVIEW:core,ENJP_V2_BATCH:batch};
const sandbox={window,document,localStorage:storage,Date:FixedDate,
 console,LEX_WORDS:()=>[{kind:"verb",word:"書く",reading:"かく",meaning:"寫",level:"N5"}],
 grammarBank:[{f:"～てもいい",m:"可以",lv:"N5"},{f:"～てはいけない",m:"不可以",lv:"N5"}],
 lexState:{items:oldLex},store:{grammar:{"～てもいい":{seen:3,due:"2026-11-02"}}},
 lexVerbForms:()=>({"て形":"書いて"}),lexAdjForms:()=>({}),
 lexMark:()=>legacyCalls++,markGrammar:()=>grammarCalls++,
 jpRubySurface:()=>"<ruby>書<rt>か</rt></ruby>く",
 speak:()=>true};
vm.runInNewContext(js,sandbox);
assert(window.ENJP_V2_REVIEW_HUB,"Review hub missing from window");
const get=key=>pane.querySelector("[data-review-"+key+"]");
get("kind").value="all";get("count").value="10";
window.ENJP_V2_REVIEW_HUB.open();
assert.equal(pane.hidden,false);
assert(get("summary").textContent.includes("待複習 2 項"));
get("kind").value="verb";get("kind").events.change();
get("start").click();
assert(get("session").hidden===false);
get("answer").value="書いて";get("check").click();get("check").click();
assert.equal(legacyCalls,1,"Same answer cannot score twice");
let progress=JSON.parse(data.get("enjpV2ReviewProgress"));
assert.equal(Object.keys(progress).length,1);
assert.equal(Object.values(progress)[0].stars,1);
get("next").click();
assert(get("session").hidden);
get("kind").value="grammar";get("kind").events.change();get("start").click();
const options=get("options").children;
assert(options.length>=2,"Expected answer choices");
const right=options.find(b=>b.textContent==="可以");assert(right);
right.click();right.click();
assert.equal(grammarCalls,1,"Grammar repeated clicks must not score twice");
progress=JSON.parse(data.get("enjpV2ReviewProgress"));
assert.equal(Object.keys(progress).length,2);
assert.equal(oldLex["verb:書く"].seen,2,"Adapter must not mutate existing progress itself");
console.log("PASS — live review hub: start verb and grammar batches, answer, save detail, double-submit prevention and existing scoring bridge");
