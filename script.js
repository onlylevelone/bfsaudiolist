const state = { 
  search: "", 
  platforms: new Set(), 
  genders: new Set(), 
  years: new Set(), 
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

const platforms = ["badfantasy.co", "TheBlackSite"];
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
  .sort((a, b) => a.localeCompare(b)); 

function chip(label, active, fn) {
  const b = document.createElement("button");
  b.type = "button"; 
  b.className = `chip${active ? " active" : ""}`; 
  b.textContent = label;
  b.addEventListener("click", fn); 
  return b;
}

function toggleSetItem(setInstance, item) {
  if (setInstance.has(item)) {
    setInstance.delete(item);
  } else {
    setInstance.add(item);
  }
}

function renderFilters() {
  if (els.platformFilters) {
    els.platformFilters.replaceChildren(
      chip("All", state.platforms.size === 0, () => { state.platforms.clear(); render(); }),
      ...platforms.map(p => chip(p, state.platforms.has(p), () => {
        toggleSetItem(state.platforms, p);
        render();
      }))
    );
  }

  if (els.genderFilters) {
    els.genderFilters.replaceChildren(
      chip("All", state.genders.size === 0, () => { state.genders.clear(); render(); }),
      ...genders.map(g => chip(g, state.genders.has(g), () => {
        toggleSetItem(state.genders, g);
        render();
      }))
    );
  }

  if (els.yearFilters) {
    els.yearFilters.replaceChildren(
      chip("All", state.years.size === 0, () => { state.years.clear(); render(); }),
      ...years.map(y => chip(y, state.years.has(y), () => {
        toggleSetItem(state.years, y);
        render();
      }))
    );
  }

  if (els.themeFilters) {
    els.themeFilters.replaceChildren(
      ...themes.map(t => chip(t, state.themes.has(t), () => {
        toggleSetItem(state.themes, t);
        render();
      }))
    );
  }
}

function matches(item) {
  const q = state.search.toLowerCase().trim();
  const itemTags = item.themes || [];
  const searchable = [item.title, item.gender, item.year, item.platform, ...itemTags].join(" ").toLowerCase();
  
  const matchesSearch = !q || searchable.includes(q);
  const matchesPlatform = state.platforms.size === 0 || state.platforms.has(item.platform);
  const matchesGender = state.genders.size === 0 || state.genders.has(item.gender);
  const matchesYear = state.years.size === 0 || state.years.has(item.year);
  const matchesThemes = [...state.themes].every(t => itemTags.includes(t));

  return matchesSearch && matchesPlatform && matchesGender && matchesYear && matchesThemes;
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
  state.platforms.forEach(p => activeArr.push(`Platform: ${p}`));
  state.genders.forEach(g => activeArr.push(`Gender: ${g}`));
  state.years.forEach(y => activeArr.push(`Year: ${y}`));
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
    state.platforms.clear();
    state.genders.clear(); 
    state.years.clear(); 
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

const dropdown = document.querySelector(".platform-dropdown");
const trigger = document.querySelector(".dropdown-trigger");

if (trigger && dropdown) {
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("open");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("open");
    }
  });
}