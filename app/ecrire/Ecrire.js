'use client';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  STORAGE_KEY, SETTINGS_KEY, DAILY_KEY, THEMES, FONTS, SIZES, DEFAULT_SETTINGS, PROMPTS,
  newId, countWords, dailyProgress, isWebLink, safeFileName, readSettings, readLibrary, mergeLibraries,
  encodeShare, decodeShare,
} from '@/lib/ecrire';
import { sanitizeHtml, editorHtml, htmlToText, htmlToMarkdown, quoteHtml, shrinkImage, download } from '@/lib/ecrire-dom';

// Myriam's private writing page. Every text stays in this browser's storage:
// nothing is sent to the site's server, so the page has no account or login.

const read = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const welcome = () => ({
  id: newId(),
  title: 'Bienvenue, Myriam',
  html: '<p>Cet espace est le vôtre, pour écrire, réfléchir et préparer vos textes.</p>'
    + '<p>Chaque mot est <b>enregistré automatiquement dans ce navigateur</b>, sur cet appareil. Rien n’est envoyé sur internet : personne d’autre ne peut lire vos textes, même avec l’adresse de cette page.</p>'
    + '<p>Pensez à télécharger de temps en temps une sauvegarde (dans « Mes textes ») : si l’historique du navigateur est effacé, elle vous permet de tout retrouver.</p>',
  words: null,
  updatedAt: Date.now(),
  sources: [],
});
const blank = () => ({ id: newId(), title: '', html: '<p><br></p>', words: 0, updatedAt: Date.now(), sources: [] });

const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
const ICONS = {
  texts: <><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z" /><path d="M4 19a2 2 0 0 1 2-2h12M8 7h6M8 11h6" /></>,
  sources: <path d="m20 11-8.5 8.5a5 5 0 0 1-7-7L13 4a3.3 3.3 0 0 1 4.7 4.7l-8.6 8.6a1.7 1.7 0 0 1-2.4-2.4L14.5 7" />,
  sound: <><path d="M3 14v-2a9 9 0 0 1 18 0v2" /><rect x="3" y="14" width="4" height="7" rx="1.5" /><rect x="17" y="14" width="4" height="7" rx="1.5" /></>,
  style: <><circle cx="12" cy="12" r="9" /><circle cx="8" cy="10" r="1.2" /><circle cx="12" cy="7.5" r="1.2" /><circle cx="16" cy="10" r="1.2" /><path d="M12 21a2.5 2.5 0 0 1 0-5h2a3 3 0 0 0 3-3" /></>,
  share: <><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  down: <><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></>,
  up: <><path d="M12 15V4M7 9l5-5 5 5M5 20h14" /></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /></>,
  numbers: <><path d="M10 6h10M10 12h10M10 18h10M4 4.5h1.5V9M4 9h3M4 14.5c.5-.7 2.8-.9 2.8.6 0 1-2.8 2-2.8 3.4h3" /></>,
  quote: <path d="M5 17c-1-1.5-1-5 .5-7.5S9 6 10 6M14 17c-1-1.5-1-5 .5-7.5S18 6 19 6M5 17a2.5 2.5 0 1 0 0-.1M14 17a2.5 2.5 0 1 0 0-.1" />,
  spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" /></>,
  file: <><path d="M14 3H6v18h12V7z" /><path d="M14 3v4h4M9 13h6M9 17h6" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>,
};
function Svg({ name }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false" {...P}>{ICONS[name]}</svg>;
}

function Panel({ open, onClose, side = 'center', title, children }) {
  const ref = useRef(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  return (
    <dialog ref={ref} className={`ec-panel ec-panel--${side}`} aria-labelledby={id} onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className="ec-panel-inner">
        <div className="ec-panel-head">
          <h2 id={id}>{title}</h2>
          <button type="button" className="ec-icon" onClick={onClose} aria-label="Fermer"><Svg name="close" /></button>
        </div>
        <div className="ec-panel-body">{children}</div>
      </div>
    </dialog>
  );
}

// ---- Ambient sound, made in the browser (no audio files to download).
function startSound(kind, volume) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const gain = ctx.createGain();
  gain.gain.value = 0;
  gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.6);
  gain.connect(ctx.destination);
  const nodes = [];
  if (kind === 'pluie') {
    // Pink noise through a soft filter sounds like steady rain.
    const length = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852; b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2200;
    source.connect(filter).connect(gain);
    source.start();
    nodes.push(source);
  } else {
    // Two close tones, one per ear: a gentle 7 Hz beat, best with headphones.
    const merger = ctx.createChannelMerger(2);
    [200, 207].forEach((frequency, channel) => {
      const osc = ctx.createOscillator();
      osc.frequency.value = frequency;
      osc.connect(merger, 0, channel);
      osc.start();
      nodes.push(osc);
    });
    const soft = ctx.createGain();
    soft.gain.value = 0.35;
    merger.connect(soft).connect(gain);
  }
  return {
    kind,
    setVolume: (v) => gain.gain.setTargetAtTime(v, ctx.currentTime, 0.2),
    stop: () => {
      gain.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
      setTimeout(() => { nodes.forEach((n) => { try { n.stop(); } catch {} }); ctx.close(); }, 900);
    },
  };
}

export function Ecrire() {
  const [ready, setReady] = useState(false);
  const [docs, setDocs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [daily, setDaily] = useState(null);
  const [status, setStatus] = useState('saved');
  const [panel, setPanel] = useState(null);
  const [incoming, setIncoming] = useState(null);
  const [toast, setToast] = useState('');
  const [zen, setZen] = useState(false);
  const [formats, setFormats] = useState({});
  const [sound, setSound] = useState(null);
  const [volume, setVolume] = useState(0.3);
  const [shareLink, setShareLink] = useState('');
  const [note, setNote] = useState('');

  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const docsRef = useRef(docs);
  const activeRef = useRef(activeId);
  const soundRef = useRef(null);
  const saveTimer = useRef(null);
  const zenTimer = useRef(null);
  const focusTitle = useRef(false);
  docsRef.current = docs;
  activeRef.current = activeId;

  const active = docs.find((d) => d.id === activeId) || docs[0];
  const sorted = useMemo(() => [...docs].sort((a, b) => b.updatedAt - a.updatedAt), [docs]);
  const total = useMemo(() => docs.reduce((sum, d) => sum + (d.words || 0), 0), [docs]);
  const today = dailyProgress(daily, total);
  const goalPercent = Math.min(100, Math.round((today.written / settings.goal) * 100));

  const say = useCallback((message) => setToast(message), []);
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // ---- Load once, in the browser.
  const loadLibrary = useCallback(() => {
    const library = readLibrary(read(STORAGE_KEY));
    const list = (library?.docs.length ? library.docs : [welcome()]).map((d) => (d.words == null ? { ...d, words: countWords(htmlToText(d.html)) } : d));
    return { docs: list, activeId: library?.docs.length ? library.activeId : list[0].id };
  }, []);

  useEffect(() => {
    const library = loadLibrary();
    setDocs(library.docs);
    setActiveId(library.activeId);
    setSettings(readSettings(read(SETTINGS_KEY)));
    setDaily(read(DAILY_KEY));
    setReady(true);
    const match = window.location.hash.match(/^#t=([\w-]+)$/);
    if (window.location.hash) history.replaceState(null, '', window.location.pathname);
    if (match) decodeShare(match[1]).then((shared) => (shared ? setIncoming(shared) : say('Ce lien de transfert est incomplet ou abîmé.')));
  }, [loadLibrary, say]);

  // ---- Save: shortly after each change, and straight away when leaving.
  const flush = useCallback(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = null;
    try {
      write(STORAGE_KEY, { version: 1, activeId: activeRef.current, docs: docsRef.current });
      setStatus('saved');
    } catch {
      setStatus('full');
    }
  }, []);
  useEffect(() => {
    if (!ready) return;
    setStatus((s) => (s === 'full' ? s : 'saving'));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(flush, 400);
  }, [docs, activeId, ready, flush]);
  useEffect(() => {
    const leave = () => { if (saveTimer.current) flush(); };
    window.addEventListener('pagehide', leave);
    document.addEventListener('visibilitychange', leave);
    return () => { window.removeEventListener('pagehide', leave); document.removeEventListener('visibilitychange', leave); };
  }, [flush]);
  useEffect(() => { if (ready) try { write(SETTINGS_KEY, settings); } catch {} }, [settings, ready]);
  useEffect(() => {
    if (!ready || today.daily === daily) return;
    setDaily(today.daily);
    try { write(DAILY_KEY, today.daily); } catch {}
  }, [ready, today.daily, daily]);

  // The same page open in another tab: show its latest texts here too.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      const library = loadLibrary();
      setDocs(library.docs);
      const current = library.docs.find((d) => d.id === activeRef.current);
      if (!current) setActiveId(library.activeId);
      else if (editorRef.current && editorRef.current.innerHTML !== current.html) editorRef.current.innerHTML = sanitizeHtml(current.html);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadLibrary]);

  // ---- Put the chosen text in the editor (always cleaned first).
  useEffect(() => {
    if (!ready || !editorRef.current) return;
    const doc = docsRef.current.find((d) => d.id === activeId);
    editorRef.current.innerHTML = sanitizeHtml(doc?.html || '') || '<p><br></p>';
  }, [ready, activeId]);

  const updateActive = useCallback((patch) => {
    setDocs((list) => list.map((d) => (d.id === activeRef.current ? { ...d, ...patch, updatedAt: Date.now() } : d)));
  }, []);

  const onEditorInput = useCallback(() => {
    const editor = editorRef.current;
    updateActive({ html: editorHtml(editor), words: countWords(editor.innerText) });
  }, [updateActive]);

  // Pasted text keeps simple formatting only; dropped content arrives as plain text.
  const onPaste = (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    if (html) document.execCommand('insertHTML', false, sanitizeHtml(html));
    else document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
  };
  const onDrop = (e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (!text) return;
    let range = document.caretRangeFromPoint?.(e.clientX, e.clientY);
    if (!range && document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
      if (pos) { range = document.createRange(); range.setStart(pos.offsetNode, pos.offset); }
    }
    if (range && editorRef.current.contains(range.startContainer)) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    document.execCommand('insertText', false, text);
  };

  // ---- Formatting toolbar.
  useEffect(() => {
    const update = () => {
      const node = window.getSelection()?.anchorNode;
      if (!node || !editorRef.current?.contains(node)) return;
      setFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        ul: document.queryCommandState('insertUnorderedList'),
        ol: document.queryCommandState('insertOrderedList'),
        block: String(document.queryCommandValue('formatBlock') || '').toLowerCase(),
      });
    };
    document.addEventListener('selectionchange', update);
    return () => document.removeEventListener('selectionchange', update);
  }, []);

  const focusEditor = () => {
    const editor = editorRef.current;
    if (editor.contains(window.getSelection()?.anchorNode)) return;
    editor.focus();
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
  };
  const run = (command, value) => {
    focusEditor();
    document.execCommand('defaultParagraphSeparator', false, 'p');
    if (command === 'formatBlock') document.execCommand('formatBlock', false, formats.block === value ? 'p' : value);
    else document.execCommand(command, false, value);
    onEditorInput();
  };
  const spark = () => {
    focusEditor();
    const prompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    document.execCommand('insertHTML', false, quoteHtml('Étincelle :', prompt));
    onEditorInput();
  };
  const keep = (e) => e.preventDefault(); // keep the selection when clicking a tool

  // ---- Calm mode: the controls fade while typing, and return on any movement.
  const onEditorKey = () => {
    clearTimeout(zenTimer.current);
    zenTimer.current = setTimeout(() => {
      if (document.activeElement === editorRef.current) setZen(true);
    }, 4000);
  };
  useEffect(() => {
    if (!zen) return undefined;
    const wake = () => setZen(false);
    window.addEventListener('pointermove', wake, { once: true });
    window.addEventListener('pointerdown', wake, { once: true });
    return () => { window.removeEventListener('pointermove', wake); window.removeEventListener('pointerdown', wake); };
  }, [zen]);
  useEffect(() => () => clearTimeout(zenTimer.current), []);

  // ---- Texts.
  const createDoc = () => {
    const doc = blank();
    setDocs((list) => [doc, ...list]);
    setActiveId(doc.id);
    setPanel(null);
    focusTitle.current = true;
  };
  // Runs after the panel has closed and handed focus back, so the title keeps it.
  useEffect(() => {
    if (panel || !focusTitle.current) return;
    focusTitle.current = false;
    titleRef.current?.focus();
  }, [panel, activeId]);
  const openDoc = (id) => { setActiveId(id); setPanel(null); };
  const deleteDoc = (doc) => {
    if (!window.confirm(`Supprimer « ${doc.title || 'Sans titre'} » ? Ce texte ne pourra pas être récupéré, sauf depuis une sauvegarde.`)) return;
    const rest = docs.filter((d) => d.id !== doc.id);
    const next = rest.length ? rest : [blank()];
    setDocs(next);
    if (doc.id === activeId) setActiveId([...next].sort((a, b) => b.updatedAt - a.updatedAt)[0].id);
  };
  const exportMarkdown = () => {
    download(`${safeFileName(active.title)}.md`, 'text/markdown;charset=utf-8', htmlToMarkdown(active.title, active.html));
  };
  const exportBackup = () => {
    flush();
    download(`ecrire-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`, 'application/json', JSON.stringify({ version: 1, savedAt: new Date().toISOString(), docs }, null, 2));
  };
  const restoreBackup = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    let library = null;
    try { library = readLibrary(JSON.parse(await file.text())); } catch {}
    if (!library || !library.docs.length) { say('Ce fichier n’est pas une sauvegarde de vos textes.'); return; }
    const restored = library.docs.map((d) => ({ ...d, html: sanitizeHtml(d.html), words: d.words ?? countWords(htmlToText(d.html)) }));
    setDocs((list) => mergeLibraries(list, restored));
    say(`${restored.length} texte${restored.length > 1 ? 's' : ''} ajouté${restored.length > 1 ? 's' : ''} depuis la sauvegarde.`);
  };

  // ---- Sources for the current text.
  const addSources = (items) => updateActive({ sources: [...(active.sources || []), ...items] });
  const onSourceFiles = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    const added = [];
    for (const file of files) {
      try {
        if (/^image\/(jpeg|png|webp|gif|heic|heif)$/.test(file.type)) {
          added.push({ id: newId('s'), type: 'image', name: file.name, data: await shrinkImage(file) });
        } else if (/^text\//.test(file.type) || /\.(txt|md|csv)$/i.test(file.name)) {
          if (file.size > 300_000) { say(`« ${file.name} » est trop long pour être gardé ici.`); continue; }
          added.push({ id: newId('s'), type: 'text', name: file.name, data: await file.text() });
        } else {
          say(`« ${file.name} » : seuls les photos et les fichiers texte peuvent être ajoutés.`);
        }
      } catch {
        say(`« ${file.name} » n’a pas pu être lu.`);
      }
    }
    if (added.length) addSources(added);
  };
  const addNote = (e) => {
    e.preventDefault();
    const text = note.trim();
    if (!text) return;
    addSources([{ id: newId('s'), type: 'note', name: text.length > 40 ? `${text.slice(0, 40)}…` : text, data: text }]);
    setNote('');
  };
  const removeSource = (id) => updateActive({ sources: active.sources.filter((s) => s.id !== id) });

  // ---- Sound.
  const toggleSound = (kind) => {
    soundRef.current?.stop();
    if (soundRef.current?.kind === kind) { soundRef.current = null; setSound(null); return; }
    try {
      soundRef.current = startSound(kind, volume);
      setSound(kind);
    } catch {
      soundRef.current = null;
      say('Le son n’est pas disponible dans ce navigateur.');
    }
  };
  const changeVolume = (v) => { setVolume(v); soundRef.current?.setVolume(v); };
  useEffect(() => () => soundRef.current?.stop(), []);

  // ---- Transfer link.
  const makeLink = async () => {
    try {
      const code = await encodeShare({ title: active.title, html: sanitizeHtml(active.html) });
      setShareLink(`${window.location.origin}${window.location.pathname}#t=${code}`);
    } catch {
      say('Le lien n’a pas pu être créé dans ce navigateur.');
    }
  };
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareLink); say('Lien copié.'); } catch { say('Sélectionnez le lien et copiez-le.'); }
  };
  const acceptIncoming = () => {
    const doc = { ...blank(), title: incoming.title || 'Texte transmis', html: sanitizeHtml(incoming.html) };
    doc.words = countWords(htmlToText(doc.html));
    setDocs((list) => [doc, ...list]);
    setActiveId(doc.id);
    setIncoming(null);
  };

  const statusText = { saved: 'Enregistré sur cet appareil', saving: 'Enregistrement…', full: 'Espace plein : téléchargez une sauvegarde et retirez des photos' }[status];
  const tool = (label, on, onClick, children) => (
    <button type="button" className={`ec-tool${on ? ' is-on' : ''}`} aria-pressed={on ? 'true' : 'false'} aria-label={label} title={label} onMouseDown={keep} onClick={onClick}>{children}</button>
  );

  return (
    <div className={`ecrire${zen ? ' is-zen' : ''}`} data-theme={settings.theme} data-font={settings.font} data-size={settings.size} lang="fr">
      <header className="ec-bar ec-fade">
        <button type="button" className="ec-btn" onClick={() => setPanel('library')}><Svg name="texts" /><span>Mes textes</span></button>
        <div className="ec-brand">
          <img src="/logo.webp" alt="" width="26" height="34" />
          <h1>Écrire</h1>
        </div>
        <div className="ec-actions">
          <button type="button" className="ec-btn" onClick={() => setPanel('sources')} aria-label={`Sources (${active?.sources?.length || 0})`}>
            <Svg name="sources" /><span>Sources</span>{active?.sources?.length ? <em className="ec-count">{active.sources.length}</em> : null}
          </button>
          <button type="button" className={`ec-btn${sound ? ' is-on' : ''}`} onClick={() => setPanel('sound')} aria-label="Ambiance sonore"><Svg name="sound" /><span>Ambiance</span></button>
          <button type="button" className="ec-btn" onClick={() => setPanel('style')} aria-label="Apparence"><Svg name="style" /><span>Apparence</span></button>
          <button type="button" className="ec-btn" onClick={() => { setShareLink(''); setPanel('share'); }} aria-label="Transférer ce texte"><Svg name="share" /><span>Transférer</span></button>
        </div>
      </header>

      <div className="ec-page">
        <div className="ec-toolbar ec-fade" role="toolbar" aria-label="Mise en forme">
          <div className="ec-group">
            {tool('Gras', formats.bold, () => run('bold'), <b>G</b>)}
            {tool('Italique', formats.italic, () => run('italic'), <i>I</i>)}
            {tool('Souligné', formats.underline, () => run('underline'), <u>S</u>)}
            <span className="ec-sep" />
            {tool('Titre', formats.block === 'h2', () => run('formatBlock', 'h2'), <span className="ec-h">T</span>)}
            {tool('Sous-titre', formats.block === 'h3', () => run('formatBlock', 'h3'), <span className="ec-h ec-h--small">T</span>)}
            {tool('Citation', formats.block === 'blockquote', () => run('formatBlock', 'blockquote'), <Svg name="quote" />)}
            {tool('Liste à puces', formats.ul, () => run('insertUnorderedList'), <Svg name="list" />)}
            {tool('Liste numérotée', formats.ol, () => run('insertOrderedList'), <Svg name="numbers" />)}
          </div>
          <div className="ec-group">
            <button type="button" className="ec-tool ec-tool--word" onMouseDown={keep} onClick={spark} title="Ajouter une question pour vous inspirer"><Svg name="spark" /><span>Étincelle</span></button>
            <button type="button" className="ec-tool" onClick={exportMarkdown} aria-label="Télécharger ce texte" title="Télécharger ce texte (.md)"><Svg name="down" /></button>
          </div>
        </div>

        <div className="ec-sheet">
          <label htmlFor="ec-title" className="sr-only">Titre du texte</label>
          <input id="ec-title" ref={titleRef} className="ec-title" type="text" placeholder="Titre" value={active?.title || ''} disabled={!ready}
            onChange={(e) => updateActive({ title: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); editorRef.current.focus(); } }} />
          <div ref={editorRef} className="ec-editor" contentEditable={ready} suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Votre texte"
            data-placeholder="Commencez à écrire…" spellCheck="true"
            onInput={onEditorInput} onPaste={onPaste} onDrop={onDrop} onKeyDown={onEditorKey}
            onFocus={() => document.execCommand('defaultParagraphSeparator', false, 'p')} />
        </div>
      </div>

      <footer className="ec-foot ec-fade">
        <span className={`ec-status ec-status--${status}`} role="status"><i aria-hidden="true" />{statusText}</span>
        <span className="ec-words">{active?.words || 0} mot{(active?.words || 0) > 1 ? 's' : ''}</span>
        <span className="ec-goal" title={`Mots écrits aujourd’hui, tous textes confondus`}>
          <span>Aujourd’hui {today.written} / {settings.goal}</span>
          <span className="ec-meter" aria-hidden="true"><span style={{ width: `${goalPercent}%` }} /></span>
        </span>
      </footer>

      <div className="ec-toast" role="status" aria-live="polite">{toast ? <p>{toast}</p> : null}</div>

      <Panel open={panel === 'library'} onClose={() => setPanel(null)} side="left" title="Mes textes">
        <button type="button" className="ec-primary" onClick={createDoc}><Svg name="plus" />Nouveau texte</button>
        <ul className="ec-docs">
          {sorted.map((doc) => (
            <li key={doc.id} className={doc.id === activeId ? 'is-active' : ''}>
              <button type="button" className="ec-doc" onClick={() => openDoc(doc.id)} aria-current={doc.id === activeId ? 'true' : undefined}>
                <strong>{doc.title || 'Sans titre'}</strong>
                <small>{doc.words || 0} mots · {new Date(doc.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</small>
              </button>
              <button type="button" className="ec-icon" onClick={() => deleteDoc(doc)} aria-label={`Supprimer « ${doc.title || 'Sans titre'} »`}><Svg name="trash" /></button>
            </li>
          ))}
        </ul>
        <div className="ec-backup">
          <h3>Sauvegarde</h3>
          <p>Vos textes restent dans ce navigateur, sur cet appareil. Téléchargez une sauvegarde de temps en temps, et pour retrouver vos textes sur un autre appareil.</p>
          <div className="ec-row">
            <button type="button" className="ec-secondary" onClick={exportBackup}><Svg name="down" />Télécharger</button>
            <label className="ec-secondary"><Svg name="up" />Restaurer<input type="file" accept=".json,application/json" onChange={restoreBackup} className="sr-only" /></label>
          </div>
        </div>
      </Panel>

      <Panel open={panel === 'sources'} onClose={() => setPanel(null)} side="right" title="Sources et inspirations">
        <p className="ec-hint">Pour « {active?.title || 'Sans titre'} ».</p>
        <label className="ec-drop"><Svg name="up" /><span>Ajouter une photo ou un fichier texte</span>
          <input type="file" multiple accept="image/*,.txt,.md,.csv,text/plain" onChange={onSourceFiles} className="sr-only" />
        </label>
        <form className="ec-note" onSubmit={addNote}>
          <label htmlFor="ec-note">Citation, idée ou lien</label>
          <textarea id="ec-note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          <button type="submit" className="ec-secondary" disabled={!note.trim()}><Svg name="plus" />Ajouter</button>
        </form>
        {active?.sources?.length ? (
          <ul className="ec-sources">
            {active.sources.map((src) => (
              <li key={src.id}>
                {src.type === 'image' ? <img src={src.data} alt={src.name} /> : null}
                {src.type === 'note' && isWebLink(src.data)
                  ? <a href={src.data.trim()} target="_blank" rel="noopener noreferrer">{src.data.trim()}</a>
                  : src.type !== 'image' ? <p>{src.data.length > 600 ? `${src.data.slice(0, 600)}…` : src.data}</p> : null}
                <div className="ec-source-foot">
                  <small>{src.type === 'note' ? 'Note' : src.name}</small>
                  <button type="button" className="ec-icon" onClick={() => removeSource(src.id)} aria-label="Retirer cette source"><Svg name="trash" /></button>
                </div>
              </li>
            ))}
          </ul>
        ) : <p className="ec-empty">Aucune source pour ce texte.</p>}
      </Panel>

      <Panel open={panel === 'sound'} onClose={() => setPanel(null)} title="Ambiance sonore">
        <div className="ec-choices">
          <button type="button" className={`ec-choice${sound === 'pluie' ? ' is-on' : ''}`} aria-pressed={sound === 'pluie'} onClick={() => toggleSound('pluie')}>
            <strong>Pluie douce</strong><small>Un bruit de fond régulier</small>
          </button>
          <button type="button" className={`ec-choice${sound === 'alpha' ? ' is-on' : ''}`} aria-pressed={sound === 'alpha'} onClick={() => toggleSound('alpha')}>
            <strong>Ondes alpha</strong><small>Avec un casque ou des écouteurs</small>
          </button>
        </div>
        <label className="ec-field">Volume
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => changeVolume(Number(e.target.value))} />
        </label>
        <p className="ec-hint">Touchez à nouveau l’ambiance choisie pour l’arrêter.</p>
      </Panel>

      <Panel open={panel === 'style'} onClose={() => setPanel(null)} title="Apparence">
        <fieldset className="ec-field">
          <legend>Couleurs</legend>
          <div className="ec-swatches">
            {Object.entries(THEMES).map(([key, label]) => (
              <button key={key} type="button" className={`ec-swatch${settings.theme === key ? ' is-on' : ''}`} data-swatch={key} aria-pressed={settings.theme === key}
                onClick={() => setSettings((s) => ({ ...s, theme: key }))}><i aria-hidden="true" />{label}</button>
            ))}
          </div>
        </fieldset>
        <label className="ec-field">Police
          <select value={settings.font} onChange={(e) => setSettings((s) => ({ ...s, font: e.target.value }))}>
            {Object.entries(FONTS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </label>
        <fieldset className="ec-field">
          <legend>Taille du texte</legend>
          <div className="ec-row">
            {Object.entries(SIZES).map(([key, label]) => (
              <button key={key} type="button" className={`ec-secondary${settings.size === key ? ' is-on' : ''}`} aria-pressed={settings.size === key}
                onClick={() => setSettings((s) => ({ ...s, size: key }))}>{label}</button>
            ))}
          </div>
        </fieldset>
        <label className="ec-field">Objectif de mots par jour
          <input type="number" min="50" max="20000" step="50" value={settings.goal}
            onChange={(e) => { const goal = Math.round(Number(e.target.value)); if (goal >= 50 && goal <= 20000) setSettings((s) => ({ ...s, goal })); }} />
        </label>
      </Panel>

      <Panel open={panel === 'share'} onClose={() => setPanel(null)} title="Transférer ce texte">
        <p>Pour ouvrir « {active?.title || 'Sans titre'} » sur un autre appareil : créez un lien, puis ouvrez-le là-bas (par exemple en vous l’envoyant par e-mail).</p>
        <p className="ec-hint">Le texte se trouve dans le lien lui-même : toute personne qui a ce lien peut le lire. Les sources ne sont pas incluses.</p>
        {shareLink ? (
          <>
            <label className="ec-field">Lien
              <input type="text" readOnly value={shareLink} onFocus={(e) => e.target.select()} />
            </label>
            {shareLink.length > 8000 ? <p className="ec-hint">Ce lien est très long : certaines messageries le coupent. Pour un long texte, utilisez plutôt la sauvegarde.</p> : null}
            <button type="button" className="ec-primary" onClick={copyLink}><Svg name="copy" />Copier le lien</button>
          </>
        ) : <button type="button" className="ec-primary" onClick={makeLink}><Svg name="share" />Créer le lien</button>}
      </Panel>

      <Panel open={Boolean(incoming)} onClose={() => setIncoming(null)} title="Un texte vous a été transféré">
        <p>Ajouter « {incoming?.title || 'Sans titre'} » à vos textes sur cet appareil ?</p>
        <div className="ec-row">
          <button type="button" className="ec-primary" onClick={acceptIncoming}><Svg name="plus" />Ajouter</button>
          <button type="button" className="ec-secondary" onClick={() => setIncoming(null)}>Ignorer</button>
        </div>
      </Panel>
    </div>
  );
}
