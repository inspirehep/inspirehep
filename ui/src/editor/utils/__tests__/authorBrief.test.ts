import {
  authorBrief,
  authorHref,
  authorNeedsEdit,
  authorSuffix,
} from '../authorBrief';

describe('authorNeedsEdit', () => {
  it('needs edit when the author is not linked to a record', () => {
    expect(authorNeedsEdit({ full_name: 'Doe, John' })).toBe(true);
    expect(authorNeedsEdit({ record: {} })).toBe(true);
    expect(authorNeedsEdit({ record: { $ref: '' } })).toBe(true);
  });

  it('does not need edit when linked to a record', () => {
    expect(
      authorNeedsEdit({ record: { $ref: 'https://x/api/authors/1' } })
    ).toBe(false);
  });

  it('needs edit for empty values', () => {
    expect(authorNeedsEdit(undefined)).toBe(true);
    expect(authorNeedsEdit(null)).toBe(true);
  });
});

describe('authorHref', () => {
  it('replaces /api/ with / in the record $ref', () => {
    expect(authorHref({ record: { $ref: 'https://x/api/authors/1' } })).toBe(
      'https://x/authors/1'
    );
  });

  it.each([undefined, null, {}, { record: {} }, { record: { $ref: '' } }])(
    'returns undefined for %j',
    (author) => {
      expect(authorHref(author)).toBeUndefined();
    }
  );
});

describe('authorBrief', () => {
  it('returns the full name only', () => {
    expect(
      authorBrief({
        full_name: 'Doe, John',
        affiliations: [{ value: 'CERN' }],
      })
    ).toBe('Doe, John');
  });

  it.each([undefined, null, {}, { full_name: '' }, { full_name: 5 }])(
    'returns "Empty author" for %j',
    (author) => {
      expect(authorBrief(author)).toBe('Empty author');
    }
  );
});

describe('authorSuffix', () => {
  it('returns the affiliation value', () => {
    expect(authorSuffix({ affiliations: [{ value: 'CERN' }] })).toBe('CERN');
  });

  it('joins several affiliations with "and"', () => {
    expect(
      authorSuffix({ affiliations: [{ value: 'CERN' }, { value: 'MIT' }] })
    ).toBe('CERN and MIT');
  });

  it('ignores affiliations without a value', () => {
    expect(
      authorSuffix({ affiliations: [{}, { value: '' }, { value: 'MIT' }] })
    ).toBe('MIT');
  });

  it.each([
    undefined,
    null,
    {},
    { affiliations: [] },
    { affiliations: 'CERN' },
    { affiliations: [{}] },
  ])('returns undefined for %j', (author) => {
    expect(authorSuffix(author)).toBeUndefined();
  });
});
