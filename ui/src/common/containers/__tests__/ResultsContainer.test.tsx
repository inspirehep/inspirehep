import React from 'react';
import { mount } from 'enzyme';
import { fromJS, List } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import ResultsContainer from '../ResultsContainer';
import SearchResults from '../../components/SearchResults';
import { JOBS_NS } from '../../../search/constants';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('ResultsContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes results from state', () => {
    const namespace = JOBS_NS;
    const results = fromJS([
      {
        id: 1,
        value: 'value1',
      },
      {
        id: 2,
        value: 'value2',
      },
    ]);
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            results,
            query: { page: 1, size: 25 },
          },
        },
        user: { roles: List() },
      }),
    });
    const renderItem = (result: any) => <span>{result.get('value')}</span>;

    const wrapper = mount(
      <Provider store={store}>
        <ResultsContainer namespace={namespace} renderItem={renderItem} />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(SearchResults)).toHaveProp({
      results,
      isCatalogerLoggedIn: false,
      page: 1,
      pageSize: 25,
      renderItem,
    });
  });
});
