const state = { 
  search: "", 
  platform: "", 
  gender: "", 
  year: "", 
  themes: new Set() 
};

const els = {
  search: document.getElementById("search"),
  platformFilters: document.getElementById("platformFilters"),
  genderFilters: document.getElementById("genderFilters"),
  yearFilters: document.getElementById("yearFilters"),
  themeFilters: document.getElementById("themeFilters"),
  audioList: document.getElementById("audioList"),
  resultCount: document.getElementById("resultCount"),
  emptyState: document.getElementById("emptyState"),
  activeFilters: document.getElementById("activeFilters"),
  clear: document.getElementById("clearFilters"),
  openFilters: document.getElementById("openFilters"),
  closeFilters: document.getElementById("closeFilters"),
  filterBackdrop: document.getElementById("filterBackdrop")
};

const unique = values => [...new Set(values.filter(Boolean))];

const platforms = ["FW", "TBS"];
const genders = unique(AUDIO_DATA.map(x => x.gender)).sort();
const years = unique(AUDIO_DATA.map(x => x.year)).sort((a, b) => Number(b) - Number(a));

const tagFreq = {};
AUDIO_DATA.forEach(item => {
  (item.themes || []).forEach(t => {
    tagFreq[t] = (tagFreq[t] || 0) + 1;
  });
});

const themes = Object.keys(tagFreq)
  .filter(t => tagFreq[t] >= 5)
  .sort((a, b) => tagFreq[b] - tagFreq[a]); 

function chip(label, active, fn) {
  const b = document.createElement("button");
  b.type = "button"; 
  b.className = `chip${active ? " active" : ""}`; 
  b.textContent = label;
  b.addEventListener("click", fn); 
  return b;
}

function renderFilters() {
  if (els.platformFilters) {
    els.platformFilters.replaceChildren(
      chip("All", !state.platform, () => { state.platform = ""; render(); }),
      ...platforms.map(p => chip(p, state.platform === p, () => {
        state.platform = state.platform === p ? "" : p; render();
      }))
    );
  }

  if (els.genderFilters) {
    els.genderFilters.replaceChildren(
      chip("All", !state.gender, () => { state.gender = ""; render(); }),
      ...genders.map(g => chip(g, state.gender === g, () => {
        state.gender = state.gender === g ? "" : g; render();
      }))
    );
  }

  if (els.yearFilters) {
    els.yearFilters.replaceChildren(
      chip("All", !state.year, () => { state.year = ""; render(); }),
      ...years.map(y => chip(y, state.year === y, () => {
        state.year = state.year === y ? "" : y; render();
      }))
    );
  }

  if (els.themeFilters) {
    els.themeFilters.replaceChildren(
      ...themes.map(t => chip(t, state.themes.has(t), () => {
        state.themes.has(t) ? state.themes.delete(t) : state.themes.add(t); 
        render();
      }))
    );
  }
}

function matches(item) {
  const q = state.search.toLowerCase().trim();
  const itemTags = item.themes || [];
  const searchable = [item.title, item.gender, item.year, item.platform, ...itemTags].join(" ").toLowerCase();
  
  return (!q || searchable.includes(q))
    && (!state.platform || item.platform === state.platform)
    && (!state.gender || item.gender === state.gender)
    && (!state.year || item.year === state.year)
    && [...state.themes].every(t => itemTags.includes(t));
}

function renderList() {
  const filtered = AUDIO_DATA.filter(matches);
  if (els.resultCount) {
    els.resultCount.textContent = `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"}`;
  }

  if (!els.audioList) return;

  els.audioList.replaceChildren(...filtered.map(item => {
    const article = document.createElement("article");
    article.className = "audio-entry";
    
    const info = document.createElement("div");
    const title = document.createElement("h2");
    title.className = "audio-title"; 
    title.textContent = item.title;
    
    const meta = document.createElement("div"); 
    meta.className = "meta";
    
    [item.platform, item.gender, item.year].filter(Boolean).forEach(v => {
      const s = document.createElement("span"); 
      s.textContent = v; 
      meta.appendChild(s);
    });

    const tagsContainer = document.createElement("div"); 
    tagsContainer.className = "entry-tags";
    (item.themes || []).forEach(t => {
      const s = document.createElement("span"); 
      s.className = "tag"; 
      s.textContent = t; 
      tagsContainer.appendChild(s);
    });

    info.append(title, meta, tagsContainer);
    
    const link = document.createElement("a");
    link.className = "open-link"; 
    link.href = item.link || "#"; 
    link.target = "_blank";
    link.rel = "noopener noreferrer"; 
    link.textContent = item.link && item.link.startsWith("http") ? "Open ↗" : "Upcoming";

    article.append(info, link); 
    return article;
  }));

  if (els.emptyState) {
    els.emptyState.hidden = filtered.length !== 0;
  }
}

function renderActiveFilters() {
  if (!els.activeFilters) return;
  const activeArr = [];
  if (state.search) activeArr.push(`Search: ${state.search}`);
  if (state.platform) activeArr.push(`Platform: ${state.platform}`);
  if (state.gender) activeArr.push(`Gender: ${state.gender}`);
  if (state.year) activeArr.push(`Year: ${state.year}`);
  state.themes.forEach(t => activeArr.push(`Theme: ${t}`));

  els.activeFilters.replaceChildren(...activeArr.map(text => {
    const s = document.createElement("span"); 
    s.className = "active-filter"; 
    s.textContent = text; 
    return s;
  }));
}

function render() { 
  renderFilters(); 
  renderList(); 
  renderActiveFilters(); 
}

if (els.search) {
  els.search.addEventListener("input", e => { 
    state.search = e.target.value; 
    render(); 
  });
}

if (els.clear) {
  els.clear.addEventListener("click", () => {
    state.search = ""; 
    state.platform = "";
    state.gender = ""; 
    state.year = ""; 
    state.themes.clear(); 
    if (els.search) els.search.value = ""; 
    render();
  });
}

function closeDrawer() { document.body.classList.remove("filters-open"); }
els.openFilters?.addEventListener("click", () => document.body.classList.add("filters-open"));
els.closeFilters?.addEventListener("click", closeDrawer);
els.filterBackdrop?.addEventListener("click", closeDrawer);

render();