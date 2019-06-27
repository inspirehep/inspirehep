import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import CitationListContainer from '../CitationListContainer';
import { getStoreWithState, getStore } from '../../../fixtures/store';
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
        loading: false,
        error: null,
        data: citationsData,
        total: 1,
      }),
    });
    // TODO: add utility to mount with router and provider and use it everywhere else
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CitationListContainer pidType="test" recordId={123} />
        </MemoryRouter>
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
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <CitationListContainer pidType="test" recordId={123} />
      </Provider>
    );
    const onPageDisplay = wrapper.find(CitationList).prop('onPageDisplay');
    onPageDisplay({ page: 1, pageSize: 10 });
    expect(fetchCitations).toHaveBeenCalledWith('test', 123, {
      page: 1,
      pageSize: 10,
    });
  });
});
