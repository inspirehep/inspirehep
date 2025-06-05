import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStore } from '../../../fixtures/store';
import { fetchLiteratureReferences } from '../../../actions/literature';
import ReferenceListContainer from '../ReferenceListContainer';
import { LITERATURE_REFERENCES_NS } from '../../../search/constants';

jest.mock('../../../actions/literature');
fetchLiteratureReferences.mockReturnValue(async () => {});

describe('ReferenceListContainer', () => {
  afterEach(() => {
    fetchLiteratureReferences.mockClear();
  });

  it('passes required props from state', () => {
    const store = getStore({
      literature: fromJS({
        references: [{ control_number: 1 }, { control_number: 2 }],
        loadingReferences: false,
        totalReferences: 50,
        errorReferences: false,
        pageReferences: 2,
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_REFERENCES_NS]: {
            query: { size: 10 },
            baseQuery: { size: 25, page: 1 },
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <ReferenceListContainer />
      </Provider>
    );

    expect(screen.getByText('11-20 of 50')).toBeInTheDocument();
  });

  it('calls fetchLiteratureReferences onQueryChange', async () => {
    const store = getStore({
      literature: fromJS({
        references: [{ control_number: 1 }, { control_number: 2 }],
        loadingReferences: false,
        totalReferences: 50,
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_REFERENCES_NS]: {
            query: { size: 10, page: 2, q: 'test', sort: 'mostrecent' },
            baseQuery: { size: 10, page: 1 },
          },
        },
      }),
    });

    render(
      <Provider store={store}>
        <ReferenceListContainer recordId={1} />
      </Provider>
    );

    await fireEvent.click(screen.getByTitle('Next Page'));
    expect(fetchLiteratureReferences).toHaveBeenCalledWith(1, {
      size: 10,
      page: '2',
    });
  });
});
