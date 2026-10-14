/* Pinned official Decap distributions load only inside the editor. */
(async () => {
  const message = document.getElementById('cms-message');
  const status = document.getElementById('cms-status');
  const origin = location.origin;
  function load(src) { return new Promise((resolve, reject) => { const script = document.createElement('script'); script.src = src; script.onload = resolve; script.onerror = reject; document.head.appendChild(script); }); }
  try {
    const demo = new URLSearchParams(location.search).get('demo') === '1';
    const response = await fetch('/api/cms-config' + (demo ? '?demo=1' : ''), { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok) { message.textContent = data.error; return; }
    window.CMS_MANUAL_INIT = true;
    if (data.demoFiles) {
      window.repoFiles = {};
      for (const [path, content] of Object.entries(data.demoFiles)) {
        const parts = path.split('/'); let tree = window.repoFiles;
        while (parts.length > 1) { const key = parts.shift(); tree = tree[key] || (tree[key] = {}); }
        tree[parts[0]] = { path, content };
      }
    }
    await load('https://cdn.jsdelivr.net/npm/decap-cms@3.16.3/dist/decap-cms.js');
    if (data.demoFiles) {
      // Deliberately isolated: no network mutations, gateway, token or persistent storage.
      const files = { ...data.demoFiles };
      class DemoBackend {
        authComponent() { return window.createClass({render() { return window.h('button', {onClick: () => this.props.onLogin(), style:{padding:'16px',margin:'30px'}}, 'Entrer dans la démonstration'); }}); }
        isGitBackend() { return false; }
        async status() { return {auth:{status:true},api:{status:true}}; }
        async restoreUser() { return {name:'Démonstration',email:'demo@example.invalid'}; }
        async authenticate() { return this.restoreUser(); }
        async logout() {}
        async getToken() { return ''; }
        async entriesByFiles(entries) { return entries.map(file => ({file,data:files[file.path]})); }
        async entriesByFolder(folder, extension) { return Object.keys(files).filter(path => path.startsWith(folder + '/') && path.endsWith('.' + extension)).map(path => ({file:{path,id:path},data:files[path]})); }
        async allEntriesByFolder(folder, extension) { return this.entriesByFolder(folder, extension); }
        async getEntry(path) { return {file:{path,id:path},data:files[path]}; }
        async persistEntry(entry) {
          for (const file of entry.dataFiles) {
            // Existing pages may change; new files are allowed only as blog articles.
            const article = path => /^content\/blog\/[A-Za-z0-9][A-Za-z0-9._~-]*\.json$/.test(path || '');
            if (!(Object.hasOwn(files, file.path) || article(file.path)) || file.newPath && file.newPath !== file.path && !article(file.newPath)) throw new Error('Fichier non autorisé dans la démonstration.');
            if (file.newPath && file.newPath !== file.path) delete files[file.path];
            files[file.newPath || file.path] = file.raw;
          }
        }
        async deleteFiles(paths) { for (const path of paths) if (path.startsWith('content/blog/')) delete files[path]; }
        // Pictures chosen in the demonstration stay in this browser tab only.
        async persistMedia(file) { const displayURL = URL.createObjectURL(file.fileObj); return { id: file.path, name: file.fileObj.name, path: file.path, displayURL, size: file.fileObj.size }; }
        async getMediaDisplayURL(displayURL) { return displayURL; }
        async getMedia() { return []; }
        async getDeployPreview() { return null; }
      }
      window.CMS.registerBackend('essentia-demo', DemoBackend);
    }
    // Each preview is the real page in a frame, fed the draft through postMessage.
    // Articles ("posts") and the article labels ("blog") preview on an article page.
    const previews = [['posts', 'article'], ...data.config.collections.flatMap(collection => (collection.files || []).map(file => [file.name,
      file.name === 'blog' ? 'article' : ['home', 'about', 'coaching', 'rh', 'booking', 'contact', 'resources', 'podcast'].includes(file.name) ? file.name : 'home']))];
    // Pictures not yet published exist only in the editor; give the preview their temporary address.
    const asset = (getAsset, path) => {
      if (!path) return path;
      try { const proxy = getAsset(path); return proxy && typeof proxy.then !== 'function' && String(proxy) || path; } catch { return path; }
    };
    const draft = (section, props) => {
      const content = props.entry.get('data').toJS();
      if (section !== 'posts') return content;
      return { ...content, image: asset(props.getAsset, content.image), body: String(content.body || '').replace(/(!\[[^\]]*\]\()([^)\s]+)/g, (all, start, path) => start + asset(props.getAsset, path)) };
    };
    for (const [section, page] of previews) {
      const Preview = window.createClass({
        componentDidMount() {
          this.nonce = crypto.randomUUID();
          this.receiveReady = event => {
            if (event.origin === origin && event.source === this.frame?.contentWindow && event.data?.type === 'essentia-cms-preview-ready' && event.data.nonce === this.nonce) this.send();
          };
          window.addEventListener('message', this.receiveReady); this.forceUpdate();
        },
        componentWillUnmount() { window.removeEventListener('message', this.receiveReady); },
        componentDidUpdate() { this.send(); },
        send() { if (this.frame && this.nonce) this.frame.contentWindow.postMessage({ type: 'essentia-cms-preview', nonce: this.nonce, section, content: draft(section, this.props) }, origin); },
        render() { return window.h('iframe', { ref: el => { this.frame = el; }, onLoad: () => this.send(), title: 'Aperçu français du site', src: origin + '/cms-preview?page=' + page + '&nonce=' + (this.nonce || ''), style: { width: '100%', height: '100vh', border: 0 } }); },
      });
      window.CMS.registerPreviewTemplate(section, Preview);
    }
    await window.CMS.init({ config: data.config });
    status.hidden = true;
    if (data.demoFiles) { const banner = document.createElement('p'); banner.textContent = 'Démonstration : les modifications restent dans ce navigateur et ne sont jamais publiées.'; banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;margin:0;padding:8px;z-index:999;background:#26382e;color:white;text-align:center'; document.body.appendChild(banner); }
  } catch {
    status.hidden = false; message.textContent = 'L’éditeur n’a pas pu être chargé. Vérifiez votre connexion puis rechargez la page.';
  }
})();
