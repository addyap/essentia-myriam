import KeystaticApp from './keystatic';
import { cmsEnvironment } from '../../cms/environment';
import AdminWelcome from '../admin/page';
export const metadata = { title: 'Édition française · Essentia', robots: { index: false, follow: false }, alternates: { canonical: '/keystatic' } };
export const dynamic = 'force-dynamic';
export default function Layout() {
  const setup = process.env.NODE_ENV === 'development' && !process.env.VERCEL;
  return cmsEnvironment().available || setup ? <KeystaticApp /> : <AdminWelcome />;
}
