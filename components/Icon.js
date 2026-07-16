import { ICON } from '@/lib/icons';
// Renders one of the inline line-icons by name.
export function Icon({ name }) {
  return <span aria-hidden="true" style={{ display: 'inline-flex' }} dangerouslySetInnerHTML={{ __html: ICON[name] || '' }} />;
}
