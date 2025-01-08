import React from 'react';
import { render } from '@testing-library/react';
import { List, Map, fromJS } from 'immutable';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import ReferenceDiffInterface from '../ReferenceDiffInterface';
import { getStore } from '../../../../fixtures/store';

describe('ReferenceDiffInterface', () => {
  const authors = List([]);
  const record = Map({
    metadata: fromJS({
      titles: [{ title: 'Title' }],
      date: '2022-01-01',
      control_number: 123456,
      thesis_info: null,
      isbns: null,
      imprints: null,
      publication_info: null,
      conference_info: null,
      document_type: null,
      arxiv_eprints: null,
      dois: null,
      report_numbers: null,
      number_of_pages: null,
      external_system_identifiers: null,
      accelerator_experiments: null,
      fulltext_links: null,
      urls: null,
      collaborations: [{ value: 'CMS' }],
      collaborations_with_suffix: [{ value: 'CMS' }],
      linked_books: null,
      book_series: null,
      pdg_keywords: null,
      author_count: 1,
      citation_count: 1,
      persistent_identifiers: null,
      can_edit: false,
      deleted: false,
      dataset_links: null,
    }),
  });
  const supervisors = List([]);
  const loggedIn = false;
  const hasAuthorProfile = false;
  const references = List([]);
  const referenceId = 1;
  const previousReference = fromJS({
    publication_info: [
      {
        journal_title: 'Journal',
      },
    ],
    dois: [{ value: '123456.12345' }],
    label: '1',
    raw_ref:
      '1) N. P.Armitage, E. J.Mele, and A.Vishwanath, Rev…. 90, 015001 (2018). 10.1103/RevModPhys.90.015001',
    authors: [{ full_name: 'Author' }],
  });
  const currentReference = fromJS({
    publication_info: [
      {
        journal_title: 'Journal2',
      },
    ],
    dois: [{ value: '123456.12345' }],
    label: '1',
    raw_ref: '3) New',
    control_number: 1234,
    authors: [{ full_name: 'Author2' }],
  });
  const loading = false;
  const error = undefined;

  it('should render', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <ReferenceDiffInterface
            authors={authors}
            record={record}
            supervisors={supervisors}
            loggedIn={loggedIn}
            hasAuthorProfile={hasAuthorProfile}
            references={references}
            referenceId={referenceId}
            previousReference={previousReference as Map<string, any>}
            currentReference={currentReference as Map<string, any>}
            loading={loading}
            error={error}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render with error', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <ReferenceDiffInterface
            authors={authors}
            record={record}
            supervisors={supervisors}
            loggedIn={loggedIn}
            hasAuthorProfile={hasAuthorProfile}
            references={references}
            referenceId={referenceId}
            previousReference={previousReference as Map<string, any>}
            currentReference={currentReference as Map<string, any>}
            loading={loading}
            error={Map({ message: 'Error message' })}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('should render without previous reference if it is unlinked', () => {
    const previousReferenceWithoutControlNumber = fromJS({
      publication_info: [
        {
          journal_title: 'Journal2',
        },
      ],
      dois: [{ value: '123456.12345' }],
      label: '1',
      raw_ref: '3) New',
      authors: [{ full_name: 'Author2' }],
    });

    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']} initialIndex={0}>
          <ReferenceDiffInterface
            authors={authors}
            record={record}
            supervisors={supervisors}
            loggedIn={loggedIn}
            hasAuthorProfile={hasAuthorProfile}
            references={references}
            referenceId={referenceId}
            previousReference={
              previousReferenceWithoutControlNumber as Map<string, any>
            }
            currentReference={currentReference as Map<string, any>}
            loading={loading}
            error={error}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
