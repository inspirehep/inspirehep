import removeEmptyValues from '../removeEmptyValues';

describe('removeEmptyValues', () => {
  it('drops empty strings, null, undefined, {} and []', () => {
    expect(
      removeEmptyValues({
        a: '',
        b: null,
        c: undefined,
        d: {},
        e: [],
        f: 'keep',
      })
    ).toEqual({ f: 'keep' });
  });

  it('cascades through nested levels and array items', () => {
    expect(
      removeEmptyValues({
        reference: { authors: [{ full_name: '' }, { full_name: 'Doe, J.' }] },
        misc: [{ x: [] }],
      })
    ).toEqual({ reference: { authors: [{ full_name: 'Doe, J.' }] } });
  });

  it('keeps false and 0', () => {
    expect(removeEmptyValues({ a: false, b: 0 })).toEqual({ a: false, b: 0 });
  });

  it('does not mutate its input', () => {
    const input = { a: '', b: { c: 1 } };
    removeEmptyValues(input);
    expect(input).toEqual({ a: '', b: { c: 1 } });
  });
});
