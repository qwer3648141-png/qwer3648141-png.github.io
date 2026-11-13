"use strict";
/* ENJP Ocean 4.6 · Advanced Japanese vocabulary atlas.
 * Original word-aligned bilingual sentences; 6 thematic sets, estimated N3–N1.
 * No new writes to previous course/review/voice localStorage.
 */
(function(){
 const themes=window.ENJP_ADVANCED_THEMES,C=window.ENJP_COURSES,
   V=window.ENJP_CuratedVocab,F=window.ENJP_Inflections,A=window.ENJP_Audio;
 if(!Array.isArray(themes)||!C?.jp?.N3||!V?.chapters?.N3||!F||!A)return;
 const ID="jp-advanced-vocab-overview";
 const POS={i:"い形容詞",na:"な形容詞",noun:"名詞",adverb:"副詞・擬態語",phrase:"慣用表現",
   "verb:godan":"動詞・第一類","verb:ichidan":"動詞・第二類","verb:suru":"動詞・第三類",
   "verb:kuru":"動詞・第三類"};
 const TONES={positive:"正面語感",neutral:"中性語感",negative:"偏負面",contextual:"依情境變化"};
 const kanaTabs=[["all","全部"],["あ","あ行"],["か","か行"],["さ","さ行"],["た","た行"],
  ["な","な行"],["は","は行"],["ま","ま行"],["や","や行"],["ら","ら行"],["わ","わ行"]];
 const norm=s=>String(s||"").normalize("NFKC").toLowerCase().replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-96));
 const firstGroup=reading=>{
   const s=norm(reading).charAt(0);
   if("あいうえお".includes(s))return "あ";
   if("かきくけこがぎぐげご".includes(s))return "か";
   if("さしすせそざじずぜぞ".includes(s))return "さ";
   if("たちつてとだぢづでど".includes(s))return "た";
   if("なにぬねの".includes(s))return "な";
   if("はひふへほばびぶべぼぱぴぷぺぽ".includes(s))return "は";
   if("まみむめも".includes(s))return "ま";
   if("やゆよ".includes(s))return "や";
   if("らりるれろ".includes(s))return "ら";
   return "わ";
 };
 const words=[],byWord=new Map(),issues=[],topics=new Map();
 const okay=s=>Boolean(A.spokenJapanese(s));
 for(const theme of themes){
   if(topics.has(theme.id))issues.push("重複主題 "+theme.id);
   topics.set(theme.id,theme);
   for(const item of theme.items){
     const word={...item,themeId:theme.id,themeName:theme.title};
     if(byWord.has(word.word))issues.push("重複詞頭 "+word.word);
     if(!POS[word.kind]||!["N3","N2","N1"].includes(word.level)||
       !["positive","neutral","negative","contextual"].includes(word.tone))issues.push("類別欄位錯誤 "+word.word);
     if(!okay(F.annotation(word.word,word.reading)))issues.push("詞頭讀音未完成 "+word.word);
     if(word.examples.length!==2||word.examples.some(e=>!e.zh||!okay(e.ja)))
       issues.push("例句讀音或中文未完成 "+word.word);
     byWord.set(word.word,word);
     words.push(word);
   }
 }
 const sort=(a,b)=>a.reading.localeCompare(b.reading,"ja")||a.word.localeCompare(b.word,"ja");
 words.sort(sort);
 C.jp.N3.unshift({id:"advanced-vocab-course",title:"🌙 進階日語詞彙｜性格・情緒・思考",
   summary:"N3～N1 建議難度｜6 主題｜語感差別、詞性接續、兩句原創例句與語音",
   sections:[{id:ID,title:"🌙 進階詞彙一覽（"+words.length+" 詞）"}]});
 V.chapters.N3.push({id:"advanced-vocab-index",title:"🌙 進階語彙｜N3～N1",
   summary:"獨立進階語感與例句學習區，保留既有分級詞卡",
   sections:[{id:ID,title:"🌙 進階語彙總表（"+words.length+" 詞）"}]});
 const el=(tag,cls,value)=>{
   const n=document.createElement(tag);if(cls)n.className=cls;
   if(value!==undefined)n.textContent=String(value);
   return n;
 };
 const add=(parent,...children)=>{parent.append(...children);return parent};
 const button=(label,cls="av-action")=>{const n=el("button",cls,label);n.type="button";return n};
 const jp=(host,value,cls="av-japanese")=>{
   const n=el("p",cls);n.append(A.makeRuby(value));host.append(n);return n;
 };
 const speak=(host,value,label="🔊 朗讀")=>{
   const wrap=el("div","av-speech"),b=button(label,"av-speak"),
     status=el("span","av-spoken","");
   status.setAttribute("role","status");
   if(!okay(value)){b.disabled=true;b.title="這段的假名標註仍待校對"}
   else b.addEventListener("click",()=>A.play(value,"jp",b,status));
   wrap.append(b,status);host.append(wrap);return b;
 };
 const formRows=x=>{
   const item={word:x.word,reading:x.reading,type:x.kind.startsWith("verb:")?x.kind.slice(5):x.kind};
   if(x.kind==="i"||x.kind==="na")return F.adjectiveForms(item)||[];
   if(x.kind.startsWith("verb:"))return F.verbForms(item)||[];
   return [];
 };
 const grammar=x=>x.kind==="i"?
   "い形容詞：辭書形＋し／けど；去掉最後的「い」＋くて。例：怒りっぽい→怒りっぽくて":
   x.kind==="na"?
   "な形容詞：詞幹＋で；普通形＋し為「だし」；接「のに」通常用「なのに」。":
   x.kind.startsWith("verb:")?
   "動詞：依第一／二／三類轉換て形、た形、ない形；不同文法要求的接續型態不同。":
   x.kind==="adverb"?"常見用法：後接「する」描述狀態，例如いらいらする、くよくよする。":
   x.kind==="phrase"?"慣用表現：請整組記憶，變化依表現中的動詞或形容詞進行。":
   "名詞：依句型接「だ／で／だし」等；部分詞也可與「する」搭配，需按實際用法判斷。";
 function detail(root,word,openRelated){
   root.replaceChildren();
   root.append(el("span","av-kicker",word.level+"（教學分級） · "+POS[word.kind]));
   jp(root,F.annotation(word.word,word.reading),"av-detail-word");
   root.append(el("p","av-reading",word.reading),el("p","av-meaning",word.zh));
   speak(root,word.reading,"🔊 單字朗讀");
   const nuance=el("section","av-nuance");
   nuance.append(el("strong","","💬 "+TONES[word.tone]+"｜語感與使用提醒"),el("p","",word.nuance));
   root.append(nuance);
   const examples=el("section","av-examples");
   examples.append(el("h3","","📚 "+word.word+" 的兩個專屬例句"));
   for(const [i,ex]of word.examples.entries()){
     const card=el("article","av-example");
     card.append(el("span","av-example-number","例句 "+(i+1)));
     jp(card,ex.ja);
     card.append(el("p","av-chinese",ex.zh));
     speak(card,ex.ja,"🔊 朗讀這句");
     examples.append(card);
   }
   root.append(examples);
   const gram=el("section","av-grammar");
   gram.append(el("h3","","🔗 詞性＋型態＋接續"),el("p","av-note",grammar(word)));
   const forms=formRows(word);
   if(forms.length){
     const details=el("details","av-forms");
     details.append(el("summary","","展開 "+forms.length+" 種實際活用（含朗讀）"));
     const box=el("div","av-form-grid");
     for(const form of forms){
       const item=el("div","av-form");
       item.append(el("span","av-form-label",form.key));
       jp(item,F.annotation(form.word,form.reading),"av-form-word");
       if(form.hint)item.append(el("small","av-note",form.hint));
       speak(item,form.reading,"🔊");
       box.append(item);
     }
     details.append(box);gram.append(details);
   }
   root.append(gram);
   if(word.related?.length){
     const related=el("section","av-related");
     related.append(el("h3","","🔍 相似詞與容易混淆的詞"));
     const tags=el("div","av-related-row");
     for(const name of word.related){
       const match=byWord.get(name);
       if(match&&match.word!==word.word){
         const b=button(name+" · 查看差別","av-related-button");
         b.addEventListener("click",()=>openRelated(match));
         tags.append(b);
       }else tags.append(el("span","av-related-label",name+"（其他教材延伸）"));
     }
     related.append(tags);root.append(related);
   }
 }
 const filterRows=(opts={})=>{
   const {level="all",theme="all",kind="all",tone="all",kana="all",query=""}=opts,
     q=norm(query.trim());
   // Exact Japanese headword / kana reading takes priority over
   // fuzzy meanings and related-word matches, so direct lookup shows only itself.
   const exact=q?words.filter(w=>norm(w.word)===q||norm(w.reading)===q):[];
   return words.filter(w=>
     (level==="all"||w.level===level)&&
     (theme==="all"||w.themeId===theme)&&
     (kind==="all"||w.kind===kind||(kind==="verb"&&w.kind.startsWith("verb:")))&&
     (tone==="all"||w.tone===tone)&&
     (kana==="all"||firstGroup(w.reading)===kana)&&
     (!q||(exact.length?exact.includes(w):
        [w.word,w.reading,w.zh,w.nuance,w.themeName,...w.related]
          .some(text=>norm(text).includes(q))))
   );
 };
 function render(host,id){
   if(id!==ID)return false;
   const shell=el("section","av-atlas");
   shell.append(el("span","av-kicker","ENJP OCEAN · ADVANCED VOCABULARY"),
     el("h2","av-title","🌙 進階詞彙圖鑑"),
     el("p","av-intro","這一批新增 "+words.length+" 個 N3～N1 建議程度詞彙，依性格、溝通、情緒、判斷、處事與社會語感分類。所有例句獨立撰寫，原版進度與語音設定不變。"));
   const stats=el("div","av-stats");
   for(const [l,name]of [["all","全部"],["N3","N3"],["N2","N2"],["N1","N1"]])
     stats.append(add(el("div","av-stat"),el("strong","",filterRows({level:l}).length),el("small","",name)));
   shell.append(stats);
   const filters=el("div","av-filters"),selection={level:"all",theme:"all",kind:"all",tone:"all",kana:"all",query:""};
   const searchField=el("label","av-field av-wide");
   const input=el("input");input.type="search";input.autocomplete="off";
   input.placeholder="漢字、假名、中文、語感…";input.setAttribute("aria-label","搜尋進階日語詞彙");
   searchField.append(el("span","","搜尋單字與語感"),input);filters.append(searchField);
   let page=0;
   function select(label,name,choices){
     const field=el("label","av-field"),s=el("select");
     s.setAttribute("aria-label",label);
     for(const [value,text]of choices){const o=el("option","",text);o.value=value;s.append(o)}
     field.append(el("span","",label),s);filters.append(field);
     s.addEventListener("change",()=>{selection[name]=s.value;page=0;draw()});
   }
   select("建議程度","level",[["all","全部程度"],["N3","N3"],["N2","N2"],["N1","N1"]]);
   select("學習主題","theme",[["all","全部主題"],...themes.map(t=>[t.id,t.title])]);
   select("詞性","kind",[["all","全部詞性"],["i","い形容詞"],["na","な形容詞"],["noun","名詞"],["verb","動詞"],["adverb","副詞・擬態語"],["phrase","慣用表現"]]);
   select("語感","tone",[["all","所有語感"],...Object.entries(TONES)]);
   shell.append(filters);
   const kana=el("div","av-kana"),kanaButtons=[];
   for(const [value,label]of kanaTabs){
     const b=button(label,"av-kana-button");b.setAttribute("aria-pressed",String(value==="all"));
     b.addEventListener("click",()=>{selection.kana=value;page=0;draw()});
     kanaButtons.push([value,b]);kana.append(b);
   }
   shell.append(kana);
   const count=el("p","av-count");count.setAttribute("role","status");
   const pager=el("div","av-pager"),grid=el("div","av-grid");
   const dialog=el("dialog","av-dialog"),body=el("div","av-dialog-body"),
     close=button("✕ 關閉","av-close");
   close.setAttribute("aria-label","關閉進階詞彙詳情");
   function closeDialog(){A.stop();if(typeof dialog.close==="function"&&dialog.open)dialog.close();else dialog.removeAttribute("open")}
   close.addEventListener("click",closeDialog);
   dialog.addEventListener("click",event=>{if(event.target===dialog)closeDialog()});
   dialog.addEventListener("close",()=>A.stop());
   const dialogTop=el("div","av-dialog-top");dialogTop.append(close);
   dialog.append(dialogTop,body);
   const openWord=w=>{
     detail(body,w,openWord);
     if(typeof dialog.showModal==="function"){
       if(!dialog.open)dialog.showModal();
     }else dialog.setAttribute("open","");
   };
   function draw(){
     const found=filterRows(selection),size=window.matchMedia?.("(max-width:700px)")?.matches?16:32,
        total=Math.max(1,Math.ceil(found.length/size));
     page=Math.min(page,total-1);
     count.textContent="找到 "+found.length+" 個進階詞彙 · "+(page+1)+"／"+total+" 頁";
     grid.replaceChildren();pager.replaceChildren();
     for(const word of found.slice(page*size,(page+1)*size)){
       const tile=button("","av-tile");
       tile.setAttribute("aria-label","查看 "+word.word+" 的語感與例句");
       jp(tile,F.annotation(word.word,word.reading),"av-tile-word");
       tile.append(el("span","av-tile-zh",word.zh),
         el("small","av-tile-level",word.level+" · "+POS[word.kind]));
       tile.addEventListener("click",()=>openWord(word));
       grid.append(tile);
     }
     if(!found.length)grid.append(el("p","av-empty","沒有找到符合條件的詞，請清除部分篩選條件。"));
     const prev=button("← 上一頁","av-page"),next=button("下一頁 →","av-page");
     prev.disabled=page===0;next.disabled=page>=total-1;
     prev.addEventListener("click",()=>{if(page>0){page--;draw()}});
     next.addEventListener("click",()=>{if(page<total-1){page++;draw()}});
     pager.append(prev,el("span","av-page-number",(page+1)+"／"+total),next);
     for(const [value,b]of kanaButtons)b.setAttribute("aria-pressed",String(selection.kana===value));
   }
   input.addEventListener("input",()=>{selection.query=input.value;page=0;draw()});
   shell.append(count,pager,grid,
     el("p","av-disclaimer","注意：難度為教材建議，並非官方 JLPT 公布的必考字表；正面／負面語感也可能因情境改變。"),dialog);
   draw();host.append(shell);return true;
 }
 window.ENJP_AdvancedAtlas={
   id:ID,has:id=>id===ID,render,words,themes,topics,issues,filterRows,formRows,firstGroup,POS,TONES
 };
})();
