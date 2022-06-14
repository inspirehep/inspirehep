import React from 'react';
import { fromJS, List } from 'immutable';
import { mount } from 'enzyme';
// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'reac... Remove this comment to see the full error message
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import AuthorizedContainer from '../AuthorizedContainer';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('AuthorizedContainer', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('renders children if user is authorized', () => {
    const store = getStoreWithState({
      user: fromJS({
        data: {
          roles: ['superuser'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AuthorizedContainer authorizedRoles={List(['superuser', 'cataloger'])}>
          <div>SECRET DIV [work in progress]</div>
        </AuthorizedContainer>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('does not render if user is not authorized', () => {
    const store = getStoreWithState({
      user: fromJS({
        data: {
          roles: ['unauthorized'],
        },
      }),
    });
    const wrapper = mount(
      <Provider store={store}>
        <AuthorizedContainer authorizedRoles={List(['superuser'])}>
          <div>SECRET DIV [work in progress]</div>
        </AuthorizedContainer>
      </Provider>
    );
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(wrapper).toMatchSnapshot();
  });
});
