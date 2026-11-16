import trimStrings from '../trimStrings';

describe('trimStrings', () => {
  it('trims leading and trailing whitespace in nested strings', () => {
    expect(
      trimStrings({
        a: '  x \n',
        b: [{ c: '\t y' }, ' z '],
        d: 1,
        e: null,
      })
    ).toEqual({ a: 'x', b: [{ c: 'y' }, 'z'], d: 1, e: null });
  });

  it('keeps inner whitespace', () => {
    expect(trimStrings(' a  b ')).toBe('a  b');
  });
});
