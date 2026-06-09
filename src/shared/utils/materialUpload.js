/** Derive a display title from a file name (e.g. "My_Doc.pdf" → "My Doc"). */
export const titleFromFilename = (name) => {
  if (!name) return '';
  const base = name.replace(/\.[^/.]+$/, '');
  return base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
};
