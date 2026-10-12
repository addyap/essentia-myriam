import { HeroScene } from './HeroScene';
import { LogoMark } from './LogoMark';

// One compact visual language for every inner page; no additional WebGL or video.
export function PageHeader({ eyebrow, title, lead, scene, quiet = false }) {
  return <>
    {scene ? <><HeroScene scene={scene} /><div className="page-scrim" /></> : null}
    <div className={`wrap page-heading${quiet ? ' page-heading--quiet' : ''}`}>
      <div className="page-heading-copy">
        <span className="eyebrow">{eyebrow}</span>
        <h1 className="big">{title}</h1>
        <div className="divider" />
        {lead ? <p className="lead">{lead}</p> : null}
      </div>
      <div className="page-monogram" aria-hidden="true"><LogoMark /><span>Myriam Diougoan Blanch</span></div>
    </div>
  </>;
}
