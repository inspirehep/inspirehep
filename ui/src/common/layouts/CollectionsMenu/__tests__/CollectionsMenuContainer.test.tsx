import React from 'react';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { MemoryRouter } from 'react-router-dom';

import { getStoreWithState } from '../../../../fixtures/store';
import CollectionsMenuContainer from '../CollectionsMenuContainer';
import { SUBMISSIONS_AUTHOR } from '../../../routes';
import CollectionsMenu from '../CollectionsMenu';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('CollectionsMenuContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('passes props from state', () => {
    const store = getStoreWithState({
      router: {
        location: {
          pathname: SUBMISSIONS_AUTHOR,
        },
      },
    });
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
          <CollectionsMenuContainer onHeightChange={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper.find(CollectionsMenu)).toHaveProp({
      currentPathname: SUBMISSIONS_AUTHOR,
    });
  });
});
