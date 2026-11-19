"use strict";
/* ENJP Ocean · 天氣日語圖鑑. New isolated atlas; original 30 chapters and progress untouched. */
(function(){
 const raw=window.ENJP_WEATHER_THEMES||[],A=window.ENJP_Audio,C=window.ENJP_COURSES,V=window.ENJP_CuratedVocab;
 if(!raw.length||!A||!C?.jp?.N3||!V?.chapters?.N3)return;
 const ID="jp-weather-atlas",KEY="enjpWeatherWrongV1",LIMIT=12;
 const TONES={basic:"基礎日常",conversation:"口語表達",forecast:"天氣預報",safety:"防災警示"};
 const normalize=s=>String(s||"").normalize("NFKC").toLowerCase()
   .replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
 const plain=s=>String(s).replace(/（[ぁ-ゖァ-ヺー]+）/g,"");
 const kana=s=>normalize(String(s).replace(/([一-龯々]+)（([ぁ-ゖァ-ヺー]+)）/g,"$2"));
 const words=[],issues=[],known=new Set(),themes=new Map();
 for(const theme of raw){
   if(themes.has(theme.id))issues.push("重複主題 "+theme.id);
   themes.set(theme.id,theme);
   for(const [index,r]of theme.items.entries()){
     const [head,zh,en,level,tone,nuance,ja1,zh1,ja2,zh2]=r;
     const word=plain(head),reading=kana(head),id="wt-"+theme.id+"-"+String(index+1).padStart(2,"0");
     if(known.has(word))issues.push("重複詞頭 "+word);
     known.add(word);
     const examples=[{ja:ja1,zh:zh1},{ja:ja2,zh:zh2}];
     if(!["N5","N4","N3","N2"].includes(level)||!TONES[tone])issues.push("分類錯誤 "+word);
     if(!word||!reading||!zh||!en||!nuance||!A.spokenJapanese(head)||
        examples.some(e=>!e.ja||!e.zh||!A.spokenJapanese(e.ja)))issues.push("單字或例句標音待校對 "+word);
     words.push({id,word,head,reading,zh,en,level,tone,nuance,examples,themeId:theme.id,themeName:theme.title});
   }
 }
 const byId=new Map(words.map(w=>[w.id,w]));
 C.jp.N3.unshift({id:"weather-course",title:"🌦️ 天氣日語圖鑑｜晴雨・氣溫・天氣預報",
   summary:words.length+" 詞・"+(words.length*2)+" 句｜N5～N2 延伸｜中文・英文・用語分類・語音・練習",
   sections:[{id:ID,title:"🌦️ 天氣、季節、氣象預報與颱風"}]});
 V.chapters.N3.unshift({id:"weather-vocab-index",title:"🌦️ 天氣日語圖鑑｜氣溫・氣象",
   summary:raw.length+" 大分類・"+words.length+" 個單字・兩句專屬例句・天氣預報與抽考",
   sections:[{id:ID,title:"🌦️ 晴雨・擬聲語・颱風與防災日文"}]});
 let writable=true,wrong=new Set(),message="";
 try{
   const s=window.localStorage?.getItem(KEY);
   if(s!==null&&s!==undefined){
     const values=JSON.parse(s);
     if(!Array.isArray(values)||values.some(x=>typeof x!=="string"))throw Error("Invalid history");
     wrong=new Set(values.filter(id=>byId.has(id)));
   }
 }catch{writable=false;message="之前的錯題紀錄無法讀取，為避免覆寫已暫停此專區的紀錄功能。";}
 const save=()=>{
   if(!writable)return;
   try{window.localStorage?.setItem(KEY,JSON.stringify([...wrong]));}
   catch{writable=false;message="目前無法儲存錯題；仍可正常瀏覽與練習。";}
 };
 const el=(tag,cls,txt)=>{
   const n=document.createElement(tag);if(cls)n.className=cls;
   if(txt!==undefined)n.textContent=String(txt);
   return n;
 };
 const button=(label,cls="wt-btn")=>{const n=el("button",cls,label);n.type="button";return n};
 const jap=(root,text,cls="wt-jp")=>{const p=el("p",cls);p.append(A.makeRuby(text));root.append(p);return p};
 const speak=(root,text,label="🔊 日文朗讀")=>{
   const wrap=el("div","wt-audio"),b=button(label,"wt-speak"),status=el("span","wt-status","");
   status.setAttribute("role","status");
   if(!A.spokenJapanese(text)){b.disabled=true;b.title="標音未完成，暫不播放"}
   else b.addEventListener("click",()=>A.play(text,"jp",b,status));
   wrap.append(b,status);root.append(wrap);
 };
 const matching=(query="",category="all",level="all",tone="all")=>{
   const q=normalize(query).trim(),exact=q?words.filter(w=>normalize(w.word)===q||normalize(w.reading)===q):[];
   return words.filter(w=>(category==="all"||w.themeId===category)&&
     (level==="all"||w.level===level)&&(tone==="all"||w.tone===tone)&&
     (!q||(exact.length?exact.includes(w):
       [w.word,w.reading,w.zh,w.en,w.nuance,w.themeName].some(x=>normalize(x).includes(q)))));
 };
 const random=arr=>{
   const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
   return a;
 };
 function render(host,id){
   if(id!==ID)return false;
   const root=el("section","wt-atlas");
   root.append(el("span","wt-eyebrow","ENJP OCEAN · WEATHER & SEASONS"),
     el("h2","wt-title","🌦️ 天氣日語圖鑑｜晴雨・氣溫・天氣預報"),
     el("p","wt-intro","晴天、雨勢、風雷、氣溫、暴雪、颱風與天氣預報，一次學習 "+words.length+" 詞、"+words.length*2+" 句專屬日文例句。每張卡附中文、英文、漢字讀音和使用用語。"));
   const stats=el("div","wt-stats");
   for(const [value,label]of [[words.length,"單字"],[words.length*2,"中日例句"],[raw.length,"分類"],[Object.keys(TONES).length,"用語"]]){
     const cell=el("div","wt-stat");cell.append(el("strong","",value),el("small","",label));stats.append(cell);
   }
   root.append(stats,el("p","wt-note","建議難度是本教材教學分級，不是官方 JLPT 詞表。預報詞彙參考日本氣象廳，例句為本站原創教學句。"));
   const guidance=el("section","wt-guidance");
   guidance.append(el("h3","wt-subtitle","📢 看懂日本天氣預報：三個關鍵差別"));
   for(const [label,ja,zh]of [
     ["のち｜前後天氣轉變","晴（は）れのち曇（くも）り","先晴後陰，不是整天交替"],
     ["一時｜短時間連續發生","曇（くも）り一時（いちじ）雨（あめ）","短暫的一段時間下雨（氣象廳：占預報期間不到四分之一）"],
     ["時々｜斷斷續續發生","曇（くも）り時々（ときどき）雨（あめ）","間歇下雨（氣象廳：合計占預報期間不到一半）"]
   ]){
     const block=el("div","wt-explain");
     block.append(el("strong","",label));
     jap(block,ja);block.append(el("p","wt-zh",zh));
     speak(block,ja,"🔊 聽預報");
     guidance.append(block);
   }
   guidance.append(el("h3","wt-subtitle","🌡️ 日本氣象廳的高溫門檻"));
   const table=el("p","wt-note","夏日 ≥25°C｜真夏日 ≥30°C｜猛暑日 ≥35°C｜酷暑日 ≥40°C（2026 新名稱）；冬日最低溫 <0°C、真冬日最高溫 <0°C。");
   guidance.append(table);
   const references=el("p","wt-references","參考：");
   for(const [label,url]of [
     ["日本氣象廳・預報時間用語","https://www.jma.go.jp/jma/kishou/know/yougo_hp/toki.html"],
     ["日本氣象廳・氣溫術語","https://www.jma.go.jp/jma/kishou/know/faq/faq3.html"],
     ["酷暑日（2026 官方公告）","https://www.jma.go.jp/jma/press/2604/17a/40degree_name.html"]
   ]){
     const a=el("a","",label);a.href=url;a.target="_blank";a.rel="noopener noreferrer";
     references.append(a,document.createTextNode(" · "));
   }
   guidance.append(references);
   root.append(guidance);
   const filters=el("div","wt-filters"),searchField=el("label","wt-field wt-search-field");
   const search=el("input");search.type="search";search.placeholder="搜尋 晴れ、土砂降り、酷暑日、颱風、rain…";search.setAttribute("aria-label","搜尋天氣日文單字");
   searchField.append(el("span","","搜尋日／中文／英文"),search);filters.append(searchField);
   const opts={query:"",category:"all",level:"all",tone:"all"};
   function select(label,key,choices){
     const field=el("label","wt-field"),s=el("select");s.setAttribute("aria-label",label);
     for(const [val,text]of choices){const option=el("option","",text);option.value=val;s.append(option)}
     field.append(el("span","",label),s);filters.append(field);
     s.addEventListener("change",()=>{opts[key]=s.value;page=0;draw()});
   }
   select("主題分類","category",[["all","全部分類"],...raw.map(x=>[x.id,x.title])]);
   select("建議程度","level",[["all","全部程度"],["N5","N5"],["N4","N4"],["N3","N3"],["N2","N2 延伸"]]);
   select("使用用語","tone",[["all","所有用語"],...Object.entries(TONES)]);
   root.append(filters);
   const controls=el("div","wt-actions"),practice=button("🎯 從目前篩選單字抽考"),
     review=button("🔁 只練錯題","wt-btn wt-btn-secondary");
   controls.append(practice,review);root.append(controls);
   const count=el("p","wt-count");count.setAttribute("role","status");
   const grid=el("div","wt-grid"),pager=el("div","wt-pager"),detail=el("section","wt-detail");
   detail.hidden=true;root.append(count,pager,grid,detail);
   let page=0,quizActive=false;
   function showDetail(w){
     detail.hidden=false;detail.replaceChildren();
     const close=button("← 收起例句","wt-btn wt-btn-secondary");
     close.addEventListener("click",()=>{A.stop();detail.hidden=true;detail.replaceChildren()});
     detail.append(close,el("span","wt-eyebrow",w.level+"（教學分級） · "+w.themeName));
     jap(detail,w.head,"wt-detail-word");
     detail.append(el("p","wt-detail-reading",w.reading),
       el("p","wt-detail-meaning",w.zh+" · "+w.en));
     speak(detail,w.reading,"🔊 單字發音");
     const note=el("div","wt-nuance");
     note.append(el("strong","",TONES[w.tone]+" · 用語與記憶要點"),el("p","",w.nuance));
     detail.append(note,el("h3","wt-subtitle","📖 兩句專屬例句"));
     for(const [i,ex] of w.examples.entries()){
       const card=el("article","wt-example");
       card.append(el("small","","例句 "+(i+1)));
       jap(card,ex.ja);card.append(el("p","wt-zh",ex.zh));
       speak(card,ex.ja,"🔊 播放例句");
       detail.append(card);
     }
     if(typeof detail.scrollIntoView==="function")detail.scrollIntoView({behavior:"smooth",block:"start"});
   }
   function showQuiz(pool,onlyWrong=false){
     const selection=random(pool).slice(0,10);
     if(selection.length<4){
       count.textContent=onlyWrong?"目前錯題少於 4 詞，累積更多錯題後再練；可先練整組單字。":"至少需要 4 個單字才能抽考，請放寬篩選。";
       return;
     }
     quizActive=true;grid.replaceChildren();pager.replaceChildren();detail.hidden=true;detail.replaceChildren();
     let index=0,correct=0;
     const shell=el("section","wt-quiz"),title=el("h3","wt-subtitle",onlyWrong?"🔁 錯題衝刺":"🎯 情境單字抽考"),
       status=el("p","wt-count"),body=el("div","wt-quiz-body"),
       back=button("← 返回單字圖鑑","wt-btn wt-btn-secondary");
     back.addEventListener("click",()=>{A.stop();quizActive=false;draw()});
     shell.append(back,title,status,body);grid.append(shell);
     function question(){
       body.replaceChildren();
       if(index>=selection.length){
         status.textContent="完成！答對 "+correct+" / "+selection.length+" 題。";
         body.append(el("p","wt-zh","錯題保存在此圖鑑，不影響 ENJP Ocean 其他單字或原版學習進度。"),button("再練一輪","wt-btn"));
         body.lastChild.addEventListener("click",()=>showQuiz(pool,onlyWrong));
         return;
       }
       const w=selection[index];status.textContent="第 "+(index+1)+"／"+selection.length+" 題 · 目前答對 "+correct+" 題";
       body.append(el("p","wt-question","「"+w.zh+"」日文怎麼說？"));
       const others=random(words.filter(x=>x.id!==w.id&&x.zh!==w.zh)).slice(0,3);
       const choices=el("div","wt-options"),feedback=el("div","wt-feedback"),
         next=button(index===selection.length-1?"查看成績":"下一題 →");
       next.disabled=true;
       let answered=false;
       for(const candidate of random([w,...others])){
         const b=button("","wt-option");jap(b,candidate.head,"wt-option-text");
         b.addEventListener("click",()=>{
           if(answered)return;answered=true;
           const yes=candidate.id===w.id;
           if(yes){correct++;wrong.delete(w.id)}else wrong.add(w.id);
           save();
           for(const child of choices.children){
             child.disabled=true;
             if(child.dataset.id===w.id)child.classList.add("correct");
             else if(child.dataset.id===candidate.id)child.classList.add("incorrect");
           }
           feedback.append(el("strong","",yes?"✅ 答對！":"❌ 正確答案："+w.word),
             el("p","",w.nuance));
           jap(feedback,w.examples[0].ja);feedback.append(el("p","wt-zh",w.examples[0].zh));
           speak(feedback,w.examples[0].ja,"🔊 例句朗讀");
           next.disabled=false;status.textContent="第 "+(index+1)+"／"+selection.length+" 題 · 目前答對 "+correct+" 題";
         });
         b.dataset.id=candidate.id;choices.append(b);
       }
       next.addEventListener("click",()=>{if(!answered)return;index++;question()});
       body.append(choices,feedback,next);
     }
     question();
   }
   function draw(){
     if(quizActive)return;
     const rows=matching(opts.query,opts.category,opts.level,opts.tone);
     const pages=Math.max(1,Math.ceil(rows.length/LIMIT));page=Math.min(page,pages-1);
     count.textContent="目前顯示 "+rows.length+" / "+words.length+" 個單字";
     grid.replaceChildren();pager.replaceChildren();detail.hidden=true;detail.replaceChildren();
     for(const w of rows.slice(page*LIMIT,(page+1)*LIMIT)){
       const card=el("article","wt-card");
       card.append(el("span","wt-grade",w.level+" · "+TONES[w.tone]));
       jap(card,w.head,"wt-word");card.append(el("p","wt-meaning",w.zh),el("p","wt-english",w.en));
       const open=button("查看解釋與兩句例句","wt-open");
       open.addEventListener("click",()=>showDetail(w));
       card.append(open);grid.append(card);
     }
     if(!rows.length)grid.append(el("p","wt-note","找不到符合條件的詞，請試試較短的關鍵字或清除篩選。"));
     const prev=button("← 上一頁","wt-btn wt-btn-secondary"),next=button("下一頁 →","wt-btn wt-btn-secondary");
     prev.disabled=page===0;next.disabled=page>=pages-1;
     prev.addEventListener("click",()=>{if(page>0){page--;draw()}});
     next.addEventListener("click",()=>{if(page<pages-1){page++;draw()}});
     pager.append(prev,el("span","","第 "+(page+1)+"／"+pages+" 頁"),next);
   }
   search.addEventListener("input",()=>{opts.query=search.value;page=0;quizActive=false;draw()});
   practice.addEventListener("click",()=>showQuiz(matching(opts.query,opts.category,opts.level,opts.tone)));
   review.addEventListener("click",()=>showQuiz(words.filter(w=>wrong.has(w.id)),true));
   draw();host.append(root);return true;
 }
 window.ENJP_WeatherAtlas={id:ID,has:id=>id===ID,render,words,themes:raw,tones:TONES,matching,issues,
   progressKey:KEY,wrongWords:()=>words.filter(w=>wrong.has(w.id))};
})();
