import React from 'react';
import { fromJS, List } from 'immutable';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { getStoreWithState } from '../../../fixtures/store';
import AuthorizedContainer from '../AuthorizedContainer';

describe('AuthorizedContainer', () => {
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
    expect(wrapper).toMatchSnapshot();
  });

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
    expect(wrapper).toMatchSnapshot();
  });
});
