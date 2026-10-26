/* TOP RANKING: Wikipedia search + TVmaze image fallback for TV series; Jikan for anime. */
window.RankingAPI = (() => {
  async function getJson(url, signal) {
    let response;
    try {
      response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
    } catch (error) {
      if (error.name === 'AbortError') throw error;
      throw new Error('검색 서비스에 연결하지 못했어요. 인터넷 연결 또는 브라우저 차단 설정을 확인해 주세요.');
    }
    if (!response.ok) throw new Error(`검색 API 응답 오류 (HTTP ${response.status})`);
    return response.json();
  }

  const normalize = text => String(text || '')
    .normalize('NFKD').toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\b(television|tv|series|season|show)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ').trim();

  const baseTitle = title => String(title || '').replace(/\s*\([^)]*\)\s*/g, ' ').trim();
  const isTvPage = item => /\b(tv|television|sitcom|series|miniseries|soap opera|drama series|web series)\b/i.test(
    `${item.title} ${item.detail}`
  );

  // Never assign unrelated artwork based only on a vaguely similar title.
  function chooseShow(item, tvResults) {
    const title = normalize(baseTitle(item.title));
    const matches = tvResults.filter(entry =>
      normalize(entry?.show?.name) === title &&
      (entry.show.image?.medium || entry.show.image?.original)
    );
    if (!matches.length) return null;

    // Different shows can have the same title. Prefer a matching Wikipedia year,
    // and respect American/British qualifiers where available.
    const year = (item.title.match(/\b(19|20)\d{2}\b/) || [])[0];
    let candidates = matches;
    if (year) {
      const exact = matches.filter(entry => entry.show.premiered?.startsWith(year));
      if (exact.length) candidates = exact;
    }
    const titleLower = item.title.toLowerCase();
    const countryCode = /american|\bu\.s\./.test(titleLower) ? 'US'
      : /british|\bu\.k\./.test(titleLower) ? 'GB' : null;
    if (countryCode) {
      const regional = candidates.filter(entry =>
        (entry.show.network?.country?.code || entry.show.webChannel?.country?.code) === countryCode
      );
      if (regional.length) candidates = regional;
    }
    // API search results come ordered by relevance.
    return candidates[0]?.show || null;
  }

  async function fillMissingTvImages(items, query, signal) {
    const missing = items.filter(item => !item.image && isTvPage(item));
    if (!missing.length) return items;

    const cleanedQuery = baseTitle(query).replace(/\b(tv|television|series|show)\b/gi, '').trim();
    const names = [...new Set([cleanedQuery, ...missing.slice(0, 6).map(item => baseTitle(item.title))])]
      .filter(Boolean).slice(0, 7);

    // One query per distinct title, limited to prevent slowing down searches.
    const batches = await Promise.all(names.map(async name => {
      try {
        const result = await getJson(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(name)}`, signal);
        return Array.isArray(result) ? result : [];
      } catch (error) {
        if (error.name === 'AbortError') throw error;
        return []; // Wikipedia search should still work if TVmaze is unavailable.
      }
    }));
    const shows = batches.flat();
    for (const item of missing) {
      const match = chooseShow(item, shows);
      if (match) item.image = match.image.medium || match.image.original || '';
    }
    return items;
  }

  async function wikipedia(query, category, signal) {
    const q = category === 'movie' ? `${query} film`
      : category === 'tv' ? `${query} television series`
      : category === 'game' ? `${query} video game`
      : category === 'music' ? `${query} album`
      : category === 'book' ? `${query} novel` : query;
    const params = new URLSearchParams({
      action: 'query', format: 'json', formatversion: '2', origin: '*',
      generator: 'search', gsrsearch: q, gsrnamespace: '0', gsrlimit: '25',
      prop: 'pageimages|pageterms', piprop: 'thumbnail', pithumbsize: '400',
      pilicense: 'any', wbptterms: 'description'
    });
    const data = await getJson(`https://en.wikipedia.org/w/api.php?${params}`, signal);
    const items = (data.query?.pages || [])
      .sort((a, b) => (a.index || 0) - (b.index || 0))
      .map(page => ({
        id: `wikipedia-${page.pageid}`, title: page.title,
        image: page.thumbnail?.source || '',
        kind: category === 'all' ? 'other' : category,
        detail: page.terms?.description?.[0] || 'Wikipedia'
      }));
    return fillMissingTvImages(items, query, signal);
  }

  async function books(query, signal) {
    const data = await getJson(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=25&fields=key,title,author_name,first_publish_year,cover_i`, signal);
    return (data.docs || []).map(item => ({
      id: `openlibrary-${item.key}`, title: item.title || '제목 없음',
      image: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : '',
      kind: 'book', detail: [item.author_name?.[0], item.first_publish_year].filter(Boolean).join(' · ')
    }));
  }

  // Anime mode: Tenrai (MyAnimeList catalogue).
  // Reference: https://api.tenrai.org/documentation
  async function anime(query, signal) {
    const url = `https://api.tenrai.org/v1/anime?q=${encodeURIComponent(query)}&limit=25`;
    const payload = await getJson(url, signal);
    return (payload.data || []).map(entry => ({
      id: `jikan-${entry.mal_id}`,
      title: entry.title_english || entry.title || entry.title_japanese || 'Untitled',
      image: entry.images?.jpg?.large_image_url || entry.images?.jpg?.image_url ||
        entry.images?.webp?.large_image_url || entry.images?.webp?.image_url || '',
      kind: 'anime',
      detail: [entry.title_english && entry.title !== entry.title_english ? entry.title : '',
        entry.type || '', entry.year || ''].filter(Boolean).join(' · ')
    }));
  }

  async function search(query, category, signal) {
    if (category === 'anime') return anime(query, signal);
    if (category === 'book') {
      try {
        const found = await books(query, signal);
        if (found.length) return found;
      } catch (error) {
        if (error.name === 'AbortError') throw error;
      }
      return wikipedia(query, 'book', signal);
    }
    return wikipedia(query, category, signal);
  }
  return { search };
})();
