"use strict";
/* 13 N5-N3 connector lessons: source coverage, four-POS attachment, TTS safety,
 * browser navigation, question grading, assembly and isolated history.
 */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const read=p=>fs.readFileSync(p,"utf8");
const paths=[
 "v3/course-map.js","v3/connection-n5-data.js","v3/connection-n4-data-a.js",
 "v3/connection-n4-data-b.js","v3/connection-n3-data.js",
 "v3/connection-lessons.js","v3/app.js"
];
paths.forEach(p=>new vm.Script(read(p),{filename:p}));
function makeNode(tag){
 return {
   tagName:tag,className:"",textContent:"",children:[],dataset:{},style:{},attrs:{},disabled:false,
   classList:{add(){},remove(){},contains(){return false}},events:{},hidden:false,
   append(...nodes){this.children.push(...nodes);this.firstChild=this.children[0]||null},
   replaceChildren(...nodes){this.children=nodes;this.firstChild=this.children[0]||null},
   setAttribute(k,v){this.attrs[k]=String(v)},
   addEventListener(name,fn){(this.events[name]||(this.events[name]=[])).push(fn)}
 };
}
const flatten=node=>[node,...(node.children||[]).flatMap(flatten)];
const storage={
 data:{},writes:[],
 getItem(k){return this.data[k]||null},
 setItem(k,v){this.writes.push(k);this.data[k]=v}
};
const doc={
 readyState:"loading",createElement:makeNode,
 createTextNode:s=>({textContent:s}),addEventListener(){},
 getElementById:()=>makeNode("div")
};
const mock={
 window:{ENJP_Audio:{
  makeRuby(ja){const x=makeNode("span");x.textContent=ja;return x},
  spokenJapanese(ja){
   const s=String(ja||"").replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2");
   return /[一-龯々]/.test(s)?null:s;
  },
  play(){},stop(){}
 }},
 document:doc,localStorage:storage
};
for(const path of paths.slice(0,6))vm.runInNewContext(read(path),mock);
const data=mock.window.ENJP_CONNECTION_LESSONS,
 engine=mock.window.ENJP_ConnectionLesson,
 course=mock.window.ENJP_COURSES;
assert(engine&&data.length===13,"13 lessons registered");
assert.equal(engine.storageKey,"enjpSentenceConnectorQuizV1");
for(const [level,count]of [["N5",4],["N4",7],["N3",2]]){
 assert.equal(data.filter(x=>x.level===level).length,count,level+" count");
 const chapters=course.jp[level].filter(x=>x.id==="sentence-connectors-"+level.toLowerCase());
 assert.equal(chapters.length,1,level+" chapter appended once");
 assert.equal(chapters[0].sections.length,count,level+" chapter has actual courses");
 assert(chapters[0].sections.every(s=>engine.has(s.id)),level+" ready");
}
const japaneseSafe=s=>!/[一-龯々]/.test(String(s).replace(/([一-龯々]+)（([ぁ-ゖー]+)）/g,"$2"));
const seenIds=new Set(),seenExamples=new Set();
let examples=0,comparisons=0,quizTotal=0,builders=0;
for(const lesson of data){
 assert(!seenIds.has(lesson.id),"unique id "+lesson.id);seenIds.add(lesson.id);
 assert(lesson.goal&&lesson.title&&lesson.meaning,"meaning, title and learning objective");
 assert(engine.has(lesson.id)&&engine.get(lesson.id)===lesson,"loader has the right lesson");
 assert.equal(lesson.rules.length,4,"four parts of speech per lesson");
 for(let i=0;i<4;i++){
   const row=lesson.rules[i];
   assert(row.shape&&row.formula&&row.note!==undefined,"POS formula fields "+lesson.id);
   assert(row.pos===["動詞","い形容詞","な形容詞","名詞"][i]||row.pos==="不適用","POS order "+lesson.id);
   if(row.formula==="不能直接接續")assert(row.note.length>10,"explain inapplicability");
 }
 assert(lesson.changes.length>=3,"separate inflection comparison");
 assert.equal(lesson.examples.length,6,"six distinct examples per lesson");
 for(const x of lesson.examples){
   assert(x.focus&&x.ja&&x.zh,"meaningful original scenario");
   assert(japaneseSafe(x.ja),"every kanji has kana annotation: "+x.ja);
   assert(!seenExamples.has(x.ja),"no repeated example "+x.ja);seenExamples.add(x.ja);
   examples++;
 }
 assert.equal(lesson.comparison.rows.length,2,"two contrasting sentences");
 for(const x of lesson.comparison.rows){
   assert(x.kind&&x.note&&x.zh,"contextual comparison");
   assert(japaneseSafe(x.ja),"ruby-safe contrasting sentence");
   comparisons++;
 }
 assert(lesson.notes.length>=2,"at least two caveats");
 assert.equal(lesson.quiz.length,4,"four exercises");
 for(const q of lesson.quiz){
   assert(q.question&&q.why&&q.why.length>=4,"quiz question and why");
   assert(q.options.length>=3&&q.options.includes(q.answer),"answer among choices");
   assert.equal(new Set(q.options).size,q.options.length,"no duplicate option");
   quizTotal++;
 }
 assert.equal(lesson.builder.parts.length,3,"three-piece sentence assembly");
 assert(lesson.builder.zh,"assembly Chinese translation");
 for(const piece of lesson.builder.parts)assert(japaneseSafe(piece),"ruby in assembly");
 builders++;
}
assert.equal(examples,78);
assert.equal(comparisons,26);
assert.equal(quizTotal,52);
assert.equal(builders,13);
const parent=makeNode("div");
assert(engine.render(parent,"jp-link-n4-shi"),"render N4 list-reason lesson");
assert(!engine.render(makeNode("div"),"does-not-exist"),"do not claim unknown content");
let nodes=flatten(parent);
assert(nodes.filter(x=>x.className==="sc-example").length===6,"all examples instantiated");
assert(nodes.filter(x=>x.className==="sc-rule-pos").length===4,"four POS rows visible");
assert(nodes.filter(x=>x.className==="sc-speak").length>=8,"examples and comparison have audio");
const answerButtons=nodes.filter(x=>x.className==="sc-answer");
assert.equal(answerButtons.length,3,"interactive quiz choices");
const correct=data.find(x=>x.id==="jp-link-n4-shi").quiz[0].answer;
const incorrect=answerButtons.find(x=>x.textContent!==correct);
assert(incorrect&&incorrect.events.click?.length,"can answer quiz");
incorrect.events.click[0]();
const saved=JSON.parse(storage.data[engine.storageKey]);
assert.equal(saved.wrong["jp-link-n4-shi:0"],true,"wrong-answer recorded in isolated store");
assert.deepEqual([...new Set(storage.writes)],[engine.storageKey],"no other saved progress overwritten");
nodes=flatten(parent);
const guide=data.find(x=>x.id==="jp-link-n4-shi").builder.parts;
for(let i=0;i<guide.length;i++){
 const token=flatten(parent).find(x=>x.className==="sc-token"&&x.textContent==="＋ "+guide[i]);
 assert(token,"clickable token "+i);
 token.events.click[0]();
}
const check=flatten(parent).find(x=>x.textContent==="檢查組裝"&&x.className==="sc-primary");
assert(check&&!check.disabled,"complete assembly enables checking");
check.events.click[0]();
assert.equal(JSON.parse(storage.data[engine.storageKey]).assembly["jp-link-n4-shi"],true,"completed builder stored");
const html=read("v3/index.html"),app=read("v3/app.js");
for(const file of ["connection-n5-data.js","connection-n4-data-a.js","connection-n4-data-b.js","connection-n3-data.js","connection-lessons.js","connection-lessons.css"]){
 assert(html.includes(file),"html asset loaded "+file);
}
assert(html.indexOf("connection-n3-data.js")<html.indexOf("connection-lessons.js"),"all data before reader");
assert(html.indexOf("connection-lessons.js")<html.indexOf("app.js"),"module before app");
assert(app.includes("ENJP_ConnectionLesson?.has(section.id)"),"full status in menu");
assert(app.includes("ENJP_ConnectionLesson?.render(root,section.id)"),"actual reader connection");
assert(app.includes("ENJP_ConnectionLesson?.get(lessonId)"),"deep link grade detection");
vm.runInNewContext(read("v3/app.js"),mock);
const nav=mock.window.ENJP_3;
assert(nav&&typeof nav.listChapters==="function","app navigation available");
for(const [level,id] of [["N5","jp-link-n5-adj"],["N4","jp-link-n4-shi"],["N3","jp-link-n3-ueni"]]){
 nav.state.mode="jp";nav.state.level=level;nav.state.sectionId=id;
 assert(nav.lookupSection(id),"right grade has direct course "+id);
 assert(nav.listChapters().some(ch=>ch.sections.some(s=>s.id===id)),"visible in course sidebar");
}
const htmlIdx=html.indexOf("connection-lessons.css");
assert(htmlIdx>0&&read("v3/connection-lessons.css").includes("@media(max-width:640px)"),"responsive UI");
const corrupt=[],alternate={
 window:{ENJP_AUDIO:undefined,ENJP_CONNECTION_LESSONS:data,ENJP_COURSES:{jp:{N5:[],N4:[],N3:[]}},ENJP_Audio:mock.window.ENJP_Audio},
 document:doc,localStorage:{getItem(){return "{broken"},setItem(k){corrupt.push(k)}}
};
vm.runInNewContext(read("v3/connection-lessons.js"),alternate);
const art=makeNode("article");
assert(alternate.window.ENJP_ConnectionLesson.render(art,"jp-link-n5-adj"),"corrupt history still allows reading");
const bad=flatten(art).find(x=>x.className==="sc-answer");
bad.events.click[0]();
assert.deepEqual(corrupt,[],"damaged user data not overwritten");
console.log(JSON.stringify({status:"PASS",lessons:data.length,n5:4,n4:7,n3:2,examples,comparisons,quizTotal,builders,isolatedStorage:true,htmlAndNavigation:true}));
