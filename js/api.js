/* Search providers normalize results to {id,title,image,kind,detail}. */
window.RankingAPI = (() => {
  async function getJson(url, signal) {
    let r;
    try { r = await fetch(url, {signal, headers:{Accept:'application/json'}}); }
    catch (e) { if (e.name === 'AbortError') throw e; throw new Error('검색 서비스에 연결하지 못했어요. 인터넷 연결 또는 브라우저 차단 설정을 확인해 주세요.'); }
    if (!r.ok) throw new Error(`검색 API 응답 오류 (HTTP ${r.status})`);
    return r.json();
  }
  async function wikipedia(query, category, signal) {
    const q = category === 'movie' ? `${query} film` : category === 'tv' ? `${query} television series` : category === 'game' ? `${query} video game` : category === 'music' ? `${query} album` : category === 'book' ? `${query} novel` : query;
    const params = new URLSearchParams({action:'query',format:'json',formatversion:'2',origin:'*',generator:'search',gsrsearch:q,gsrnamespace:'0',gsrlimit:'25',prop:'pageimages|pageterms',piprop:'thumbnail',pithumbsize:'400',pilicense:'any',wbptterms:'description'});
    const data = await getJson(`https://en.wikipedia.org/w/api.php?${params}`,signal);
    return (data.query?.pages || []).sort((a,b)=>(a.index||0)-(b.index||0)).map(x=>({
      id:`wikipedia-${x.pageid}`,title:x.title,image:x.thumbnail?.source||'',kind:category==='all'?'other':category,
      detail:x.terms?.description?.[0] || 'Wikipedia'
    }));
  }
  async function books(query,signal) {
    const data = await getJson(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=25&fields=key,title,author_name,first_publish_year,cover_i`,signal);
    return (data.docs||[]).map(x=>({id:`openlibrary-${x.key}`,title:x.title||'제목 없음',image:x.cover_i?`https://covers.openlibrary.org/b/id/${x.cover_i}-M.jpg`:'',kind:'book',detail:[x.author_name?.[0],x.first_publish_year].filter(Boolean).join(' · ')}));
  }
  async function search(query,category,signal) {
    // Wikipedia supports anonymous browser CORS with origin=* and covers all categories.
    // Use Wikipedia for general searches, with optional Open Library book lookup.
    if (category==='book') {
      try { const found=await books(query,signal); if(found.length) return found; } catch(e) {if(e.name==='AbortError')throw e;}
      return wikipedia(query,'book',signal);
    }
    return wikipedia(query,category,signal);
  }
  return {search};
})();
