/**
 * Picks the md: column count for a card row, matching the reference's helper.
 * Keeps rows even so a 3-card row does not leave a lone card on its own line.
 */
export function gridCols(count) {
  if (count >= 4 && count % 4 === 0) return 'md:grid-cols-4';
  if (count % 3 === 0) return 'md:grid-cols-3';
  if (count % 2 === 0) return 'md:grid-cols-2';
  if (count >= 4) return 'md:grid-cols-4';
  return 'md:grid-cols-3';
}
