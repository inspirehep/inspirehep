import toYaml from '../toYaml';

describe('toYaml non-ASCII', () => {
  it('keeps accented names unquoted', () => {
    expect(toYaml({ full_name: 'M\u00fcller, D.' })).toBe(
      'full_name: M\u00fcller, D.'
    );
  });
});
