import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import CitationListContainer from '../CitationListContainer';
import { getStoreWithState } from '../../../fixtures/store';
import { fetchCitations } from '../../../actions/citations';
import CitationList from '../../components/CitationList';

jest.mock('../../../actions/citations');

describe('CitationListContainer', () => {
  beforeAll(() => {
    fetchCitations.mockReturnValue(async () => {});
  });

  afterEach(() => {
    fetchCitations.mockClear();
  });

  it('passes props from state', () => {
    // FIXME: requires proper data that's why it is left empty for now
    const citationsData = fromJS([]);
    const store = getStoreWithState({
      citations: fromJS({
        query: { size: 10, page: 2, q: 'dude', sort: 'mostrecent' },
        loading: false,
        error: null,
        data: citationsData,
        total: 1,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CitationListContainer recordId={123} />
      </Provider>
    );
    expect(wrapper.find(CitationList)).toHaveProp({
      citations: citationsData,
      total: 1,
      loading: false,
      error: null,
    });
  });

  it('calls fetchCitations on page display', () => {
    const citationsData = fromJS([]);
    const store = getStoreWithState({
      citations: fromJS({
        query: { size: 10, page: 2, q: 'dude', sort: 'mostrecent' },
        loading: false,
        error: null,
        data: citationsData,
        total: 1,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CitationListContainer recordId={123} />
      </Provider>
    );
    const onQueryChange = wrapper.find(CitationList).prop('onQueryChange');
    const query = { page: 3 };
    onQueryChange(query);
    expect(fetchCitations).toHaveBeenCalledWith(123, query);
  });
});
