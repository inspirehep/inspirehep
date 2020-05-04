import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import CitationSummaryBoxContainer from '../CitationSummaryBoxContainer';
import CitationSummaryBox from '../../components/CitationSummaryBox';
import { LITERATURE_NS } from '../../../reducers/search';
import {
  CITATIONS_SUMMARY_REQUEST,
  UI_CHANGE_EXCLUDE_SELF_CITATIONS,
} from '../../../actions/actionTypes';

describe('CitationSummaryBoxContainer', () => {
  it('passes literature query and excludeSelfCitations', () => {
    const query = fromJS({ sort: 'mostcited', q: 'query' });
    const excludeSelfCitations = true;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [LITERATURE_NS]: {
            query,
          },
        },
      }),
      ui: fromJS({
        excludeSelfCitations,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryBoxContainer namespace={LITERATURE_NS} />
      </Provider>
    );
    expect(wrapper.find(CitationSummaryBox)).toHaveProp({
      query,
      excludeSelfCitations,
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
        <CitationSummaryBoxContainer namespace={LITERATURE_NS} />
      </Provider>
    );
    store.clearActions(); // to clear initial CITATIONS_SUMMARY_REQUEST that is dispatched on mount

    const newQuery = { experiment: 'atlas' };
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

  it('dispatches CITATIONS_SUMMARY_REQUEST with exclude-self-citations on CitationSummaryBox query change', () => {
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
        <CitationSummaryBoxContainer namespace={LITERATURE_NS} />
      </Provider>
    );
    store.clearActions(); // to clear initial CITATIONS_SUMMARY_REQUEST that is dispatched on mount

    const newQuery = { experiment: 'atlas' };
    const excludeSelfCitations = true;
    const onQueryChange = wrapper
      .find(CitationSummaryBox)
      .prop('onQueryChange');
    onQueryChange(fromJS(newQuery), excludeSelfCitations);

    const expectedQuery = newQuery;
    expectedQuery['exclude-self-citations'] = true;

    const expectedActions = [
      {
        payload: { query: expectedQuery },
        type: CITATIONS_SUMMARY_REQUEST,
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });

  it('dispatches UI_CHANGE_EXCLUDE_SELF_CITATIONS on CitationSummaryBox checkbox change', () => {
    const initialExcludeSS = false;
    const store = getStoreWithState({
      ui: fromJS({
        excludeSelfCitations: initialExcludeSS,
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CitationSummaryBoxContainer namespace={LITERATURE_NS} />
      </Provider>
    );
    store.clearActions(); // to clear initial CITATIONS_SUMMARY_REQUEST that is dispatched on mount

    const newExcludeSS = true;
    const onExcludeSelfCitationsChange = wrapper
      .find(CitationSummaryBox)
      .prop('onExcludeSelfCitationsChange');
    onExcludeSelfCitationsChange(newExcludeSS);

    const expectedActions = [
      {
        payload: { isEnabled: newExcludeSS },
        type: UI_CHANGE_EXCLUDE_SELF_CITATIONS,
      },
    ];
    expect(store.getActions()).toEqual(expectedActions);
  });
});
