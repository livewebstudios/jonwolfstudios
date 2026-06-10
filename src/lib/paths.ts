/**
 * LWS path rule: every internal href/src in shipped HTML must be relative.
 * With trailingSlash 'always' + directory build format, a page at
 * /notes/some-post/ is two directories deep, so the prefix back to site
 * root is '../../'. Home ('/') resolves to './'.
 */
export function relRoot(pathname: string): string {
  const depth = pathname.split('/').filter(Boolean).length;
  return depth === 0 ? './' : '../'.repeat(depth);
}
