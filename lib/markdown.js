// A small Markdown reader for blog articles written in the CMS. It understands
// exactly what the editor's toolbar produces (headings, bold, italic, links,
// quotes, lists and images) and turns it into a tree of plain objects. Raw HTML
// is never interpreted: it stays visible text, so an article cannot inject
// markup or scripts. components/Markdown.js renders the tree with React.

const SAFE_LINK = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i;
const SAFE_IMAGE = /^(https:\/\/|\/(?!\/)|blob:)/i;
export const safeLink = (url) => (SAFE_LINK.test(url) ? url : null);
export const safeImage = (url) => (SAFE_IMAGE.test(url) ? url : null);

const ESCAPABLE = '\\`*_{}[]()#+-.!>~|<"\'';
const LIST_ITEM = /^ {0,3}(?:([-*+])|(\d{1,9})[.)])[ \t]+(.*)$/;
const HEADING = /^ {0,3}(#{1,6})[ \t]+(.*?)[ \t#]*$/;
const RULE = /^ {0,3}([-*_])(?:[ \t]*\1){2,}[ \t]*$/;
const QUOTE = /^ {0,3}>[ \t]?(.*)$/;

export function parseBlocks(source) {
  const lines = String(source ?? '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    let match;
    if ((match = line.match(HEADING))) {
      // The article title is the page's h1, so headings start at h2.
      blocks.push({ type: 'heading', level: Math.min(Math.max(match[1].length, 2), 4), children: parseInline(match[2]) });
      i++;
    } else if (RULE.test(line)) {
      blocks.push({ type: 'rule' });
      i++;
    } else if (QUOTE.test(line)) {
      const inner = [];
      while (i < lines.length && lines[i].trim() && (match = lines[i].match(QUOTE))) { inner.push(match[1]); i++; }
      blocks.push({ type: 'quote', children: parseBlocks(inner.join('\n')) });
    } else if ((match = line.match(LIST_ITEM))) {
      const ordered = Boolean(match[2]);
      const start = ordered ? Number(match[2]) : 1;
      const items = [];
      while (i < lines.length) {
        const current = lines[i];
        const item = current.match(LIST_ITEM);
        if (item && Boolean(item[2]) === ordered) { items.push([item[3]]); i++; continue; }
        // A blank line ends the list unless the next line carries on with it.
        if (!current.trim()) {
          const next = lines[i + 1]?.match(LIST_ITEM);
          if (next && Boolean(next[2]) === ordered) { i++; continue; }
          break;
        }
        // Indented lines, including nested items, continue the current item.
        if (/^[ \t]/.test(current) && items.length) { items.at(-1).push(current.trim().replace(LIST_ITEM, '$3')); i++; continue; }
        break;
      }
      blocks.push({ type: 'list', ordered, start, items: items.map((parts) => parseInline(parts.join('\n'))) });
    } else {
      const text = [];
      while (i < lines.length && lines[i].trim() && !HEADING.test(lines[i]) && !RULE.test(lines[i]) && !QUOTE.test(lines[i]) && !LIST_ITEM.test(lines[i])) { text.push(lines[i]); i++; }
      const children = parseInline(text.join('\n'));
      // An image on its own line is shown as a figure rather than inside text.
      const only = children.filter((node) => !(node.type === 'text' && !node.value.trim()));
      blocks.push(only.length === 1 && only[0].type === 'image' ? { type: 'figure', image: only[0] } : { type: 'paragraph', children });
    }
  }
  return blocks;
}

// Finds the index of the bracket that closes the one at `open`, or -1.
function closing(text, open, left, right) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '\\') { i++; continue; }
    if (text[i] === left) depth++;
    else if (text[i] === right && --depth === 0) return i;
  }
  return -1;
}

// Reads "(url)" or "(url "title")" starting at `open`; returns the url and end index.
function destination(text, open) {
  if (text[open] !== '(') return null;
  const end = closing(text, open, '(', ')');
  if (end < 0) return null;
  const inner = text.slice(open + 1, end).trim();
  const match = inner.match(/^<([^>]*)>|^(\S*)/);
  const url = (match[1] ?? match[2]).replace(/\\(.)/g, '$1');
  return { url, end };
}

const isWordChar = (char) => Boolean(char) && /[\p{L}\p{N}]/u.test(char);

function findCloser(text, from, marker) {
  for (let i = from; i < text.length; i++) {
    if (text[i] === '\\') { i++; continue; }
    if (text[i] === '`') { const end = text.indexOf('`', i + 1); if (end > 0) { i = end; continue; } }
    if (text.startsWith(marker, i) && !/\s/.test(text[i - 1])) {
      // "**" must not be read as the end of a single "*" emphasis, and an
      // underscore inside a word (snake_case) is not emphasis at all.
      if (marker.length === 1 && text[i + 1] === marker) { i++; continue; }
      if (marker[0] === '_' && isWordChar(text[i + marker.length])) continue;
      return i;
    }
  }
  return -1;
}

export function parseInline(source) {
  const text = String(source ?? '');
  const nodes = [];
  let buffer = '';
  const flush = () => { if (buffer) { nodes.push({ type: 'text', value: buffer }); buffer = ''; } };
  for (let i = 0; i < text.length;) {
    const char = text[i];
    if (char === '\\' && text[i + 1] === '\n') { flush(); nodes.push({ type: 'break' }); i += 2; continue; }
    if (char === '\\' && ESCAPABLE.includes(text[i + 1] ?? '')) { buffer += text[i + 1]; i += 2; continue; }
    if (char === '\n') {
      const hard = / {2,}$/.test(buffer);
      buffer = buffer.replace(/[ \t]+$/, '');
      if (hard) { flush(); nodes.push({ type: 'break' }); } else buffer += ' ';
      i++; continue;
    }
    if (char === '`') {
      const end = text.indexOf('`', i + 1);
      if (end > i + 1) { flush(); nodes.push({ type: 'code', value: text.slice(i + 1, end) }); i = end + 1; continue; }
    }
    if (char === '!' && text[i + 1] === '[') {
      const close = closing(text, i + 1, '[', ']');
      const target = close > 0 && destination(text, close + 1);
      if (target) {
        flush();
        const src = safeImage(target.url);
        const alt = text.slice(i + 2, close).replace(/\\(.)/g, '$1');
        nodes.push(src ? { type: 'image', src, alt } : { type: 'text', value: alt });
        i = target.end + 1; continue;
      }
    }
    if (char === '[') {
      const close = closing(text, i, '[', ']');
      const target = close > 0 && destination(text, close + 1);
      if (target) {
        flush();
        const children = parseInline(text.slice(i + 1, close));
        const href = safeLink(target.url);
        if (href) nodes.push({ type: 'link', href, children }); else nodes.push(...children);
        i = target.end + 1; continue;
      }
    }
    if (char === '*' || char === '_') {
      const strong = text[i + 1] === char;
      const marker = strong ? char + char : char;
      const opensWord = !/\s/.test(text[i + marker.length] ?? ' ');
      const intraword = char === '_' && isWordChar(text[i - 1]);
      const end = opensWord && !intraword ? findCloser(text, i + marker.length, marker) : -1;
      if (end > i + marker.length) {
        flush();
        nodes.push({ type: strong ? 'strong' : 'em', children: parseInline(text.slice(i + marker.length, end)) });
        i = end + marker.length; continue;
      }
      buffer += marker; i += marker.length; continue;
    }
    buffer += char; i++;
  }
  flush();
  return nodes;
}

export function plainText(source) {
  const walk = (nodes) => nodes.map((node) => node.value ?? (node.type === 'break' ? ' ' : node.children ? walk(node.children) : '')).join('');
  return parseBlocks(source).map((block) => {
    if (block.type === 'list') return block.items.map(walk).join(' ');
    if (block.type === 'quote') return block.children.map((child) => walk(child.children || [])).join(' ');
    return block.children ? walk(block.children) : '';
  }).join(' ').replace(/\s+/g, ' ').trim();
}

export const readingMinutes = (source) => Math.max(1, Math.round(plainText(source).split(' ').filter(Boolean).length / 200));
