"use strict";
/* V3 standalone self-study drills. No writes to old or V3 progress.
   Audio only plays from direct user clicks; keep iOS speech permission intact. */
(function(){
  const el=(tag,cls,text)=>{
    const x=document.createElement(tag);
    if(cls)x.className=cls;
    if(text!==undefined)x.textContent=String(text);
    return x;
  };
  function shuffle(rows){
    const x=[...rows];
    for(let i=x.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [x[i],x[j]]=[x[j],x[i]];
    }
    return x;
  }
  function makeReading(text,language){
    if(language==="jp"){
      if(!window.ENJP_Audio?.spokenJapanese(text))return null;
      return text;
    }
    return String(text||"").trim()||null;
  }
  function voiceButton(text,language){
    const btn=el("button","play alt","🔊 聽題目");
    btn.type="button";
    const status=el("span","audio-status","");
    const checked=makeReading(text,language);
    if(!checked){btn.disabled=true;btn.textContent="🔇 讀音待校對"}
    else btn.addEventListener("click",()=>window.ENJP_Audio?.play(checked,language,btn,status));
    return {btn,status};
  }
  function weakPairs(){
    let flags={};
    try{
      const v=JSON.parse(window.localStorage?.getItem("enjpOceanV3QuestFlagsV1")||"{}");
      if(v&&typeof v==="object"&&!Array.isArray(v))flags=v;
    }catch{}
    const list=[];
    const lessons=window.ENJP_COURSES?.lesson||{};
    for(const [id,lesson] of Object.entries(lessons)){
      if(lesson.type!=="dual"||!Array.isArray(lesson.items))continue;
      lesson.items.forEach((x,i)=>{
        if(flags[id+":"+i]?.weak&&x.en&&x.jp)list.push(x);
      });
    }
    const seen=new Set();
    return list.filter(x=>{
      const key=x.en+"|"+x.jp;
      if(seen.has(key))return false;
      seen.add(key);return true;
    });
  }
  function questions(lesson,id){
    const weak=id==="dual-weak"?weakPairs():[];
    const samples=(weak.length?weak:lesson.items||[]).filter(x=>x);
    return shuffle(samples);
  }
  function renderQuiz(root,lesson,id){
    const audio=window.ENJP_Audio;
    const listen=/listen|conversations|sentences/.test(id);
    const dual=lesson.type==="dual";
    const msg=el("p","study-hint",
      listen?"先按播放、選擇答案，作答後才顯示題目文字。":"先回想意思，再選擇正確答案；答完可以立即檢討。");
    const box=el("section","study-practice");
    box.append(el("h3","","🧠 自學小測驗"),msg);
    if(id==="dual-weak")box.append(el("p","study-hint","僅讀取 V3 的「待複習」標記；若沒有標記，改用本節示範題。尚未同步舊版錯題。"));
    const header=el("div","study-progress");
    const prompt=el("div","study-prompt");
    const sounds=el("div","study-audio");
    const choices=el("div","study-options");
    const feedback=el("p","study-feedback","");
    feedback.setAttribute("role","status");
    const actions=el("div","study-controls");
    const next=el("button","play alt","下一題 →");next.type="button";
    actions.append(next);
    box.append(header,prompt,sounds,choices,feedback,actions);
    root.append(box);
    let rows=questions(lesson,id),pos=0,done=0,correct=0,answered=false;
    function optionValue(item){return dual?item.jp:item.translation}
    function optionText(item){return dual?(item.ruby||item.jp):item.translation}
    function promptText(item){return dual?item.en:(lesson.type==="jp"?item.example:item.example)}
    function answerId(item){return dual?item.jp:item.translation}
    function asText(target,text,lang){
      target.replaceChildren();
      if(lang==="jp")target.append(audio.makeRuby(text));
      else target.textContent=text;
    }
    function draw(){
      if(!rows.length){
        header.textContent="沒有可練習的資料。";
        prompt.textContent="此章節尚無可作答的題目。";
        choices.replaceChildren();sounds.replaceChildren();next.disabled=true;return;
      }
      const current=rows[pos],question=promptText(current);
      answered=false;feedback.textContent="";
      header.textContent="第 "+(pos+1)+" / "+rows.length+" 題 · 正確 "+correct+" 題";
      prompt.replaceChildren();
      if(!listen)asText(prompt,question,(!dual&&lesson.type==="jp")?"jp":"en");
      else prompt.textContent="🎧 聽題模式：作答前先不顯示原文";
      sounds.replaceChildren();
      if(listen){
        const language=lesson.type==="jp"?"jp":lesson.type==="dual"?(pos%2?"jp":"en"):"en";
        const spoken=lesson.type==="dual"?(language==="jp"?current.jpExample:current.enExample):question;
        const voice=voiceButton(spoken,language);
        sounds.append(voice.btn,voice.status);
      }
      const target=answerId(current),unique=[];
      for(const option of [current,...shuffle(rows.filter(x=>answerId(x)!==target))]){
        if(!unique.some(x=>answerId(x)===answerId(option)))unique.push(option);
        if(unique.length===4)break;
      }
      if(unique.length<2){
        feedback.textContent="此單元答案不足以產生選擇題，請先學習卡片。";
        choices.replaceChildren();next.disabled=true;return;
      }
      choices.replaceChildren();
      for(const choice of shuffle(unique)){
        const b=el("button","study-option");b.type="button";
        if(dual)b.append(audio.makeRuby(optionText(choice)));
        else b.textContent=optionText(choice);
        b.addEventListener("click",()=>{
          if(answered)return;
          answered=true;done++;
          const ok=answerId(choice)===target;
          if(ok)correct++;
          b.classList.add(ok?"correct":"incorrect");
          for(const btn of choices.querySelectorAll("button"))btn.disabled=true;
          feedback.textContent=ok?"答對了！":("正確答案："+(dual?current.en+" → "+current.jp:current.translation));
          if(listen){
            prompt.replaceChildren();
            const shown=lesson.type==="dual"?(pos%2?current.jpExample:current.enExample):question;
            asText(prompt,shown,lesson.type==="jp"||(dual&&pos%2)?"jp":"en");
          }
          header.textContent="第 "+(pos+1)+" / "+rows.length+" 題 · 正確 "+correct+" 題";
          next.textContent=pos===rows.length-1?"查看成績":"下一題 →";
        });
        choices.append(b);
      }
      next.disabled=false;
      next.textContent=pos===rows.length-1?"查看成績":"下一題 →";
    }
    function showResult(){
      prompt.textContent="本輪完成！"+correct+" / "+rows.length+" 題正確。";
      header.textContent="練習結果";
      sounds.replaceChildren();choices.replaceChildren();
      feedback.textContent="這份測驗不會改動舊版進度。可以重新挑戰，或回到卡片複習錯題。";
      next.textContent="🔄 再練一次";
    }
    next.addEventListener("click",()=>{
      audio.stop();
      if(pos>=rows.length){rows=questions(lesson,id);pos=0;done=0;correct=0;draw();return}
      if(!answered){feedback.textContent="請先選一個答案，再進入下一題。";return}
      pos++;
      if(pos===rows.length)showResult();
      else draw();
    });
    draw();
    return box;
  }
  function renderMatch(root,lesson){
    const audio=window.ENJP_Audio;
    const shell=el("section","study-practice");
    shell.append(el("h3","","⏱ 配對競速"),el("p","study-hint","先按英文，再按對應日文。每對答對就鎖定；答錯可以繼續嘗試，不影響學習紀錄。"));
    const counter=el("p","study-feedback","");
    counter.setAttribute("role","status");
    const grid=el("div","study-match-grid");
    const restart=el("button","play alt","🔄 重新配對");restart.type="button";
    shell.append(counter,grid,restart);root.append(shell);
    function reset(){
      audio.stop();
      const pairs=shuffle((lesson.items||[]).filter(x=>x.en&&x.jp));
      const enCol=el("div","study-match-column"),jpCol=el("div","study-match-column");
      const done=new Set();let chosen=null,wrong=0;
      function update(){
        counter.textContent="已配對 "+done.size+" / "+pairs.length+" 組 · 錯誤 "+wrong+" 次"+(done.size===pairs.length?" · 全部完成！":"");
      }
      for(const x of pairs){
        const b=el("button","study-match-option",x.en);b.type="button";
        b.addEventListener("click",()=>{if(done.has(x.en))return;chosen=x.en;for(const node of enCol.querySelectorAll("button"))node.classList.remove("selected");b.classList.add("selected")});
        enCol.append(b);
      }
      for(const x of shuffle(pairs)){
        const b=el("button","study-match-option");b.type="button";b.append(audio.makeRuby(x.ruby||x.jp));
        b.addEventListener("click",()=>{
          if(!chosen){counter.textContent="請先選擇左側英文。";return}
          if(done.has(x.en))return;
          if(chosen===x.en){
            done.add(x.en);b.disabled=true;b.classList.add("correct");
            for(const btn of enCol.querySelectorAll("button"))if(btn.textContent===x.en){btn.disabled=true;btn.classList.add("correct");btn.classList.remove("selected")}
            chosen=null;
          }else{wrong++;b.classList.add("incorrect");}
          update();
        });
        jpCol.append(b);
      }
      grid.replaceChildren(enCol,jpCol);update();
    }
    restart.addEventListener("click",reset);reset();return shell;
  }
  function render(root,lesson,id){
    if(!lesson?.selfStudy||!Array.isArray(lesson.items)||lesson.items.length<2)return false;
    if(id==="dual-match")renderMatch(root,lesson);
    else renderQuiz(root,lesson,id);
    return true;
  }
  window.ENJP_SelfStudyPractice={render,weakPairs,questions};
})();
