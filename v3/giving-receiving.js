"use strict";
/* The giving / receiving N4 special course: read-only, standalone and mobile friendly. */
(function(){
 const D=window.ENJP_GIVING_DATA,C=window.ENJP_COURSES,Audio=window.ENJP_Audio;
 if(!D||!C?.jp?.N4||!Audio)return;
 const ROOT_ID="jp-n4-giving";
 const items=D.headings.map(([id,title])=>({id:ROOT_ID+"-"+id,title}));
 C.jp.N4.push({id:ROOT_ID,title:"07｜授受表現：あげる・くれる・もらう",
  summary:"完整方向圖、30 個中文例句、て形應用與 12 題混淆練習",sections:items});
 const e=(tag,cls,text)=>{
   const n=document.createElement(tag);if(cls)n.className=cls;
   if(text!==undefined)n.textContent=String(text);return n;
 };
 const append=(parent,...children)=>{parent.append(...children);return parent};
 function change(id){
   if(window.ENJP_3?.goToSection)window.ENJP_3.goToSection(ROOT_ID+"-"+id);
 }
 function line(japanese){
   const p=e("p","gr-japanese");p.append(Audio.makeRuby(japanese));return p;
 }
 function soundControls(parent,japanese){
   const area=e("div","gr-sound-area"),button=e("button","gr-sound","🔊 播放日文");
   const status=e("span","gr-sound-status","");
   status.setAttribute("role","status");button.type="button";
   if(!Audio.spokenJapanese(japanese)){
     button.disabled=true;button.title="例句缺少完整振假名，暫時不播放";
   }else button.addEventListener("click",()=>Audio.play(japanese,"jp",button,status));
   area.append(button,status);parent.append(area);
 }
 function sampleCard(item,index){
   const card=e("article","gr-sample");
   card.append(e("span","gr-number",String(index+1).padStart(2,"0")));
   card.append(line(item[0]),e("p","gr-meaning",item[1]),e("p","gr-point","✦ "+item[2]));
   soundControls(card,item[0]);
   return card;
 }
 function sampleGrid(root,title,items){
   root.append(e("h3","gr-h3",title));
   const grid=e("div","gr-grid");
   items.forEach((v,i)=>grid.append(sampleCard(v,i)));
   root.append(grid);
 }
 function intro(root,title,description){
   root.append(append(e("div","gr-intro"),
     e("h3","",title),e("p","",description)));
 }
 function rules(root,kind){
   const obj={
     ageru:["あげる｜我／我方 → 別人",
       "【給的人】は／が【收到的人】に【物品】を あげる",
       "送東西的人是主語，物品往外送。",
       "不只我送別人，第三者給第三者也常用。一般不會用あげる描述別人給我。"],
     kureru:["くれる｜別人 → 我／我方",
       "【給的人】は／が【我／我方】に【物品】を くれる",
       "給東西的人是主語，物品來到我或我方。",
       "收的人通常是我、家人等我方成員；私に有時可省略。敬語常用くださる。"],
     morau:["もらう｜我／我方 ← 別人",
       "【收到的人】は／が【給的人】に／から【物品】を もらう",
       "收到東西的人是主語；同一件事可以和くれる互換敘述角度。",
       "人可用に或から標記來源；組織通常使用から。もらい是連用形，辭書形是もらう。"]
   }[kind];
   if(!obj)return;
   intro(root,obj[0],obj[2]);
   root.append(append(e("div","gr-rule"),
     e("strong","","基本句型"),e("p","",obj[1]),e("small","",obj[3])));
   sampleGrid(root,kind+"｜6 個生活與工作情境",D.examples[kind]);
   const back=e("button","gr-jump","↗ 回到方向總覽");back.type="button";
   back.addEventListener("click",()=>change("overview"));root.append(back);
 }
 function arrows(root){
   intro(root,"先看箭頭，再決定用哪一個",
     "三種授受動詞主要差別是方向與敘述視角，不是死背「給」或「收到」。");
   const grid=e("div","gr-arrows");
   for(const [form,subject,direction,receiver,note]of [
     ["あげる","我／我方","→","別人","給的人是主語"],
     ["くれる","別人","→","我／我方","給的人是主語"],
     ["もらう","我／我方","←","別人","收的人是主語"]
   ]){
     grid.append(append(e("article","gr-arrow-card"),
       e("strong","",form),e("div","gr-flow",subject+" "+direction+" "+receiver),
       e("p","",note)));
   }
   root.append(grid);
   sampleGrid(root,"同一件事：朋友送我一本書",[
     ["友達（ともだち）が私（わたし）に本（ほん）をくれました。",
       "朋友送給我一本書。","朋友是主語，所以用くれる。"],
     ["私（わたし）は友達（ともだち）に本（ほん）をもらいました。",
       "我從朋友那裡收到一本書。","我是主語，所以用もらう。"]
   ]);
   root.append(append(e("div","gr-rule"),
     e("strong","","30 秒判斷法"),
     e("p","","① 誰是主語？ ② 好處流向誰？ ③ 我是說「對方給我」還是「我收到」？"),
     e("small","","你提到的「もらい」不是辭書形。原形是もらう；もらいます是禮貌形，もらいました是禮貌過去形。")));
 }
 function helpSection(root){
   intro(root,"Vて＋授受：從送東西變成幫別人做事",
     "あげる、くれる、もらう接在動詞て形後，能表示誰幫誰、誰接受幫助。");
   for(const [key,title,desc,note] of [
     ["teageru","〜てあげる｜我幫別人","幫忙由我方向別人流出。","對上司直接說てあげる可能聽起來像施恩；禮貌場合可以改為お手伝いしましょうか。"],
     ["tekureru","〜てくれる｜別人幫我","給予幫助的人是主語，我／我方受惠。","可以用來表達感謝，但不代表對方一定主動提議。"],
     ["temorau","〜てもらう｜我得到協助","收到幫助的人是主語；常用在請託或得到協助。","不一定每次都表示先開口拜託；是受惠者的視角。"]
   ]){
     const box=e("section","gr-unit");
     intro(box,title,desc);box.append(e("p","gr-note",note));
     sampleGrid(box,"4 個日常例句",D.examples[key]);root.append(box);
   }
   root.append(e("p","gr-note",
     "比較：友達が教えてくれた（朋友教我，朋友是主語）／私は友達に教えてもらった（我得到朋友的指導，我是主語）。"));
 }
 function quizSection(root){
   intro(root,"⚡ 12 題混淆挑戰","一題一題分辨給予者、受益者與句子的主語；不修改舊版學習進度。");
   const widget=e("section","gr-quiz");
   let i=0,correct=0,locked=false;
   const count=e("p","gr-count"),question=e("p","gr-question");
   const choices=e("div","gr-choices"),feedback=e("div","gr-feedback");
   const next=e("button","gr-next","下一題");
   next.type="button";feedback.setAttribute("role","status");
   function draw(){
     const q=D.quiz[i];locked=false;
     count.textContent="第 "+(i+1)+" / "+D.quiz.length+" 題 · 目前答對 "+correct+" 題";
     question.replaceChildren(Audio.makeRuby(q[0]));
     choices.replaceChildren();feedback.replaceChildren();
     q[2].forEach(label=>{
       const btn=e("button","gr-choice",label);btn.type="button";
       btn.addEventListener("click",()=>grade(label));choices.append(btn);
     });
     next.disabled=true;next.textContent=i===D.quiz.length-1?"看總成績":"下一題 →";
   }
   function grade(selected){
     if(locked)return;locked=true;
     const q=D.quiz[i],right=selected===q[1];
     if(right)correct++;
     for(const button of choices.children){
       button.disabled=true;
       if(button.textContent===q[1])button.classList.add("correct");
       else if(button.textContent===selected)button.classList.add("wrong");
     }
     feedback.append(e("strong","",right?"✅ 答對！":"❌ 正確答案："+q[1]),e("p","",q[3]));
     count.textContent="第 "+(i+1)+" / "+D.quiz.length+" 題 · 目前答對 "+correct+" 題";
     next.disabled=false;
   }
   next.addEventListener("click",()=>{
     if(!locked)return;
     if(i===D.quiz.length-1){
       widget.replaceChildren();
       widget.append(e("h3","gr-h3","完成！得分 "+correct+" / "+D.quiz.length),
         e("p","gr-note",correct===D.quiz.length?"全對了！方向與主語觀念掌握得很好。":"回到方向總覽複習一次，再挑戰會更容易。"));
       const retry=e("button","gr-next","再挑戰一次");retry.type="button";
       retry.addEventListener("click",()=>{i=0;correct=0;widget.replaceChildren(count,question,choices,feedback,next);draw()});
       widget.append(retry);
     }else{i++;draw()}
   });
   widget.append(count,question,choices,feedback,next);root.append(widget);draw();
 }
 function render(root,sectionId){
   if(!sectionId?.startsWith(ROOT_ID+"-"))return false;
   const key=sectionId.slice(ROOT_ID.length+1);
   if(!D.headings.some(x=>x[0]===key))return false;
   const panel=e("section","gr-lesson");
   panel.append(e("span","gr-label","JLPT N4 · 授受表現"),
     e("h2","gr-title","あげる・くれる・もらう"),
     e("p","gr-subtitle","6 個專題小節｜30 個例句｜12 題練習｜正確假名與中文翻譯"));
   const nav=e("nav","gr-navigation");
   nav.setAttribute("aria-label","本課目錄");
   D.headings.forEach(([id,title])=>{
     const b=e("button","gr-tab"+(id===key?" selected":""),title);
     b.type="button";b.addEventListener("click",()=>change(id));nav.append(b);
   });
   panel.append(nav);
   if(key==="overview")arrows(panel);
   else if(["ageru","kureru","morau"].includes(key))rules(panel,key);
   else if(key==="te")helpSection(panel);
   else if(key==="quiz")quizSection(panel);
   root.append(panel);return true;
 }
 window.ENJP_GivingReceiving={id:ROOT_ID,count:30,render,examples:D.examples,quiz:D.quiz};
})();