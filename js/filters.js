// Filtering, grouping, and sorting helpers for the happy-hour grid.

function parseClock(token) {
  if (!token) return null;
  const m = token.match(/(\d+)(?::(\d+))?\s*(am|pm)?/i);
  if (!m) return null;
  let h = parseInt(m[1]); const min = m[2] ? parseInt(m[2]) : 0;
  const p = m[3] ? m[3].toLowerCase() : 'pm';
  if (p === 'pm' && h !== 12) h += 12; else if (p === 'am' && h === 12) h = 0;
  return h * 60 + min;
}
function parseWindow(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.split(/[-–—]/);
  const start = parseClock(parts[0]);
  const endRaw = parts[1] || '';
  const closes = /close/i.test(endRaw);
  return { start, end: closes ? null : parseClock(endRaw), closes };
}

export function isOpenNow(timeStr, nowMin) {
  const w = parseWindow(timeStr);
  if (!w || w.start == null) return false;
  if (w.closes || w.end == null) return nowMin >= w.start;
  if (w.end >= w.start) return nowMin >= w.start && nowMin <= w.end;
  // window crosses midnight
  return nowMin >= w.start || nowMin <= w.end;
}

export function getNeighborhood(d) {
  return d && d.neighborhood ? d.neighborhood : '';
}

export function filterDeals(deals, day, dealType, drinkFilter, lateNightOnly, city, openNow, nowMin, neighborhood) {
  return deals.filter(d => {
    if (d.day !== day) return false;
    if (dealType !== 'all' && d.deal_type !== dealType) return false;
    if (dealType === 'Drink' && drinkFilter !== 'all' && !d[drinkFilter]) return false;
    if (lateNightOnly && !d.latenight) return false;
    if (city !== 'all' && d.city !== city) return false;
    if (neighborhood !== 'all' && getNeighborhood(d) !== neighborhood) return false;
    if (openNow && !isOpenNow(d.time, nowMin)) return false;
    return true;
  });
}

export function groupByVenue(deals) {
  const map = new Map();
  for (const d of deals) {
    const key = d.venue + '|' + (d.city || '');
    if (!map.has(key)) map.set(key, { venue: d.venue, city: d.city, deals: [] });
    map.get(key).deals.push(d);
  }
  return [...map.values()];
}

export function sortVenueDeals(groups) {
  for (const g of groups) {
    g.deals.sort((a, b) => {
      const wa = parseWindow(a.time), wb = parseWindow(b.time);
      const sa = wa && wa.start != null ? wa.start : 9999;
      const sb = wb && wb.start != null ? wb.start : 9999;
      return sa - sb;
    });
  }
}

export function sortVenues(groups) {
  // Featured/hot venues first, then alphabetical by venue name.
  return [...groups].sort((a, b) => {
    const af = a.deals.some(d => d.hot) ? 2 : a.deals.some(d => d.featured) ? 1 : 0;
    const bf = b.deals.some(d => d.hot) ? 2 : b.deals.some(d => d.featured) ? 1 : 0;
    if (af !== bf) return bf - af;
    return a.venue.localeCompare(b.venue);
  });
}
