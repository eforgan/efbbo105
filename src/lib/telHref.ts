// tel: links need a plain digit string (with leading +) — strips spaces, parens, dashes and
// any secondary "Fax .../ VHF ..." suffix appended after a middle dot in reference data.
// A trailing "interno NNNNN" (switchboard extension) becomes a dial-pause extension
// (",NNNNN") per the tel: URI convention most dialers support.
export function telHref(phone: string): string {
  const internoMatch = phone.match(/interno\s*(\d+)/i);
  const before = phone.split(/interno/i)[0];
  const primary = before.split('·')[0].split('/')[0];
  const digits = primary.replace(/[^\d+]/g, '');
  return internoMatch ? `tel:${digits},${internoMatch[1]}` : `tel:${digits}`;
}
