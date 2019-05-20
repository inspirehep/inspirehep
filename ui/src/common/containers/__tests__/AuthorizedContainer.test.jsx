import React from 'react';
import { fromJS, Set } from 'immutable';
import { shallow } from 'enzyme';
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
    const wrapper = shallow(
      <AuthorizedContainer
        store={store}
        authorizedRoles={Set(['superuser', 'cataloger'])}
      >
        <div>SECRET DIV [work in progress]</div>
      </AuthorizedContainer>
    ).dive();
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
    const wrapper = shallow(
      <AuthorizedContainer store={store} authorizedRoles={Set(['superuser'])}>
        <div>SECRET DIV [work in progress]</div>
      </AuthorizedContainer>
    ).dive();
    expect(wrapper).toMatchSnapshot();
  });
});
