import { pageMetadata } from '@/lib/metadata';

export const metadata = pageMetadata('podcast', {
  // Kept out of search results until the first episode is published.
  robots: { index: false, follow: true },
});

export default function PodcastLayout({ children }) {
  return children;
}
