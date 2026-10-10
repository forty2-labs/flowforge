import { slugify } from './slug.js';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Northstar Studio')).toBe('northstar-studio');
  });

  it('strips accents and punctuation', () => {
    expect(slugify('  Northstar Café & Co. ')).toBe('northstar-cafe-co');
  });

  it('falls back when nothing usable is left', () => {
    expect(slugify('!!!')).toBe('workspace');
  });

  it('caps the length without a trailing hyphen', () => {
    const slug = slugify(`${'a'.repeat(47)} b`);
    expect(slug).toBe('a'.repeat(47));
  });
});
