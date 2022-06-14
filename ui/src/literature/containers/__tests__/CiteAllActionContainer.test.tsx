import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../fixtures/store';
import CiteAllActionContainer from '../CiteAllActionContainer';
import CiteAllAction from '../../components/CiteAllAction';
import { LITERATURE_NS } from '../../../search/constants';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CiteAllActionContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes literature namespace query and number of results', () => {
    const namespace = LITERATURE_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            query: { sort: 'mostcited', q: 'query' },
            total: 11,
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <CiteAllActionContainer namespace={namespace} />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(CiteAllAction)).toHaveProp({
      query: { sort: 'mostcited', q: 'query' },
    });
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(CiteAllAction)).toHaveProp({ numberOfResults: 11 });
  });
});
