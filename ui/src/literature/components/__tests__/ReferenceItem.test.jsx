import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ReferenceItem from '../ReferenceItem';

describe('ReferenceItem', () => {
  it('renders with full reference', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
      arxiv_eprints: [{ value: '123456' }],
      control_number: 12345,
      label: 123,
      authors: [{ full_name: 'Author' }],
      publication_info: [
        {
          journal_title: 'Journal',
        },
      ],
      dois: [{ value: '123456.12345' }],
      urls: [{ value: 'https://dude.guy' }],
      collaborations: [{ value: 'Test Collab.' }],
      collaborations_with_suffix: [{ value: 'Test Group' }],
    });
    const { asFragment } = render(
      <MemoryRouter>
        <ReferenceItem reference={reference} reference_index="123" />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders unlinked reference (no control_number)', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
      authors: [{ full_name: 'Author' }],
      arxiv_eprints: [{ value: '123456' }],
      publication_info: [
        {
          journal_title: 'Journal',
        },
      ],
      dois: [{ value: '123456.12345' }],
      urls: [{ value: 'https://dude.guy' }],
      collaborations: [{ value: 'Test Collab.' }],
      collaborations_with_suffix: [{ value: 'Test Group' }],
    });
    const { asFragment } = render(
      <MemoryRouter>
        <ReferenceItem reference={reference} reference_index="123" />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders misc if present', () => {
    const reference = fromJS({
      misc: 'A Misc',
    });
    const { asFragment } = render(
      <MemoryRouter>
        <ReferenceItem reference={reference} reference_index="123" />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not render misc if title present', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
    });
    const { asFragment } = render(
      <MemoryRouter>
        <ReferenceItem reference={reference} reference_index="123" />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders without edit button if disableEdit', () => {
    const reference = fromJS({
      titles: [{ title: 'Title' }],
    });
    const { asFragment } = render(
      <MemoryRouter>
        <ReferenceItem
          reference={reference}
          reference_index="123"
          disableEdit
        />
      </MemoryRouter>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
