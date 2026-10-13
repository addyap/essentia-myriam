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
    } else {
      await load('https://cdn.jsdelivr.net/npm/netlify-identity-widget@2.0.3/build/netlify-identity-widget.js');
      window.netlifyIdentity.init({ APIUrl: data.config.backend.identity_url, locale: 'fr', logo: false });
      window.netlifyIdentity.setLocale('fr');
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
        async getEntry(path) { return {file:{path,id:path},data:files[path]}; }
        async persistEntry(entry) {
          for (const file of entry.dataFiles) {
            if (!Object.hasOwn(files, file.path) || file.newPath && file.newPath !== file.path) throw new Error('Fichier non autorisé dans la démonstration.');
            files[file.path] = file.raw;
          }
        }
        async getMedia() { return []; }
        async getDeployPreview() { return null; }
      }
      window.CMS.registerBackend('essentia-demo', DemoBackend);
    }
    for (const collection of data.config.collections) for (const file of collection.files) {
      const section = file.name;
      const page = ['home', 'about', 'coaching', 'rh', 'booking', 'contact', 'resources'].includes(section) ? section : 'home';
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
        send() { if (this.frame && this.nonce) this.frame.contentWindow.postMessage({ type: 'essentia-cms-preview', nonce: this.nonce, section, content: this.props.entry.get('data').toJS() }, origin); },
        render() { return window.h('iframe', { ref: el => { this.frame = el; }, onLoad: () => this.send(), title: 'Aperçu français du site', src: origin + '/cms-preview?page=' + page + '&nonce=' + (this.nonce || ''), style: { width: '100%', height: '100vh', border: 0 } }); },
      });
      window.CMS.registerPreviewTemplate(section, Preview);
    }
    await window.CMS.init({ config: data.config });
    if (!data.demoFiles) window.netlifyIdentity.setLocale('fr');
    status.hidden = true;
    if (data.demoFiles) { const banner = document.createElement('p'); banner.textContent = 'Démonstration : les modifications restent dans ce navigateur et ne sont jamais publiées.'; banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;margin:0;padding:8px;z-index:999;background:#26382e;color:white;text-align:center'; document.body.appendChild(banner); }
  } catch {
    status.hidden = false; message.textContent = 'L’éditeur n’a pas pu être chargé. Vérifiez votre connexion puis rechargez la page.';
  }
})();
