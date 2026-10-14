import { ResourcesView } from '@/components/Blog';
import { getPosts } from '@/lib/blog';
import { readingMinutes } from '@/lib/markdown';

// Article bodies stay on the server; cards only need the reading time.
export default function ResourcesPage() {
  const posts = getPosts().map(({ body, ...post }) => ({ ...post, minutes: readingMinutes(body) }));
  return <ResourcesView posts={posts} />;
}
