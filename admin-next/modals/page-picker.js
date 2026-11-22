/* Admin2 mounts this component after opening the editor toolbar modal. */
(() => {
  const tag = window.__GRAV_MODAL_TAG || 'grav-internal-links--modal-page-picker';
  if (customElements.get(tag)) return;

  const fallback = {
    SEARCH: 'Search for a page', PLACEHOLDER: 'Title or path', PREVIOUS: 'Previous', NEXT: 'Next', CANCEL: 'Cancel',
    EDITOR_MISSING: 'Original editor not found. Click the button in the editor toolbar and try again.',
    LOADING: 'Loading pages…', INVALID_RESPONSE: 'Invalid API response', PAGE_COUNT: 'Page {page} / {total}',
    CHOOSE_PAGE: 'Choose a page.', NO_PAGES: 'No pages found.', LOAD_ERROR: 'Unable to load pages: {error}',
    CONTENT_CHANGED: 'The content or selection has changed. Close this window and try again.',
  };
  const t = (key, values = {}) => {
    const fullKey = `PLUGIN_INTERNAL_LINKS.${key}`;
    const i18n = window.__GRAV_I18N;
    const text = i18n?.has(fullKey) ? i18n.t(fullKey) : fallback[key];
    return String(text).replace(/\{(\w+)\}/g, (match, name) => String(values[name] ?? match));
  };
  // Toolbar definitions are cached by Admin2, so its label may use the previous locale.
  const toolbarLabels = new Set(['Insérer un lien interne', 'Insert an internal link', 'Insertar un enlace interno']);

  class PagePicker extends HTMLElement {
    connectedCallback() {
      // The modal contract does not expose its originating editor. Only accept
      // the still-focused toolbar button and its own editor wrapper; never guess.
      const button = document.activeElement;
      const toolbar = button instanceof HTMLButtonElement && (this.toolbarLabel ? button.getAttribute('aria-label') === this.toolbarLabel : toolbarLabels.has(button.getAttribute('aria-label'))) ? button.parentElement : null;
      const wrapper = toolbar && toolbar.parentElement;
      const editors = wrapper ? Array.from(wrapper.querySelectorAll(':scope > .markdown-editor-cm > .cm-editor')) : [];
      const editor = editors.length === 1 ? editors[0] : null;
      const view = editor?.__cmView;
      this.view = view && typeof view.dispatch === 'function' && view.state && view.dom === editor ? view : null;
      if (this.view) {
        const { from, to } = this.view.state.selection.main;
        this.snapshot = { from, to, doc: this.view.state.doc.toString() };
      }
      this.page = 1;
      this.sequence = 0;
      this.innerHTML = `<style>
        .il { padding: 1.25rem 1.5rem; color: var(--foreground, inherit); font: inherit; }
        .il input { width:100%; box-sizing:border-box; padding:.55rem .7rem; border:1px solid var(--border, #aaa); border-radius:.4rem; background:transparent; color:inherit; }
        .il ul { list-style:none; padding:0; margin:1rem 0; height:min(45vh, 20rem); overflow:auto; }
        .il li + li { border-top:1px solid var(--border, #ddd); }
        .il .page { display:block; width:100%; text-align:left; padding:.65rem; border:0; background:transparent; color:inherit; cursor:pointer; }
        .il .page:hover, .il .page:focus-visible { background:var(--accent, #eee); }
        .il small { display:block; opacity:.7; overflow-wrap:anywhere; }
        .il footer { display:flex; align-items:center; gap:.75rem; justify-content:flex-end; }
        .il footer button { padding:.45rem .75rem; border:1px solid var(--border, #aaa); border-radius:.4rem; background:transparent; color:inherit; cursor:pointer; }
        .il button:disabled { opacity:.45; cursor:default; }
        .il [role=status] { margin:.75rem 0; }
      </style><div class="il"><label><span data-search></span><input type="search" autocomplete="off"></label><p role="status" aria-live="polite"></p><ul></ul><footer><button type="button" data-prev></button><span data-count></span><button type="button" data-next></button><button type="button" data-cancel></button></footer></div>`;
      this.input = this.querySelector('input');
      this.status = this.querySelector('[role=status]');
      this.list = this.querySelector('ul');
      this.count = this.querySelector('[data-count]');
      this.prev = this.querySelector('[data-prev]');
      this.next = this.querySelector('[data-next]');
      this.querySelector('[data-search]').textContent = t('SEARCH');
      this.input.placeholder = t('PLACEHOLDER');
      this.prev.textContent = t('PREVIOUS');
      this.next.textContent = t('NEXT');
      this.querySelector('[data-cancel]').textContent = t('CANCEL');
      this.querySelector('[data-cancel]').addEventListener('click', () => this.dispatchEvent(new CustomEvent('cancel')));
      this.prev.addEventListener('click', () => { this.page--; this.load(); });
      this.next.addEventListener('click', () => { this.page++; this.load(); });
      this.input.addEventListener('input', () => {
        clearTimeout(this.timer);
        ++this.sequence;
        this.timer = setTimeout(() => { this.page = 1; this.load(); }, 250);
      });
      if (!this.view) {
        this.status.textContent = t('EDITOR_MISSING');
        this.input.disabled = this.prev.disabled = this.next.disabled = true;
        return;
      }
      this.load();
    }

    disconnectedCallback() {
      clearTimeout(this.timer);
      ++this.sequence;
      this.abort?.abort();
    }

    async load() {
      const id = ++this.sequence;
      this.abort?.abort();
      this.abort = new AbortController();
      this.prev.disabled = this.next.disabled = true;
      this.list.replaceChildren();
      this.status.textContent = t('LOADING');
      const params = new URLSearchParams({ page: String(this.page), per_page: '50', sort: 'title', order: 'asc', fields: 'summary' });
      if (this.input.value.trim()) params.set('search', this.input.value.trim());
      const lang = typeof window.__GRAV_CONTENT_LANG === 'string' ? window.__GRAV_CONTENT_LANG : '';
      if (lang) params.set('lang', lang);
      const base = String(window.__GRAV_API_SERVER_URL || '').replace(/\/$/, '');
      const prefix = String(window.__GRAV_API_PREFIX || '/api/v1').replace(/\/$/, '');
      try {
        const options = {
          headers: { Accept: 'application/json', Authorization: `Bearer ${window.__GRAV_API_TOKEN || ''}` },
          signal: this.abort.signal,
        };
        const prefixParams = new URLSearchParams();
        if (lang) prefixParams.set('lang', lang);
        const [response, prefixResponse] = await Promise.all([
          fetch(`${base}${prefix}/pages?${params}`, options),
          fetch(`${base}${prefix}/internal-links/language-prefix?${prefixParams}`, options),
        ]);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!prefixResponse.ok) throw new Error(`HTTP ${prefixResponse.status}`);
        const [result, prefixResult] = await Promise.all([response.json(), prefixResponse.json()]);
        const languagePrefix = prefixResult.data?.prefix;
        if (typeof languagePrefix !== 'string' || (languagePrefix && (!/^\/[A-Za-z0-9_-]+$/.test(languagePrefix)))) throw new Error(t('INVALID_RESPONSE'));
        if (id !== this.sequence || !this.isConnected) return;
        if (!Array.isArray(result.data) || !result.meta?.pagination) throw new Error(t('INVALID_RESPONSE'));
        const pagination = result.meta.pagination;
        this.page = Number(pagination.page);
        const total = Number(pagination.total_pages);
        this.count.textContent = t('PAGE_COUNT', { page: this.page, total: Math.max(1, total) });
        this.prev.disabled = this.page <= 1;
        this.next.disabled = this.page >= total;
        this.status.textContent = result.data.length ? t('CHOOSE_PAGE') : t('NO_PAGES');
        for (const page of result.data) {
          if (typeof page.route !== 'string' || (page.route && !page.route.startsWith('/')) || page.route.startsWith('//')) continue;
          const item = document.createElement('li');
          const pick = document.createElement('button');
          pick.type = 'button';
          pick.className = 'page';
          pick.textContent = String(page.title || page.route || '/');
          const route = document.createElement('small');
          route.textContent = page.route || '/';
          pick.append(route);
          pick.addEventListener('click', () => this.insert(page.route || '/', languagePrefix));
          item.append(pick);
          this.list.append(item);
        }
      } catch (error) {
        if (error.name === 'AbortError' || id !== this.sequence) return;
        this.status.textContent = t('LOAD_ERROR', { error: error.message });
      }
    }

    insert(route, languagePrefix = '') {
      const view = this.view;
      const snapshot = this.snapshot;
      if (!view?.dom.isConnected || view.state.doc.toString() !== snapshot.doc ||
          view.state.selection.main.from !== snapshot.from || view.state.selection.main.to !== snapshot.to) {
        this.status.textContent = t('CONTENT_CHANGED');
        return;
      }
      const selected = view.state.sliceDoc(snapshot.from, snapshot.to);
      // Keep existing Markdown formatting while escaping bare square brackets.
      const label = selected.replace(/(^|[^\\])(\\\\)*([\[\]])/g, '$1$2\\$3');
      const server = String(window.__GRAV_API_SERVER_URL || '');
      let basePath = '';
      try { basePath = new URL(server || '/', window.location.href).pathname.replace(/\/$/, ''); } catch (_) { /* root installation */ }
      const destination = (basePath + languagePrefix + route).replace(/[<>\s\\()]/g, ch => ch === '(' ? '%28' : ch === ')' ? '%29' : encodeURIComponent(ch));
      const markdown = `[${label}](${destination})`;
      view.dispatch({ changes: { from: snapshot.from, to: snapshot.to, insert: markdown }, selection: { anchor: snapshot.from + 1, head: snapshot.from + 1 + label.length } });
      view.focus();
      // No insertContent: Admin2 must not insert a second time.
      this.dispatchEvent(new CustomEvent('resolve', { detail: {} }));
    }
  }
  customElements.define(tag, PagePicker);
})();
