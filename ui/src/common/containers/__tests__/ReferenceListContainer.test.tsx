import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import { fetchLiteratureReferences } from '../../../actions/literature';
import ReferenceList from '../../../literature/components/ReferenceList';
import ReferenceListContainer from '../ReferenceListContainer';
import { LITERATURE_REFERENCES_NS } from '../../../search/constants';

jest.mock('../../../actions/literature');
fetchLiteratureReferences.mockReturnValue(async () => {});

describe('ReferenceListContainer', () => {
  afterEach(() => {
    fetchLiteratureReferences.mockClear();
  });

  it('passes required props from state', () => {
    const store = getStoreWithState({
      literature: fromJS({
        references: [{ control_number: 1 }, { control_number: 2 }],
        loadingReferences: true,
        totalReferences: 50,
        errorReferences: { message: 'Error' },
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
    const wrapper = mount(
      <Provider store={store}>
        <ReferenceListContainer />
      </Provider>
    );
    expect(wrapper.find(ReferenceList)).toHaveProp({
      query: { size: 10, page: 2 },
      references: fromJS([{ control_number: 1 }, { control_number: 2 }]),
      loading: true,
      total: 50,
      error: fromJS({ message: 'Error' }),
    });
  });

  it('calls fetchLiteratureReferences onQueryChange', () => {
    const store = getStoreWithState({
      literature: fromJS({
        references: [{ control_number: 1 }, { control_number: 2 }],
        loadingReferences: true,
        totalReferences: 50,
        errorReferences: { message: 'Error' },
      }),
      search: fromJS({
        namespaces: {
          [LITERATURE_REFERENCES_NS]: {
            query: { size: 10, page: 2, q: 'dude', sort: 'mostrecent' },
            baseQuery: { size: 25, page: 1 },
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <ReferenceListContainer recordId={1} />
      </Provider>
    );
    const onQueryChange = wrapper.find(ReferenceList).prop('onQueryChange');
    const query = { page: 3 };
    onQueryChange(query);
    expect(fetchLiteratureReferences).toHaveBeenCalledWith(1, query);
  });
});
