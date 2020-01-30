import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import CitationSummaryBoxContainer from '../CitationSummaryBoxContainer';
import CitationSummaryBox from '../../components/CitationSummaryBox';
import { LITERATURE_NS } from '../../../reducers/search';
import { CITATIONS_SUMMARY_REQUEST } from '../../../actions/actionTypes';

describe('CitationSummaryBoxContainer', () => {
  it('passes literature query', () => {
    const query = fromJS({ sort: 'mostcited', q: 'query' });
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            query,
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryBoxContainer />
      </Provider>
    );
    expect(wrapper.find(CitationSummaryBox)).toHaveProp({
      query,
    });
  });

  it('dispatches CITATIONS_SUMMARY_REQUEST on CitationSummaryBox query change', () => {
    const initialQuery = { sort: 'mostcited', q: 'cern' };
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            query: initialQuery,
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryBoxContainer />
      </Provider>
    );
    store.clearActions(); // to clear initial CITATIONS_SUMMARY_REQUEST that is dispatched on mount

    const newQuery = { experment: 'atlas' };
    const onQueryChange = wrapper
      .find(CitationSummaryBox)
      .prop('onQueryChange');
    onQueryChange(fromJS(newQuery));

    const expectedActions = [
      {
        payload: { query: newQuery },
        type: CITATIONS_SUMMARY_REQUEST,
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
