/* ENJP V2 navigation integration regression: exercises real route function in isolation. */
"use strict";
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const js=fs.readFileSync(require("node:path").join(__dirname,"dual-mode.js"),"utf8");
const from=js.indexOf("function navigate(id){"),to=js.indexOf("function init(){",from);
assert(from>=0&&to>from,"Navigation function missing");
const events=[],state={filterKind:"all",topic:"V11",mode:"weak"},grammar={filter:"N3"};
const sandbox={
 lexState:state,grammarFilter:grammar.filter,
 setScreen:id=>events.push(["screen",id]),
 lexSave:()=>events.push(["save"]),
 renderGrammar:()=>events.push(["grammarRender"]),
 startGrammarQuiz:(weak,count,session,level)=>events.push(["quiz",weak,count,session,level]),
 document:{querySelectorAll:()=>[]}
};
const go=vm.runInNewContext(js.slice(from,to)+"\n navigate",sandbox);
function checkRoute(id,kind,mode){
 events.length=0;go(id);
 assert.equal(state.filterKind,kind,id+" kind");
 assert.equal(state.mode,mode,id+" mode");
 assert.equal(state.topic,"all",id+" topic");
 assert.equal(events.filter(v=>v[0]==="screen").length,1,id+" single screen");
 assert.equal(events.find(v=>v[0]==="screen")[1],"lextrain");
 assert.equal(events.filter(v=>v[0]==="save").length,1,id+" saved");
}
checkRoute("verb-learn","verb","verblab");
checkRoute("verb-quick","verb","conjugation");
checkRoute("adj-learn","adj","browse");
checkRoute("adj-quick","adj","conjugation");
for(const lv of ["N5","N4","N3"]){
 events.length=0;go("grammar-"+lv);
 assert.equal(events[0][1],"grammar");
 const q=events.find(x=>x[0]==="quiz");
 assert(q,"No grammar quiz opened");
 assert.equal(q[4],lv);
 assert.equal(q[2],10);
}
events.length=0;go("grammar-learn");
assert.equal(events[0][1],"grammar");
assert(events.some(x=>x[0]==="grammarRender"));
events.length=0;go("daily");
assert.equal(events[0][1],"daily");
console.log("PASS — shared old trainer routes: 4 ENJP learning paths, 3 grammar levels and legacy navigation");
