import React from 'react';
import { render } from '@testing-library/react';
import { fromJS, List } from 'immutable';
import { Provider } from 'react-redux';

import { MemoryRouter } from 'react-router-dom';
import LiteratureItem from '../LiteratureItem';
import { LITERATURE_NS } from '../../../search/constants';
import { getStore } from '../../../fixtures/store';

describe('LiteratureItem', () => {
  it('renders with all props set, including sub props', () => {
    const metadata = fromJS({
      date: 'Jun 7, 1993',
      titles: [{ title: 'test' }],
      authors: [{ full_name: 'Test, Author' }],
      arxiv_eprints: [{ value: '1234567890' }],
      fulltext_links: [{ value: 'https://fulltext.cern/pdf/1' }],
      urls: [{ value: 'http://lss.fnal.gov/conf/C8206282/pg209.pdf' }],
      control_number: 12345,
      citation_count: 12435,
      publication_info: [{ journal_title: 'Test Jornal' }],
      collaborations: [{ value: 'CMS' }],
      collaborations_with_suffix: [{ value: 'CMS Group' }],
      conference_info: [
        {
          acronyms: ['MG15', 'SAP16'],
          titles: [
            {
              title:
                '15th Marcel Grossmann Meeting on Recent Developments in Theoretical and Experimental General Relativity, Astrophysics, and Relativistic Field Theories',
            },
          ],
        },
      ],
      fulltext_highlight: List(['A snippet of <em>fulltext</em>']),
    });
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <LiteratureItem metadata={metadata} searchRank={2} />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('does not arxiv pdf download action if there is no eprint value', () => {
    const metadata = fromJS({
      control_number: 12345,
      titles: [{ title: 'test' }],
    });
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <LiteratureItem metadata={metadata} searchRank={1} />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders 0 citations if it does not exist', () => {
    const metadata = fromJS({
      control_number: 12345,
      titles: [{ title: 'test' }],
    });
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <LiteratureItem metadata={metadata} searchRank={2} />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders publication info when book exists but publication title not', () => {
    const metadata = fromJS({
      control_number: 12345,
      titles: [{ title: 'test' }],
      publication_info: [
        {
          year: 2021,
          journal_volume: '9783030795993',
        },
      ],
      document_type: ['book'],
      book_series: [
        {
          title: 'SpringerBriefs in Physics',
        },
      ],
    });
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <LiteratureItem
            metadata={metadata}
            searchRank={3}
            page="Literature"
          />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with literature item claiming button on literature search page', () => {
    const metadata = fromJS({
      control_number: 12345,
      titles: [{ title: 'test' }],
      publication_info: [
        {
          year: 2021,
          journal_volume: '9783030795993',
        },
      ],
      document_type: ['book'],
      book_series: [
        {
          title: 'SpringerBriefs in Physics',
        },
      ],
    });
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <LiteratureItem
            metadata={metadata}
            searchRank={3}
            loggedIn
            hasAuthorProfile
            namespace={LITERATURE_NS}
            page="Literature"
          />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
