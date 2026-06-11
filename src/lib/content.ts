import showsFile from '../../_content/shows.json';
import postsFile from '../../_content/posts.json';

/** Raw shape as stored in _content/shows.json (snake_case from the band feed). */
interface RawShow {
  date: string;
  day?: string;
  venue: string;
  city: string;
  state: string;
  act: string;
  past?: boolean;
  time?: string;
  tickets_url?: string;
  rsvp_url?: string;
}

export interface Show {
  date: string; // ISO yyyy-mm-dd
  day?: string;
  venue: string;
  city: string;
  state: string;
  act: string;
  past: boolean;
  time?: string;
  ticketsUrl?: string;
  rsvpUrl?: string;
}

export interface Post {
  title: string;
  slug: string;
  date: string; // ISO yyyy-mm-dd
  tag: 'music' | 'web';
  excerpt: string;
  body: string; // markdown
}

const byDateDesc = (a: Post, b: Post) => b.date.localeCompare(a.date);

/** All shows, newest first. The shows page reveals them 15 at a time. */
export function getShows(): Show[] {
  return (showsFile.shows as RawShow[])
    .map((s) => ({
      date: s.date,
      day: s.day,
      venue: s.venue,
      city: s.city,
      state: s.state,
      act: s.act,
      past: Boolean(s.past),
      time: s.time,
      ticketsUrl: s.tickets_url,
      rsvpUrl: s.rsvp_url,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** Upcoming only — for Event structured data. */
export function getUpcomingShows(): Show[] {
  return getShows().filter((s) => !s.past);
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
