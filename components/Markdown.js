import { parseBlocks } from '@/lib/markdown';

// Renders an article body (see lib/markdown.js) as React elements; no HTML
// string is ever injected into the page.
function Inline({ nodes }) {
  return nodes.map((node, i) => {
    switch (node.type) {
      case 'text': return node.value;
      case 'break': return <br key={i} />;
      case 'code': return <code key={i}>{node.value}</code>;
      case 'strong': return <strong key={i}><Inline nodes={node.children} /></strong>;
      case 'em': return <em key={i}><Inline nodes={node.children} /></em>;
      case 'image': return <img key={i} src={node.src} alt={node.alt} loading="lazy" decoding="async" />;
      case 'link': {
        const external = /^https?:\/\//i.test(node.href) && !node.href.startsWith('https://www.essentiademdb.com');
        return <a key={i} href={node.href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}><Inline nodes={node.children} /></a>;
      }
      default: return null;
    }
  });
}

function Blocks({ blocks }) {
  return blocks.map((block, i) => {
    switch (block.type) {
      case 'heading': { const Tag = `h${block.level}`; return <Tag key={i}><Inline nodes={block.children} /></Tag>; }
      case 'paragraph': return <p key={i}><Inline nodes={block.children} /></p>;
      case 'figure': return <figure key={i}><img src={block.image.src} alt={block.image.alt} loading="lazy" decoding="async" /></figure>;
      case 'quote': return <blockquote key={i}><Blocks blocks={block.children} /></blockquote>;
      case 'rule': return <hr key={i} />;
      case 'list': {
        const items = block.items.map((item, j) => <li key={j}><Inline nodes={item} /></li>);
        return block.ordered ? <ol key={i} start={block.start === 1 ? undefined : block.start}>{items}</ol> : <ul key={i}>{items}</ul>;
      }
      default: return null;
    }
  });
}

export function Markdown({ source }) {
  return <Blocks blocks={parseBlocks(source)} />;
}
