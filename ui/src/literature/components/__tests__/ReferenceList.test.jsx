import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import { fromJS } from 'immutable';

import ReferenceList from '../ReferenceList';
import { renderWithProviders } from '../../../fixtures/render';

describe('ReferenceList', () => {
  it('renders with references', () => {
    const references = fromJS([
      {
        titles: [{ title: 'Reference 1' }],
      },
      {
        titles: [{ title: 'Reference 2' }],
      },
    ]);
    const { asFragment } = render(
      <ReferenceList
        loading={false}
        error={null}
        references={references}
        total={1}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        query={{ size: 25, page: 1 }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders items with (page * index) key if title is absent', () => {
    const references = fromJS([
      {
        publication_info: [{ journal_title: 'Journal 1' }],
      },
      {
        authors: [{ full_name: 'Author 2' }],
      },
    ]);
    const { asFragment } = render(
      <ReferenceList
        loading={false}
        error={null}
        references={references}
        total={1}
        onPageChange={() => {}}
        onSizeChange={() => {}}
        query={{ size: 25, page: 1 }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onQueryChange and sets the correct page', () => {
    const onPageChange = jest.fn();
    const page = 2;
    const size = 25;

    const { getByText } = render(
      <ReferenceList
        loading={false}
        error={null}
        references={fromJS([{ titles: [{ title: 'Reference 1' }] }])}
        total={50}
        onPageChange={onPageChange}
        query={{ size: 25, page: 1 }}
      />
    );

    getByText('2').click();

    expect(onPageChange).toHaveBeenCalledWith(page, size);
  });

  it('does not render the list if total 0', () => {
    const { asFragment } = render(
      <ReferenceList
        loading={false}
        error={null}
        references={fromJS([{ titles: [{ title: 'Reference 1' }] }])}
        total={0}
        onPageChange={() => {}}
        query={{ size: 25, page: 1 }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with error', () => {
    const { asFragment } = renderWithProviders(
      <ReferenceList
        loading={false}
        error={fromJS({ message: 'error' })}
        references={fromJS([])}
        total={0}
        onPageChange={() => {}}
        query={{ size: 25, page: 1 }}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});

it('calls onQueryChange and sets display to 50 references/page', () => {
  const onSizeChange = jest.fn();
  const page = 1;
  const size = 25;
  const references = fromJS([
    { titles: [{ title: 'Reference -1' }] },
    { titles: [{ title: 'Reference 0' }] },
    { titles: [{ title: 'Reference 1' }] },
    { titles: [{ title: 'Reference 2' }] },
    { titles: [{ title: 'Reference 3' }] },
    { titles: [{ title: 'Reference 4' }] },
    { titles: [{ title: 'Reference 5' }] },
    { titles: [{ title: 'Reference 6' }] },
    { titles: [{ title: 'Reference 7' }] },
    { titles: [{ title: 'Reference 8' }] },
    { titles: [{ title: 'Reference 9' }] },
    { titles: [{ title: 'Reference 10' }] },
    { titles: [{ title: 'Reference 11' }] },
  ]);

  const screen = renderWithProviders(
    <ReferenceList
      loading={false}
      error={null}
      references={references}
      total={50}
      onPageChange={() => {}}
      onSizeChange={onSizeChange}
      query={{ size: 10 }}
    />
  );

  fireEvent.mouseDown(screen.getByRole('combobox'));
  fireEvent.click(screen.getByText('25 / page'));

  expect(onSizeChange).toHaveBeenCalledWith(page, size);
});
