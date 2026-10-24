(()=>{
 'use strict';
 const STORE='top20_studio_v1';const LANG_STORE='top20_studio_lang';let lang=localStorage.getItem(LANG_STORE)==='ko'?'ko':'en';const $=id=>document.getElementById(id);
 let state={title:'My TOP 20',description:'',items:[]};let activeResults=[];let controller=null;let searchStatus='idle';let searchError='';
 const msg=(en,ko)=>lang==='en'?en:ko;
 const dictionary={en:{'exportBtn':'↧ Export JSON','importBtn':'↥ Import','printBtn':'Print / PDF','demoBtn':'✦ Load example list','clearBtn':'Clear all'},ko:{'exportBtn':'↧ JSON 저장','importBtn':'↥ 불러오기','printBtn':'인쇄 / PDF','demoBtn':'✦ 예시 리스트 채우기','clearBtn':'전체 초기화'}};
 const staticText={en:['Create a list','List title','Description','(optional)','Search content','Search','Search results','Add manually','Name','Upload image','＋ Add to my list','Edit ranking','Your TOP 20','Full ranking'],ko:['리스트 만들기','리스트 제목','설명','(선택)','콘텐츠 검색','검색','검색 결과','직접 추가하기','이름','이미지 업로드','＋ 내 리스트에 추가','순위 편집','완성된 TOP 20','전체 순위']};
 const staticSelectors=['.editor h2:nth-of-type(1)','label[for=listTitle]','label[for=listDescription]','.field-label .muted','.editor h2:nth-of-type(2)','#searchForm button','.search-head h3','.editor h3:not(.search-head h3) label','.manual-form label[for=manualTitle]','label[for=manualImage]','#manualForm button','.preview-toolbar h3','.output-heading h2','.text-ranking h3'];
 function applyLanguage(){document.documentElement.lang=lang;document.querySelectorAll('[data-i18n]').forEach(el=>{const a=el.getAttribute('data-i18n').split('|');el.textContent=lang==='en'?a[0]:a[1]});for(const [id,text] of Object.entries(dictionary[lang]))$(id).textContent=text;$('langEN').classList.toggle('active',lang==='en');$('langKO').classList.toggle('active',lang==='ko');$('langEN').setAttribute('aria-pressed',String(lang==='en'));$('langKO').setAttribute('aria-pressed',String(lang==='ko'));$('searchInput').placeholder=msg('Search by title...','제목을 입력하세요');$('manualTitle').placeholder=msg('Item name','추가할 항목 이름');$('listTitle').placeholder=msg('e.g. My all-time TOP 20','예: 내 인생 최고의 TOP 20');$('listDescription').placeholder=msg('Add a short description.','간단한 설명을 입력하세요.');$('saveState').textContent=msg('● Autosaved',msg('● Autosaved','● 자동 저장됨'));Top20Render.setLanguage(lang);update();if(searchStatus==='done')Top20Render.results(activeResults,add);else if(searchStatus==='searching'){$('searchResults').textContent=msg('Searching…','검색 중…');$('resultCount').textContent=msg('Searching','검색 중');}else if(searchStatus==='error'){$('searchResults').textContent=searchError;$('resultCount').textContent=msg('Search failed','검색 실패');}else{$('resultCount').textContent=msg('Start searching','검색을 시작해보세요');const empty=$('searchResults').querySelector('.empty-results span');if(empty)empty.textContent=msg('Search for a title to see the results here.','제목을 검색하면 이곳에 결과가 표시됩니다.');}$('jpgBtn').textContent=msg('🖼 Export JPG','🖼 JPG 저장');document.title=msg('TOP 20 — Create Your Ranking','TOP 20 — 나만의 순위 만들기')}
 $('langEN').addEventListener('click',()=>{lang='en';localStorage.setItem(LANG_STORE,lang);applyLanguage()});$('langKO').addEventListener('click',()=>{lang='ko';localStorage.setItem(LANG_STORE,lang);applyLanguage()});
 function toast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>t.classList.remove('show'),3200)}
 function persist(){try{localStorage.setItem(STORE,JSON.stringify(state));$('saveState').textContent=msg('● Autosaved','● 자동 저장됨')}catch(e){$('saveState').textContent=msg('● Storage full','● 저장 공간 부족');toast('브라우저 저장 용량을 초과했어요. 큰 이미지를 줄여주세요.')}}
 function update(){const count=state.items.length;$('previewTitle').textContent=state.title||msg('Untitled TOP 20','제목 없는 TOP 20');$('displayTitle').textContent=state.title||msg('Untitled TOP 20','제목 없는 TOP 20');$('itemCount').textContent=count;$('progressBar').style.width=`${count*5}%`;for(const id of ['previewDesc','displayDesc']){const n=$(id);n.textContent=state.description;n.hidden=!state.description}Top20Render.ranking(state.items,{move,remove});persist()}
 function add(item){if(state.items.length>=20)return toast(msg('You can add up to 20 items.','TOP 20에는 최대 20개만 넣을 수 있어요.'));if(state.items.some(x=>x.id===item.id))return toast(msg('Already added to your list.','이미 리스트에 추가한 항목이에요.'));state.items.push(item);update();toast(msg(`Added: ${item.title}`,`「${item.title}」 추가 완료!`))}
 function move(from,to){if(from<0||from>=state.items.length||to<0||to>=state.items.length||from===to)return;const [item]=state.items.splice(from,1);state.items.splice(to,0,item);update()}
 function remove(i){state.items.splice(i,1);update()}
 $('listTitle').addEventListener('input',e=>{state.title=e.target.value;update()});$('listDescription').addEventListener('input',e=>{state.description=e.target.value;update()});
 $('searchForm').addEventListener('submit',async e=>{e.preventDefault();const query=$('searchInput').value.trim();if(!query)return;if(controller)controller.abort();controller=new AbortController();searchStatus='searching';$('searchResults').textContent=msg('Searching…','검색 중…');$('resultCount').textContent=msg('Searching','검색 중');try{const results=await Top20API.search(query,'all',controller.signal);if(controller.signal.aborted)return;activeResults=results;searchStatus='done';Top20Render.results(activeResults,add)}catch(err){if(err.name==='AbortError')return;searchStatus='error';searchError=err.message;$('searchResults').textContent=searchError;$('resultCount').textContent=msg('Search failed','검색 실패')}});
 $('manualForm').addEventListener('submit',e=>{e.preventDefault();const title=$('manualTitle').value.trim();if(!title)return;const file=$('manualImage').files[0];if(file&&file.size>3*1024*1024)return toast(msg('Images must be under 3 MB.','이미지는 3MB 이하로 선택해 주세요.'));const create=(image='')=>{add({id:`custom-${Date.now()}-${Math.random().toString(36).slice(2)}`,title,image,kind:'custom',detail:''});$('manualForm').reset()};if(!file){create();return;}const reader=new FileReader();reader.onload=()=>create(String(reader.result));reader.onerror=()=>toast(msg('Cannot read the image.','이미지를 읽을 수 없어요.'));reader.readAsDataURL(file)});
 $('clearBtn').addEventListener('click',()=>{if(!confirm(msg('Clear the entire list and title?','리스트의 모든 항목과 제목을 초기화할까요?')))return;state={title:'My TOP 20',description:'',items:[]};$('listTitle').value=state.title;$('listDescription').value='';update();toast('새 리스트를 시작할 수 있어요.')});
 $('demoBtn').addEventListener('click',()=>{if(state.items.length&&!confirm(msg('Replace your current list with the example?','현재 리스트를 예시 리스트로 교체할까요?')))return;state={title:'My Favorite TOP 20',description:'An example of my favorites',items:[{id:'demo-1',title:'Interstellar',kind:'movie',image:'',detail:''},{id:'demo-2',title:'The Dark Knight',kind:'movie',image:'',detail:''},{id:'demo-3',title:'Inception',kind:'movie',image:'',detail:''},{id:'demo-4',title:'Parasite',kind:'movie',image:'',detail:''},{id:'demo-5',title:'The Matrix',kind:'movie',image:'',detail:''}]};$('listTitle').value=state.title;$('listDescription').value=state.description;update();toast('예시 리스트가 준비됐어요. 자유롭게 수정해보세요!')});
 $('exportBtn').addEventListener('click',()=>{const blob=new Blob([JSON.stringify({...state,version:1,exportedAt:new Date().toISOString()},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='my-top20.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
 $('importBtn').addEventListener('click',()=>$('importFile').click());$('importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(!Array.isArray(data.items)||data.items.length>20||data.items.some(x=>typeof x.title!=='string'||typeof x.id!=='string'))throw new Error('올바른 TOP 20 데이터가 아니에요.');state={title:String(data.title||'나만의 TOP 20').slice(0,100),description:String(data.description||'').slice(0,300),items:data.items.map(x=>({id:x.id,title:x.title.slice(0,120),image:typeof x.image==='string'&&(/^(https:\/\/|data:image\/(png|jpeg|webp|gif);base64,)/).test(x.image)?x.image:'',kind:String(x.kind||'custom'),detail:String(x.detail||'') }))};$('listTitle').value=state.title;$('listDescription').value=state.description;update();toast('리스트를 불러왔어요.')}catch(err){toast(`불러오기 실패: ${err.message}`)}finally{e.target.value=''}});
 let jpgObjectURL=null;
 const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 function closeJpgDialog(){ $('jpgDialog').hidden=true; document.body.classList.remove('jpg-dialog-open'); if(jpgObjectURL){URL.revokeObjectURL(jpgObjectURL);jpgObjectURL=null;} }
 $('jpgClose').addEventListener('click',closeJpgDialog);
 $('jpgDialog').addEventListener('click',e=>{if(e.target===$('jpgDialog'))closeJpgDialog()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('jpgDialog').hidden)closeJpgDialog()});
 function showJpgDialog(blob,filename){
   if(jpgObjectURL)URL.revokeObjectURL(jpgObjectURL);
   jpgObjectURL=URL.createObjectURL(blob);
   $('jpgPreview').src=jpgObjectURL;
   $('jpgDownload').href=jpgObjectURL;
   $('jpgDownload').download=filename;
   $('jpgDialogTitle').textContent=msg('Save your TOP 20','TOP 20 JPG 저장');
   $('jpgHelp').textContent=isIOS()?msg('On iPhone, touch and hold the image and choose Save to Photos. Or use Download JPG below.','아이폰에서 이미지를 길게 눌러 사진에 저장하거나, 아래 JPG 다운로드를 눌러주세요.') :msg('Preview your image or download the JPG file.','이미지를 확인하거나 JPG 파일을 다운로드하세요.');
   $('jpgDownload').textContent=msg('Download JPG','JPG 다운로드');
   $('jpgClose').setAttribute('aria-label',msg('Close','닫기'));
   $('jpgDialog').hidden=false;
   document.body.classList.add('jpg-dialog-open');
 }
 async function exportAsJPG(){
   const target=$('exportArea');
   if(typeof window.html2canvas!=='function'){
     toast(msg('The JPG library did not load. Check your connection and reload.','JPG 저장 라이브러리를 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.'));
     return;
   }
   const btn=$('jpgBtn');btn.disabled=true;btn.textContent=msg('Rendering…','이미지 생성 중…');
   try{
     // Use a stable desktop-sized export in the cloned document, regardless of phone width.
     // Keep canvas within practical iOS Safari memory limits.
     await Promise.all(Array.from(target.querySelectorAll('img')).map(img=>{
       if(img.complete)return Promise.resolve();
       return new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});});
     }));
     const canvas=await window.html2canvas(target,{
       backgroundColor:'#17181c',scale:isIOS()?1.3:1.7,useCORS:true,allowTaint:false,
       windowWidth:1200,scrollX:0,scrollY:0,
       onclone:doc=>{
         const area=doc.getElementById('exportArea');
         area.style.width='900px';area.style.maxWidth='none';area.style.boxSizing='border-box';
         area.style.padding='30px';
         const grid=doc.getElementById('posterGrid');grid.style.gridTemplateColumns='repeat(5,minmax(0,1fr))';
         const list=doc.querySelector('.text-ranking ol');if(list)list.style.columns='2';
       }
     });
     const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('JPG encoding failed')),'image/jpeg',0.91));
     const safeTitle=(state.title||'my-top-20').toLowerCase().replace(/[^a-z0-9]+/gi,'-').replace(/^-+|-+$/g,'')||'my-top-20';
     const filename=`${safeTitle}.jpg`;
     // Apple mobile Safari is more reliable with the native Share sheet than a scripted download.
     if(isIOS()&&navigator.share&&navigator.canShare){
       const file=new File([blob],filename,{type:'image/jpeg'});
       if(navigator.canShare({files:[file]})){
         try{await navigator.share({files:[file],title:state.title||'My TOP 20'});return;}
         catch(e){if(e.name==='AbortError')return;}
       }
     }
     if(isIOS())showJpgDialog(blob,filename);
     else{
       const url=URL.createObjectURL(blob);const link=document.createElement('a');
       link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
       setTimeout(()=>URL.revokeObjectURL(url),60000);
       toast(msg('JPG downloaded.','JPG 파일을 저장했어요.'));
     }
   }catch(err){console.error('JPG export failed',err);
     toast(msg('JPG export failed. Some external images may prevent capture.','JPG 저장에 실패했어요. 일부 외부 이미지가 캡처를 막을 수 있어요.'));
   }finally{btn.disabled=false;btn.textContent=msg('🖼 Export JPG','🖼 JPG 저장');}
 }
 $('jpgBtn').addEventListener('click',exportAsJPG);
 $('printBtn').addEventListener('click',()=>window.print());
 try{const saved=JSON.parse(localStorage.getItem(STORE)||'null');if(saved&&Array.isArray(saved.items)){state={title:String(saved.title||'나만의 TOP 20'),description:String(saved.description||''),items:saved.items.slice(0,20)};$('listTitle').value=state.title;$('listDescription').value=state.description}}catch(e){}
 applyLanguage();
})();
