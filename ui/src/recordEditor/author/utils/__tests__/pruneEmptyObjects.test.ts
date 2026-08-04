import pruneEmptyObjects from '../pruneEmptyObjects';

describe('pruneEmptyObjects', () => {
  it('removes a nested object once it has no properties left', () => {
    const input = { name: 'Nobel Prize', url: {} };

    expect(pruneEmptyObjects(input)).toEqual({ name: 'Nobel Prize' });
  });

  it('keeps a nested object that still has properties set', () => {
    const input = { name: 'Nobel Prize', url: { value: 'https://example.com' } };

    expect(pruneEmptyObjects(input)).toEqual(input);
  });

  it('cascades removal through multiple empty levels', () => {
    const input = { awards: [{ name: 'Nobel Prize', url: { description: {} } }] };

    expect(pruneEmptyObjects(input)).toEqual({
      awards: [{ name: 'Nobel Prize' }],
    });
  });

  it('treats a property explicitly set to undefined as absent', () => {
    const input = { name: 'Nobel Prize', url: { description: undefined } };

    expect(pruneEmptyObjects(input)).toEqual({ name: 'Nobel Prize' });
  });

  it('keeps empty array items by default, so a freshly added item stays editable', () => {
    const input = { awards: [{}, { name: 'Nobel Prize' }] };

    expect(pruneEmptyObjects(input)).toEqual(input);
  });

  it('removes a property that is an empty array', () => {
    const input = { name: 'Nobel Prize', advisors: [] };

    expect(pruneEmptyObjects(input)).toEqual({ name: 'Nobel Prize' });
  });

  it('cascades removal when pruning an empty array leaves an object empty', () => {
    const input = { project: { ids: [] }, name: 'Nobel Prize' };

    expect(pruneEmptyObjects(input)).toEqual({ name: 'Nobel Prize' });
  });

  it('leaves primitives, null and populated objects untouched', () => {
    const input = { name: 'Nobel Prize', year: 2020, deleted: null };

    expect(pruneEmptyObjects(input)).toEqual(input);
  });

  describe('with pruneArrayItems (used right before submit)', () => {
    it('removes empty objects from arrays', () => {
      const input = { awards: [{}, { name: 'Nobel Prize' }] };

      expect(pruneEmptyObjects(input, { pruneArrayItems: true })).toEqual({
        awards: [{ name: 'Nobel Prize' }],
      });
    });

    it('prunes empty nested objects before deciding an array item is empty', () => {
      const input = { awards: [{ url: {} }, { name: 'Nobel Prize' }] };

      expect(pruneEmptyObjects(input, { pruneArrayItems: true })).toEqual({
        awards: [{ name: 'Nobel Prize' }],
      });
    });

    it('removes the property entirely once pruning empties the array', () => {
      const input = { awards: [{}], name: 'Nobel Prize' };

      expect(pruneEmptyObjects(input, { pruneArrayItems: true })).toEqual({
        name: 'Nobel Prize',
      });
    });
  });
});
