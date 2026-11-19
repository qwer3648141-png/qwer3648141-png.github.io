"use strict";
/* ENJP Ocean 5.5 · independent voice grammar lab; public learning, no personal progress. */
(function(){
 const D=window.ENJP_VOICE_GRAMMAR,C=window.ENJP_COURSES,A=window.ENJP_Audio,F=window.ENJP_Inflections;
 if(!D||!C?.jp?.N3||!A||!F)return;
 const ids=["jp-voice-overview","jp-voice-passive","jp-voice-causative","jp-voice-causative-passive"];
 C.jp.N3.unshift({id:"voice-grammar-course",title:"⚙️ 受身・使役・使役受身｜三大動詞語態",
   summary:"三種視角、三類動詞活用、助詞接續、常用短形、31 例句與 18 道題",
   sections:[{id:ids[0],title:"⚙️ 使役／被動／被動使役總覽"},
     ...D.lessons.map((x,i)=>({id:ids[i+1],title:x.name}))]});
 const changes={"う":"わ","く":"か","ぐ":"が","す":"さ","つ":"た","ぬ":"な","ぶ":"ば","む":"ま","る":"ら"};
 const kinds={godan:"第一類・五段動詞",ichidan:"第二類・一段動詞",suru:"第三類・する",kuru:"第三類・来る"};
 const norm=s=>String(s||"").normalize("NFKC").trim();
 const tagged=(tag,cls,s)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(s!==undefined)n.textContent=String(s);return n};
 const button=(s,cls="vg-button")=>{const b=tagged("button",cls,s);b.type="button";return b};
 const japanese=(host,phrase,cls="vg-japanese")=>{
   const p=tagged("p",cls);p.append(A.makeRuby(phrase));host.append(p);return p;
 };
 const play=(host,phrase,label="🔊 朗讀")=>{
   const row=tagged("div","vg-audio"),b=button(label,"vg-play"),status=tagged("span","vg-audio-status","");
   status.setAttribute("role","status");
   if(!A.spokenJapanese(phrase)){b.disabled=true;b.title="尚待完成讀音標記"}
   else b.addEventListener("click",()=>A.play(phrase,"jp",b,status));
   row.append(b,status);host.append(row);return b;
 };
 const makeForm=(surface,reading,type)=>{
   if(!surface||!reading||!type)return null;
   let stem,stemReading,base;
   if(type==="suru"){
     if(!surface.endsWith("する")||!reading.endsWith("する"))return null;
     stem=surface.slice(0,-2);stemReading=reading.slice(0,-2);
     base=["される","させる","させられる"];
   }else if(type==="kuru"){
     if(surface!=="来る"&&surface!=="くる")return null;
     const kanji=surface==="来る";
     return {
       original:{surface,reading},type,short:null,
       passive:{surface:kanji?"来られる":"こられる",reading:"こられる"},
       causative:{surface:kanji?"来させる":"こさせる",reading:"こさせる"},
       causativePassive:{surface:kanji?"来させられる":"こさせられる",reading:"こさせられる"}
     };
   }else if(type==="ichidan"){
     if(!surface.endsWith("る")||!reading.endsWith("る"))return null;
     stem=surface.slice(0,-1);stemReading=reading.slice(0,-1);
     base=["られる","させる","させられる"];
   }else if(type==="godan"){
     const a=changes[surface.slice(-1)],r=changes[reading.slice(-1)];
     if(!a||!r)return null;
     stem=surface.slice(0,-1)+a;stemReading=reading.slice(0,-1)+r;
     base=["れる","せる","せられる"];
   }else return null;
   const form=(suffix)=>({surface:stem+suffix,reading:stemReading+suffix});
   const short=(type==="godan"&&surface.slice(-1)!=="す")?form("される"):null;
   return {original:{surface,reading},type,
     passive:form(base[0]),causative:form(base[1]),causativePassive:form(base[2]),short};
 };
 const forms=D.verbs.map(([surface,reading,type])=>makeForm(surface,reading,type));
 const rootTitle=(wrap,mini,title,intro)=>{
   wrap.append(tagged("span","vg-kicker",mini),tagged("h2","vg-title",title),
     tagged("p","vg-intro",intro));
 };
 const stats={lessons:D.lessons.length,
   patterns:D.lessons.reduce((a,l)=>a+l.patterns.length,0),
   examples:D.lessons.reduce((a,l)=>a+l.patterns.reduce((s,p)=>s+p.examples.length,0),0),
   quizzes:D.quizzes.length};
 function drawTable(host,selection){
   const panel=tagged("section","vg-convert"),title=tagged("h3","vg-subtitle","🔄 三類動詞變化比較表");
   panel.append(title,tagged("p","vg-tip","切換動詞查看完整形與常見縮約形。詞頭的假名只標示在漢字上方，朗讀沿用既有日文聲線。"));
   const selector=tagged("label","vg-selector","選擇動詞類型與原形");
   const select=tagged("select");
   for(const [i,verb]of D.verbs.entries()){
     const option=tagged("option","",verb[0]+" · "+kinds[verb[2]]);option.value=String(i);select.append(option);
   }
   selector.append(select);panel.append(selector);
   const result=tagged("div","vg-convert-output");panel.append(result);
   const render=()=>{
     const row=forms[Number(select.value)||0];if(!row)return;
     result.replaceChildren(tagged("p","vg-tip",kinds[row.type]));
     for(const [label,key,meaning]of [
       ["辭書形","original","原本的動作"],
       ["受身形","passive","被做／受到影響"],
       ["使役形","causative","使某人做／讓某人做"],
       ["使役受身形","causativePassive","被迫或被要求做"],
       ["常見縮約形","short","第一類（非す結尾）常見口語短形"]
     ]){
       if(!row[key]){if(key==="short")result.append(tagged("p","vg-tip","此動詞不使用一般短形；完整形才是安全選擇。"));continue}
       const item=tagged("div","vg-form-row");
       item.append(tagged("span","vg-form-label",label+"｜"+meaning));
       const reading=F.annotation(row[key].surface,row[key].reading);
       japanese(item,reading,"vg-form-word");play(item,row[key].reading,"🔊");
       result.append(item);
     }
   };
   select.addEventListener("change",render);render();host.append(panel);
 }
 function introCards(host){
   const comparison=tagged("div","vg-comparison");
   for(const [title,description,ja,zh]of [
     ["① 使役｜我讓別人做","A 安排 B 去執行","先生（せんせい）は私（わたし）に作文（さくぶん）を書（か）かせました。","老師叫我寫作文。"],
     ["② 受身｜別人對我做","A 受到 B 的行為","私（わたし）は先生（せんせい）に褒（ほ）められました。","我被老師稱讚。"],
     ["③ 使役受身｜我被迫做","A 被 B 要求去執行","私（わたし）は先生（せんせい）に作文（さくぶん）を書（か）かせられました。","我被老師要求寫作文。"]
   ]){
     const card=tagged("article","vg-compare-card");card.append(tagged("h3","vg-subtitle",title),
       tagged("p","vg-tip",description));
     japanese(card,ja);card.append(tagged("p","vg-zh",zh));
     play(card,ja,"🔊 聽句子");comparison.append(card);
   }
   host.append(comparison);
 }
 function runQuiz(host,mode){
   const questions=D.quizzes.filter(q=>mode==="all"||q[0]===mode),box=tagged("section","vg-quiz");
   box.append(tagged("h3","vg-subtitle","🧠 情境理解小測驗"),
     tagged("p","vg-tip","本次作答只在畫面顯示結果，不紀錄分數或建立個人進度。"));
   const start=button("開始 "+questions.length+" 題","vg-button"),status=tagged("p","vg-quiz-status"),
     area=tagged("div","vg-quiz-area");box.append(start,status,area);host.append(box);
   let at=0,score=0,done=false;
   const draw=()=>{
     area.replaceChildren();const q=questions[at];
     if(!q){status.textContent="本次測驗完成："+score+" / "+questions.length+" 題。";start.textContent="重新練習";done=false;return}
     status.textContent="第 "+(at+1)+"／"+questions.length+" 題｜目前答對 "+score+" 題";
     area.append(tagged("p","vg-question",q[1]));
     const options=tagged("div","vg-options"),feedback=tagged("div","vg-feedback"),
       next=button("下一題 →","vg-button");next.disabled=true;
     for(const [i,choice]of q[2].entries()){
       const b=button(choice,"vg-option");
       b.addEventListener("click",()=>{
         if(done)return;done=true;
         if(i===q[3])score++;
         for(const child of options.children)child.disabled=true;
         b.classList.add(i===q[3]?"correct":"incorrect");
         if(i!==q[3])options.children[q[3]].classList.add("correct");
         feedback.append(tagged("strong","",i===q[3]?"✅ 正確！":"❌ 正確答案："+q[2][q[3]]),
           tagged("p","",q[4]));
         next.disabled=false;
       });options.append(b);
     }
     next.addEventListener("click",()=>{if(!done)return;done=false;at++;draw()});
     area.append(options,feedback,next);
   };
   start.addEventListener("click",()=>{at=0;score=0;done=false;start.textContent="重新開始";draw()});
 }
 function lessonBody(host,lesson){
   host.append(tagged("p","vg-lead",lesson.lead));
   const formula=tagged("div","vg-formula");
   formula.append(tagged("h3","vg-subtitle","📐 動詞變化公式"),tagged("p","",lesson.formula));host.append(formula);
   for(const [i,p]of lesson.patterns.entries()){
     const card=tagged("section","vg-pattern");
     card.append(tagged("span","vg-kicker","重點 "+String(i+1).padStart(2,"0")),
       tagged("h3","vg-subtitle",p.title),
       tagged("p","vg-rule",p.rule),
       tagged("p","vg-tip",p.note));
     for(const [ja,zh]of p.examples){
       const ex=tagged("div","vg-example");japanese(ex,ja);
       ex.append(tagged("p","vg-zh",zh));
       play(ex,ja,"🔊 例句");card.append(ex);
     }
     host.append(card);
   }
 }
 function render(host,id){
   if(!ids.includes(id))return false;
   const shell=tagged("section","vg-lab");
   const lesson=id===ids[0]?null:D.lessons[ids.indexOf(id)-1];
   rootTitle(shell,"ENJP OCEAN · VERB VOICE LAB",
     lesson?lesson.name:"⚙️ 受身・使役・使役受身｜動詞語態研究室",
     lesson?"三大動詞語態・例句朗讀・活用比較・自我檢測":"從『誰做』『誰讓誰做』『誰被迫做』理解日文主語與助詞的差別。");
   const nav=tagged("div","vg-nav");
   for(const [i,label]of ["總覽","受身形","使役形","使役受身形"].entries()){
     const b=button(label,"vg-nav-btn");b.setAttribute("aria-current",String(id===ids[i]));
     b.addEventListener("click",()=>{A.stop();window.ENJP_3?.goToSection?.(ids[i])});
     nav.append(b);
   }
   shell.append(nav);
   if(!lesson){
     shell.append(tagged("p","vg-lead","三種形態看起來相似，但主語視角完全不同：使役＝我讓人做；受身＝我被人做；使役受身＝我被迫做。先比對這三句，再進入各節。"));
     introCards(shell);
     shell.append(tagged("p","vg-tip","共 "+stats.examples+" 句專屬雙語例句、"+stats.quizzes+" 道即時測驗；所有章節自由開放。"));
   }else{
     lessonBody(shell,lesson);
     shell.append(tagged("p","vg-tip","本節學完後，可以切換到其他兩個語態，從同一個動詞比較三種主語視角。"));
   }
   drawTable(shell);
   runQuiz(shell,lesson?lesson.id:"all");
   host.append(shell);return true;
 }
 window.ENJP_VoiceGrammar={id:ids[0],ids,lessons:D.lessons,stats,forms,makeForm,has:id=>ids.includes(id),render};
})();
