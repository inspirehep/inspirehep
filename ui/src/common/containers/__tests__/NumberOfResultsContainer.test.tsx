import React from 'react';
import { mount } from 'enzyme';
import { fromJS } from 'immutable';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import NumberOfResultsContainer from '../NumberOfResultsContainer';
import NumberOfResults from '../../components/NumberOfResults';
import { AUTHOR_PUBLICATIONS_NS } from '../../../search/constants';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('NumberOfResultsContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes search namepspace total state', () => {
    const namespace = AUTHOR_PUBLICATIONS_NS;
    const store = getStoreWithState({
      search: fromJS({
        namespaces: {
          [namespace]: {
            total: 5,
          },
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <NumberOfResultsContainer namespace={namespace} />
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(NumberOfResults)).toHaveProp({ numberOfResults: 5 });
  });
});
