import React from 'react';
import { render } from '@testing-library/react';
import { fromJS, List } from 'immutable';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { getStore } from '../../../fixtures/store';
import LiteratureItemContainer from '../LiteratureItemContainer';
import { CITE_FORMAT_PREFERENCE } from '../../../reducers/user';

jest.mock('../../components/LiteratureItem', () => (props) => (
  <div data-testid="literature-item" data-props={JSON.stringify(props)}>
    LiteratureItem Mock
  </div>
));

describe('LiteratureItemContainer', () => {
  it('renders with props', () => {
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

    const store = getStore({
      user: fromJS({
        preferences: {
          [CITE_FORMAT_PREFERENCE]: 'application/x-bibtex',
        },
        loggedIn: true,
        data: {
          profile_control_number: '1010819',
        },
      }),
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter>
          <LiteratureItemContainer
            searchRank={1}
            metadata={metadata}
            isCatalogerLoggedIn
          />
        </MemoryRouter>
      </Provider>
    );

    const literatureItem = getByTestId('literature-item');
    const props = JSON.parse(literatureItem.getAttribute('data-props'));

    expect(props).toEqual({
      loggedIn: true,
      hasAuthorProfile: true,
      metadata: metadata.toJS(),
      isCatalogerLoggedIn: true,
      searchRank: 1,
    });
  });
});
