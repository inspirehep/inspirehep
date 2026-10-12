import toYaml from '../toYaml';

describe('toYaml', () => {
  it('renders nested authors as readable YAML', () => {
    const authors = [
      { full_name: 'Doe, John', raw_affiliations: [{ value: 'CERN' }] },
      { full_name: 'Roe, Jane', raw_affiliations: [] },
    ];

    expect(toYaml(authors)).toBe(
      [
        '- full_name: Doe, John',
        '  raw_affiliations:',
        '    - value: CERN',
        '- full_name: Roe, Jane',
        '  raw_affiliations: []',
      ].join('\n')
    );
  });

  it('quotes strings that are not safe as plain YAML', () => {
    expect(toYaml({ orcid: '0000-0002-6357-9297', note: 'a: b' })).toBe(
      ['orcid: "0000-0002-6357-9297"', 'note: "a: b"'].join('\n')
    );
  });

  it('handles empty and scalar values', () => {
    expect(toYaml([])).toBe('[]');
    expect(toYaml({})).toBe('{}');
    expect(toYaml(null)).toBe('null');
    expect(toYaml(3)).toBe('3');
  });
});
