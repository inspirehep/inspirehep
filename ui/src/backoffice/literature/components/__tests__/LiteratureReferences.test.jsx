import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LiteratureReferences from '../LiteratureReferences';

const SAMPLE_REFERENCES = [
  {
    record: { $ref: 'https://inspirehep.net/api/literature/2736218' },
    raw_refs: [
      {
        value:
          '[1] A. Gruber, A. Dräbenstedt, C. Tietz, L. Fleury, J. Wrachtrup, and C. Von Borczyskowski, Science 276, 2012 (1997).',
        schema: 'text',
        source: 'arXiv',
      },
    ],
    reference: {
      misc: [
        'A. Dräbenstedt, C. Tietz, L. Fleury, J. Wrachtrup, and C. Von Borczyskowski',
      ],
      label: '1',
      authors: [{ full_name: 'Gruber, A.' }],
      publication_info: {
        year: 1997,
        artid: '2012',
        page_start: '2012',
        journal_title: 'Science',
        journal_volume: '276',
      },
    },
  },
];

describe('LiteratureReferences', () => {
  test('renders nothing when references is undefined/null', () => {
    render(<LiteratureReferences />);
    expect(
      screen.queryByTestId('literature-references')
    ).not.toBeInTheDocument();
  });

  test('renders a table with one row and correct cell values', () => {
    render(<LiteratureReferences references={SAMPLE_REFERENCES} />);

    const wrapper = screen.getByTestId('literature-references');

    expect(wrapper).toBeInTheDocument();
    expect(screen.getByText('Gruber, A.')).toBeInTheDocument();
    expect(screen.getByText('2012')).toBeInTheDocument();
    expect(screen.getByText('1997')).toBeInTheDocument();
    expect(
      screen.getByText(
        'A. Dräbenstedt, C. Tietz, L. Fleury, J. Wrachtrup, and C. Von Borczyskowski'
      )
    ).toBeInTheDocument();
  });

  test('renders placeholders (—) for missing values', () => {
    const references = [
      {
        reference: {
          authors: [],
          misc: [],
          publication_info: {},
        },
      },
    ];

    render(<LiteratureReferences references={references} />);
    expect(screen.getAllByText('—')[0]).toBeInTheDocument();
    expect(screen.getAllByText('—')[1]).toBeInTheDocument();
    expect(screen.getAllByText('—')[2]).toBeInTheDocument();
    expect(screen.getAllByText('—')[3]).toBeInTheDocument();
  });

  test('renders multiple rows when multiple references are provided', () => {
    const references = [
      ...SAMPLE_REFERENCES,
      {
        reference: {
          authors: [{ full_name: 'Doe, J.' }, { full_name: 'Smith, A.' }],
          misc: ['Extra info'],
          publication_info: { year: 2001, artid: 'X42' },
        },
      },
    ];

    render(<LiteratureReferences references={references} />);

    expect(screen.getByText('Doe, J.; Smith, A.')).toBeInTheDocument();
    expect(screen.getByText('X42')).toBeInTheDocument();
    expect(screen.getByText('2001')).toBeInTheDocument();
    expect(screen.getByText('Extra info')).toBeInTheDocument();
  });
});
