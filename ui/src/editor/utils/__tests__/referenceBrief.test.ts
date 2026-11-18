import {
  referenceBrief,
  referenceHref,
  referenceNeedsEdit,
} from '../referenceBrief';

describe('referenceNeedsEdit', () => {
  it('needs edit when the reference is not linked to a record', () => {
    expect(referenceNeedsEdit({ reference: { label: '1' } })).toBe(true);
    expect(referenceNeedsEdit({ record: {} })).toBe(true);
    expect(referenceNeedsEdit({ record: { $ref: '' } })).toBe(true);
  });

  it('does not need edit when linked to a record', () => {
    expect(
      referenceNeedsEdit({ record: { $ref: 'https://x/api/literature/1' } })
    ).toBe(false);
  });

  it('needs edit for empty values', () => {
    expect(referenceNeedsEdit(undefined)).toBe(true);
    expect(referenceNeedsEdit(null)).toBe(true);
  });
});

describe('referenceBrief', () => {
  it.each([undefined, null, {}, { reference: {} }, { reference: null }])(
    'returns "Empty reference" for %j',
    (reference) => {
      expect(referenceBrief(reference)).toBe('Empty reference');
    }
  );

  it('displays the only author without et al.', () => {
    expect(
      referenceBrief({ reference: { authors: [{ full_name: 'Elliott' }] } })
    ).toBe('Elliott');
  });

  it('displays first author with et al. when there are several', () => {
    expect(
      referenceBrief({
        reference: {
          authors: [{ full_name: 'Shifman, M.A.' }, { full_name: 'Other' }],
        },
      })
    ).toBe('Shifman, M.A. et al.');
  });

  it('formats publication info', () => {
    expect(
      referenceBrief({
        reference: {
          publication_info: {
            journal_title: 'Nucl.Phys.B',
            journal_volume: '147',
            year: 1979,
            page_start: '385',
          },
        },
      })
    ).toBe('Nucl.Phys.B 147 (1979) 385');
  });

  it('falls back to artid when there is no page start', () => {
    expect(
      referenceBrief({
        reference: {
          publication_info: { journal_title: 'Phys.Rev.B', artid: '081406' },
        },
      })
    ).toBe('Phys.Rev.B 081406');
  });

  it('skips missing publication info parts and invalid values', () => {
    expect(
      referenceBrief({ reference: { publication_info: { year: 2007 } } })
    ).toBe('(2007)');
    expect(referenceBrief({ reference: { publication_info: {} } })).toBe(
      'Empty reference'
    );
    expect(referenceBrief({ reference: { publication_info: 'text' } })).toBe(
      'Empty reference'
    );
  });

  it('joins authors and publication info', () => {
    expect(
      referenceBrief({
        reference: {
          authors: [{ full_name: 'Elliott' }],
          publication_info: { journal_title: 'Phys.Rev.B', year: 2009 },
        },
      })
    ).toBe('Elliott Phys.Rev.B (2009)');
  });

  it('displays label, arxiv eprint and first report number', () => {
    expect(
      referenceBrief({
        reference: {
          label: '12',
          title: { title: 'A title' },
          arxiv_eprint: '1234.5678',
          report_numbers: ['CERN-1', 'CERN-2'],
        },
      })
    ).toBe('[12] 1234.5678 CERN-1');
  });

  it('falls back to the first collaboration when there is no author', () => {
    expect(referenceBrief({ reference: { collaborations: ['ATLAS'] } })).toBe(
      'ATLAS'
    );
  });

  it('does not throw on a null author', () => {
    expect(referenceBrief({ reference: { authors: [null] } })).toBe(
      'Empty reference'
    );
  });

  it('shows raw misc text only when the reference is not linked', () => {
    const reference = { misc: ['raw text'] };
    expect(referenceBrief({ reference })).toBe('raw text');
    expect(
      referenceBrief({
        reference: { ...reference, label: '1' },
        record: { $ref: 'https://x/api/literature/1' },
      })
    ).toBe('[1]');
  });

  it('falls back to artid when page_start is empty', () => {
    expect(
      referenceBrief({
        reference: { publication_info: { page_start: '', artid: '081406' } },
      })
    ).toBe('081406');
  });
});

describe('referenceHref', () => {
  it('returns the record url without /api/', () => {
    expect(
      referenceHref({ record: { $ref: 'https://x/api/literature/1' } })
    ).toBe('https://x/literature/1');
  });

  it.each([undefined, {}, { record: { $ref: '' } }])(
    'returns undefined for %j',
    (reference) => {
      expect(referenceHref(reference)).toBeUndefined();
    }
  );
});
