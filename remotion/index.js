// Remotion entry point. Kept apart from the Next.js app: nothing here is
// imported by the site, and Remotion is a dev dependency only.
import { registerRoot } from 'remotion';
import { RemotionRoot } from './Root';

registerRoot(RemotionRoot);
