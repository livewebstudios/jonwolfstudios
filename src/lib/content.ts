import showsFile from '../../_content/shows.json';
import postsFile from '../../_content/posts.json';

export interface Show {
  date: string; // ISO yyyy-mm-dd
  venue: string;
  city: string;
  state: string;
  band: string;
  ticketUrl?: string;
}

export interface Post {
  title: string;
  slug: string;
  date: string; // ISO yyyy-mm-dd
  tag: 'music' | 'web';
  excerpt: string;
  body: string; // markdown
}

const byDateAsc = (a: Show, b: Show) => a.date.localeCompare(b.date);
const byDateDesc = (a: Post, b: Post) => b.date.localeCompare(a.date);

/** Shows split at build time — "today" is the moment Netlify builds. */
export function getShows(): { upcoming: Show[]; past: Show[] } {
  const today = new Date().toISOString().slice(0, 10);
  const all = (showsFile.shows as Show[]).slice().sort(byDateAsc);
  return {
    upcoming: all.filter((s) => s.date >= today),
    past: all.filter((s) => s.date < today).reverse(),
  };
}

export function getPosts(): Post[] {
  return (postsFile.posts as Post[]).slice().sort(byDateDesc);
}

export function formatShowDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })
    .toUpperCase();
}

export function formatPostDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}
