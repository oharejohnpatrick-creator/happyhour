// Minimal CSV parser: handles quoted fields, commas inside quotes, and
// converts known boolean/numeric columns. Returns an array of deal objects.

const BOOL_COLS = new Set(['latenight', 'taco_tuesday', 'beer', 'wine', 'cocktail', 'margarita', 'featured', 'hot']);

function splitCSVLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { out.push(cur); cur = ''; }
      else cur += c;
    }
  }
  out.push(cur);
  return out;
}

export function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (!lines.length) return [];
  const headers = splitCSVLine(lines[0]).map(h => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => {
      let val = (cells[idx] ?? '').trim();
      if (BOOL_COLS.has(h)) {
        obj[h] = val === '1' || val.toLowerCase() === 'true';
      } else {
        obj[h] = val;
      }
    });
    rows.push(obj);
  }
  return rows;
}
