window.RankingRender = (() => {
 let lang='en';const labelsEN={movie:'Movie',tv:'TV',music:'Music',book:'Book',game:'Game',anime:'Anime',custom:'Custom',other:'Other'};const labelsKO={movie:'영화',tv:'TV',music:'음악',book:'책',game:'게임',anime:'애니메이션',custom:'직접 추가',other:'기타'};const labels=new Proxy({}, {get(_,kind){return (lang==='en'?labelsEN:labelsKO)[kind]||''}});const t=(en,ko)=>lang==='en'?en:ko;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 function image(item,cls){const wrap=el('div',cls); if(item.image){const img=el('img');img.src=item.image;img.alt=item.title;img.loading='lazy';img.onerror=()=>{wrap.textContent='✦';wrap.classList.add('no-image')};wrap.append(img);}else{wrap.textContent='✦';wrap.classList.add('no-image')}return wrap;}
 function results(items, onAdd){const host=document.getElementById('searchResults');host.replaceChildren();document.getElementById('resultCount').textContent=t(`${items.length} results`,`${items.length}개 결과`);
 if(!items.length){host.append(el('div','empty-results',t('No results. Try adding manually.','검색 결과가 없어요. 직접 추가해보세요.')));return;}
 items.forEach(item=>{const row=el('div','result-item');row.append(image(item,'result-thumb'));const body=el('div','result-info');body.append(el('strong','',item.title),el('small','',`${labels[item.kind]||''}${item.detail?' · '+item.detail:''}`));row.append(body);const b=el('button','add-button','＋');b.type='button';b.title=t(`Add ${item.title}`,`${item.title} 추가`);b.setAttribute('aria-label',t(`Add ${item.title}`,`${item.title} 추가`));b.addEventListener('click',()=>onAdd(item));row.append(b);host.append(row);});
 }
 function ranking(items,callbacks){const edit=document.getElementById('rankEditor'),grid=document.getElementById('posterGrid'),list=document.getElementById('rankingList');edit.replaceChildren();grid.replaceChildren();list.replaceChildren();
 if(!items.length){edit.append(el('div','empty-rank',t('Search or add an item on the left.','왼쪽에서 작품을 검색하거나 직접 추가해보세요.')));grid.append(el('div','empty-poster',t('Your ranking images will appear here.','여기에 랭킹 이미지가 표시됩니다.')));return;}
 items.forEach((item,i)=>{
  const row=el('div','rank-row');row.draggable=true;row.dataset.index=i;row.append(el('span','grab','☰'),el('span','rank-number',String(i+1).padStart(2,'0')),image(item,'rank-thumb'));
  const info=el('div','rank-info');info.append(el('strong','',item.title),el('small','',labels[item.kind]||''));row.append(info);
  const controls=el('div','rank-actions');[['↑',t('Move up','위로 이동'),()=>callbacks.move(i,i-1)],['↓',t('Move down','아래로 이동'),()=>callbacks.move(i,i+1)],['×',t('Remove','삭제'),()=>callbacks.remove(i)]].forEach(([symbol,title,fn])=>{const b=el('button','icon-button',symbol);b.type='button';b.title=title;b.setAttribute('aria-label',`${item.title} ${title}`);b.addEventListener('click',fn);controls.append(b)});row.append(controls);
  row.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',String(i));e.dataTransfer.effectAllowed='move';row.classList.add('dragging')});row.addEventListener('dragend',()=>row.classList.remove('dragging'));
  row.addEventListener('dragover',e=>{e.preventDefault();row.classList.add('drag-over')});row.addEventListener('dragleave',()=>row.classList.remove('drag-over'));row.addEventListener('drop',e=>{e.preventDefault();row.classList.remove('drag-over');const from=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(from)) callbacks.move(from,i)});
  edit.append(row);
  const card=el('article','poster-card');const pic=image(item,'poster-image');pic.append(el('span','poster-rank',`#${i+1}`));card.append(pic,el('div','poster-title',item.title));grid.append(card);
  const li=el('li');li.textContent=item.title;list.append(li);
 });
 }
 return {results,ranking,setLanguage(next){lang=next}};
})();
