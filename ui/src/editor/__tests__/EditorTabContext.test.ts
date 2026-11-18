import { getTabNameForErrorPath } from '../EditorTabContext';

const tabs = [
  { name: 'References', properties: ['references'] },
  { name: 'Authors', properties: ['authors', 'collaborations'] },
];

describe('getTabNameForErrorPath', () => {
  it('should return the tab holding the top-level property of the path', () => {
    expect(getTabNameForErrorPath(tabs, '.authors[0].full_name')).toBe(
      'Authors'
    );
    expect(getTabNameForErrorPath(tabs, '.references')).toBe('References');
  });

  it('should fall back to Main', () => {
    expect(getTabNameForErrorPath(tabs, '.titles[0].title')).toBe('Main');
    expect(getTabNameForErrorPath(undefined, '.authors')).toBe('Main');
  });
});
