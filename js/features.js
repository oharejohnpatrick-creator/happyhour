// Returns a feature tier for a deal row, or null/undefined if not featured.
// 'hot' > 'featured' in display priority (see cardHTML in index.html).
export function getFeatureTier(d) {
  if (d.hot) return 'hot';
  if (d.featured) return 'featured';
  return null;
}
