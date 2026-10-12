import { HeroScene } from './HeroScene';
import { SectionLogo } from './SectionLogo';

// Shared page composition with a viewport-triggered signature.
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
      <div className="page-monogram"><SectionLogo /><span>Myriam Diougoan Blanch</span></div>
    </div>
  </>;
}
