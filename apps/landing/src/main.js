(() => {
  const cpuSteps=[.25,.5,1,2,4,6,8,10,12,16,20,24,32,40,48,64];
  const diskSteps=[10,20,30,40,50,60,70,80,90,100,120,140,160,200,256,320,384,512,640,768,896,1024];
  const multipliers=[1,2,3,4], ramLimit=256;
  const presets=[
    {label:'совсем простенький',icon:'preset-simple.svg',cpu:8,ram:1,disk:60},
    {label:'как у всех',icon:'preset-medium.svg',cpu:16,ram:2,disk:200},
    {label:'что-то намечается',icon:'preset-medium.svg',cpu:32,ram:3,disk:512},
    {label:'мощь',icon:'preset-power.svg',cpu:48,ram:4,disk:896}
  ];
  const state={cpu:8,ram:2,disk:200,gpu:false,backups:true,period:'month'};
  const fmt=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:0});
  const ramFmt=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2});
  const $=(q,p=document)=>p.querySelector(q), $$=(q,p=document)=>[...p.querySelectorAll(q)];
  const boundary=(position,count,width)=>{const f=position/(count-1);return `calc(${f*100}% + ${width/2-f*width}px)`};

  setTimeout(()=>$('.page').dataset.stage='ready',100);
  const words=['проектов','приложений','сервисов','сайтов']; let word=0;
  const wordNode=$('.rotating-word'), wordSlot=$('.word-slot');
  const sizeWord=()=>{const probe=document.createElement('span');probe.style.cssText='position:absolute;visibility:hidden;white-space:nowrap;font:inherit';probe.textContent=wordNode.textContent;wordSlot.append(probe);wordSlot.style.width=probe.getBoundingClientRect().width+'px';probe.remove()};
  document.fonts.ready.then(sizeWord); addEventListener('resize',sizeWord);
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{wordNode.classList.add('out');setTimeout(()=>{word=(word+1)%words.length;wordNode.textContent=words[word];wordNode.classList.remove('out');sizeWord()},300)},3200);

  const serverCards=$$('.server-card');
  const rotateServerCards=()=>{
    const topCard=serverCards.find(card=>card.dataset.slot==='0');
    if(!topCard)return;
    topCard.classList.add('is-leaving');
    serverCards.forEach(card=>{
      const slot=Number(card.dataset.slot);
      if(slot>0)card.dataset.slot=String(slot-1);
    });
    setTimeout(()=>{
      topCard.dataset.slot=String(serverCards.length-1);
      topCard.classList.remove('is-leaving');
    },720);
  };
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(rotateServerCards,2800);

  const chips=$('.chips');
  presets.forEach((p,i)=>{const b=document.createElement('button');b.className='chip';b.innerHTML=`${p.label}<img src="/media/${p.icon}" alt="">`;b.onclick=()=>{state.cpu=p.cpu;state.ram=p.ram;state.disk=p.disk;render()};chips.append(b)});
  const els={cpu:$('[data-resource=cpu]'),ram:$('[data-resource=ram]'),disk:$('[data-resource=disk]')};
  function makeMarks(root,count){const holder=$('.step-marks',root);holder.innerHTML='';for(let i=0;i<count;i++){const m=document.createElement('i');m.className='mark';holder.append(m)}}
  makeMarks(els.cpu,cpuSteps.length);makeMarks(els.ram,cpuSteps.length);makeMarks(els.disk,diskSteps.length);
  function paint(root,selected,minimum,count,width,filledStart=minimum,filledEnd=selected){const scale=$('.step-scale',root),marks=$$('.mark',root);marks.forEach((m,i)=>{m.classList.toggle('filled',i>=filledStart&&i<=filledEnd);m.classList.toggle('current',i===selected)});scale.style.setProperty('--current-position',boundary(selected,count,width));scale.style.setProperty('--available-start',boundary(minimum-.5,count,width));scale.style.setProperty('--available-end',boundary(count-.5,count,width));}
  function setupRange(name,steps){const root=els[name],input=$('input[type=range]',root);input.min=0;input.max=steps.length-1;input.step=1;input.oninput=()=>{let idx=+input.value;if(name==='cpu'&&state.gpu)idx=Math.max(idx,cpuSteps.indexOf(8));state[name]=steps[idx];render()};$('.minus',root).onclick=()=>step(name,-1);$('.plus',root).onclick=()=>step(name,1)}
  function step(name,direction){const steps=name==='cpu'?cpuSteps:name==='disk'?diskSteps:multipliers;let idx=steps.indexOf(state[name]);if(name==='cpu'&&state.gpu)idx=Math.max(idx+direction,cpuSteps.indexOf(8));else idx+=direction;idx=Math.max(0,Math.min(steps.length-1,idx));state[name]=steps[idx];render()}
  setupRange('cpu',cpuSteps);setupRange('disk',diskSteps);$('.minus',els.ram).onclick=()=>step('ram',-1);$('.plus',els.ram).onclick=()=>step('ram',1);
  $('#gpu').onchange=e=>{state.gpu=e.target.checked;if(state.gpu&&state.cpu<8)state.cpu=8;render()};$('#backups').onchange=e=>{state.backups=e.target.checked;render()};
  $$('.periods button').forEach(b=>b.onclick=()=>{state.period=b.dataset.period;render()});$('.launch').onclick=()=>$('.notice').hidden=false;

  function render(){
    const cpuIndex=cpuSteps.indexOf(state.cpu),cpuMin=state.gpu?cpuSteps.indexOf(8):0;
    paint(els.cpu,cpuIndex,cpuMin,cpuSteps.length,8);$('.step-scale',els.cpu).classList.toggle('constrained',state.gpu);const cpuInput=$('input',els.cpu);cpuInput.value=cpuIndex;cpuInput.min=cpuMin;$('output',els.cpu).textContent=state.cpu+' vCPU';$('.minus',els.cpu).disabled=cpuIndex===cpuMin;$('.plus',els.cpu).disabled=cpuIndex===cpuSteps.length-1;
    const available=multipliers.filter(x=>state.cpu*x<=ramLimit);if(!available.includes(state.ram))state.ram=available[available.length-1];const first=Math.round(Math.pow(cpuIndex/(cpuSteps.length-1),1.2)*(cpuSteps.length-multipliers.length)),last=first+available.length-1,selected=first+available.indexOf(state.ram);paint(els.ram,selected,first,cpuSteps.length,8,first,selected);const ramScale=$('.step-scale',els.ram);ramScale.style.setProperty('--available-end',boundary(last+.5,cpuSteps.length,8));const ramInput=$('input',els.ram);ramInput.min=first;ramInput.max=last;ramInput.value=selected;ramInput.oninput=()=>{state.ram=available[Math.max(0,Math.min(available.length-1,+ramInput.value-first))];render()};$('output',els.ram).textContent=ramFmt.format(state.cpu*state.ram)+' ГБ';$('.minus',els.ram).disabled=state.ram===available[0];$('.plus',els.ram).disabled=state.ram===available[available.length-1];
    const diskIndex=diskSteps.indexOf(state.disk);paint(els.disk,diskIndex,0,diskSteps.length,6);$('input',els.disk).value=diskIndex;$('output',els.disk).textContent=state.disk+' ГБ';$('.minus',els.disk).disabled=diskIndex===0;$('.plus',els.disk).disabled=diskIndex===diskSteps.length-1;
    $('#gpu').checked=state.gpu;$('#backups').checked=state.backups;
    const level=cpuIndex/(cpuSteps.length-1)*.5+(state.cpu*state.ram)/ramLimit*.25+diskIndex/(diskSteps.length-1)*.25;const active=level<.32?0:level<.55?1:level<.78?2:3;$$('.chip').forEach((c,i)=>{c.classList.toggle('active',i===active);c.setAttribute('aria-pressed',i===active)});
    $$('.periods button').forEach(b=>b.classList.toggle('selected',b.dataset.period===state.period));
    const factor=state.period==='year'?12:state.period==='day'?1/30:1,memory=state.cpu*state.ram;const rows=[{label:`${state.cpu} vCPU`,cost:state.cpu*1.24*720},{label:`${ramFmt.format(memory)} ГБ RAM`,cost:memory*.33*720},{label:`${state.disk} ГБ SSD`,cost:state.disk*8.99},{label:'GPU 16 ГБ',cost:state.gpu?21999.36:0,off:!state.gpu},{label:'Публичный IP',cost:.26352*720}];if(state.backups)rows.push({label:'Автобэкапы',cost:280.8+state.disk*4.968});let total=0;$('.specs').innerHTML=rows.map(r=>{const cost=Math.round(r.cost*factor);total+=cost;return `<div class="spec-row"><span>${r.label}</span><span>${r.off?'Выкл':fmt.format(cost)+' ₽'}</span></div>`}).join('');$('.total').textContent=fmt.format(total)+' ₽';
  }

  function ascii(node){const video=$('video',node),canvas=$('canvas',node),ctx=canvas.getContext('2d'),sample=document.createElement('canvas'),s=sample.getContext('2d',{willReadFrequently:true});const cols=78,rows=30,cw=12,ch=18,glyphs='·:h30@';sample.width=cols;sample.height=rows;canvas.width=cols*cw;canvas.height=rows*ch;ctx.font='16px CoFo,monospace';ctx.textBaseline='top';let raf=0;const draw=()=>{if(video.readyState>=2){s.drawImage(video,0,0,cols,rows);const px=s.getImageData(0,0,cols,rows).data;ctx.clearRect(0,0,canvas.width,canvas.height);for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const o=(y*cols+x)*4,l=px[o]*.2126+px[o+1]*.7152+px[o+2]*.0722;if(l<48)continue;const p=Math.min(1,(l-48)/207);ctx.fillStyle=`rgba(255,255,255,${.24+p*.76})`;ctx.fillText(glyphs[Math.min(glyphs.length-1,Math.floor(p*glyphs.length))],x*cw,y*ch)}}if(!matchMedia('(prefers-reduced-motion: reduce)').matches)raf=requestAnimationFrame(draw)};const start=()=>{video.play().catch(()=>{});draw()};video.addEventListener('loadeddata',start,{once:true});if(video.readyState>=2)start()}
  $$('.ascii-hand').forEach(ascii);render();
})();
