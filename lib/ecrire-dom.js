// Browser-only helpers for /ecrire: they need the page's HTML parser.

// The only formatting a text may keep. Everything else is unwrapped to its
// words, and every attribute is removed, so no stored, pasted or imported
// text can ever carry a script, a link or a style onto the page.
const KEEP = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'H2', 'H3', 'DIV']);
const RENAME = { H1: 'H2', H4: 'H3', H5: 'H3', H6: 'H3' };
const DROP = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'FRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT', 'SVG', 'MATH', 'TITLE', 'META', 'LINK', 'BASE', 'HEAD', 'FORM', 'INPUT', 'BUTTON', 'SELECT', 'TEXTAREA', 'IMG', 'PICTURE', 'VIDEO', 'AUDIO', 'CANVAS', 'XML']);

function clean(node, doc) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === 3) continue;
    if (child.nodeType !== 1) { child.remove(); continue; }
    const tag = child.nodeName.toUpperCase();
    if (DROP.has(tag)) { child.remove(); continue; }
    clean(child, doc);
    if (RENAME[tag]) {
      const heading = doc.createElement(RENAME[tag]);
      heading.append(...child.childNodes);
      child.replaceWith(heading);
    } else if (KEEP.has(tag)) {
      for (const attr of [...child.attributes]) child.removeAttribute(attr.name);
    } else {
      child.replaceWith(...child.childNodes);
    }
  }
}

// DOMParser builds an inert document: nothing in it loads or runs.
export function sanitizeHtml(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  clean(doc.body, doc);
  return doc.body.innerHTML;
}

// The text to save. Browsers sometimes put a list or quote inside a paragraph
// while editing; reloading that would leave empty lines, so it is undone on a
// copy (the live editor is left alone so the cursor never jumps).
export function editorHtml(editor) {
  const copy = editor.cloneNode(true);
  for (const p of copy.querySelectorAll('p')) {
    if (p.querySelector('ul,ol,blockquote,h2,h3,p,div')) p.replaceWith(...p.childNodes);
  }
  return copy.innerHTML;
}

export function htmlToText(html) {
  const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
  for (const el of doc.body.querySelectorAll('p,div,li,h2,h3,blockquote,br')) el.append(' ');
  return doc.body.textContent || '';
}

const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
export const quoteHtml = (label, text) => `<blockquote><b>${escapeHtml(label)}</b> ${escapeHtml(text)}</blockquote><p><br></p>`;

// Markdown needs the markers right against the words: spaces stay outside.
function wrap(text, mark) {
  const [, before, words, after] = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
  return `${before}${mark}${words}${mark}${after}`;
}

function inline(node) {
  let out = '';
  for (const child of node.childNodes) {
    if (child.nodeType === 3) { out += child.textContent.replace(/\s+/g, ' '); continue; }
    if (child.nodeType !== 1) continue;
    const tag = child.nodeName;
    const inner = inline(child);
    if (tag === 'BR') out += '  \n';
    else if ((tag === 'B' || tag === 'STRONG') && inner.trim()) out += wrap(inner, '**');
    else if ((tag === 'I' || tag === 'EM') && inner.trim()) out += wrap(inner, '*');
    else if (['P', 'DIV', 'H2', 'H3', 'BLOCKQUOTE', 'UL', 'OL', 'LI'].includes(tag)) out += `\n\n${block(child)}\n\n`;
    else out += inner;
  }
  return out;
}

function block(el) {
  const tag = el.nodeName;
  if (tag === 'H2') return `## ${inline(el).trim()}`;
  if (tag === 'H3') return `### ${inline(el).trim()}`;
  if (tag === 'BLOCKQUOTE') return inline(el).trim().split('\n').map((line) => `> ${line}`.trimEnd()).join('\n');
  if (tag === 'UL' || tag === 'OL') {
    return [...el.children].filter((li) => li.nodeName === 'LI').map((li, i) => `${tag === 'OL' ? `${i + 1}.` : '-'} ${inline(li).trim().replace(/\n+/g, ' ')}`).join('\n');
  }
  return inline(el).trim();
}

export function htmlToMarkdown(title, html) {
  const doc = new DOMParser().parseFromString(sanitizeHtml(html), 'text/html');
  const body = inline(doc.body).replace(/[ \t]+\n/g, (m) => (m.startsWith('  ') ? '  \n' : '\n')).replace(/\n{3,}/g, '\n\n').trim();
  return `# ${String(title || 'Sans titre').trim()}\n\n${body}\n`;
}

// Photos are shrunk before saving: browser storage holds only a few megabytes.
export function shrinkImage(file, max = 1600) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('image')); };
    img.src = url;
  });
}

export function download(name, type, content) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
