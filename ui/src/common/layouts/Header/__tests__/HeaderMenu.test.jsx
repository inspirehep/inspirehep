import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../../fixtures/store';
import HeaderMenu from '../HeaderMenu';

describe('HeaderMenu', () => {
  it('does not show some tool links if logged in user is not superuser nor cataloger', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['betauser'],
        },
      }),
    });

    const wrapper = shallow(<HeaderMenu store={store} />).dive();

    expect(wrapper).toMatchSnapshot();
  });

  it('shows all tool links if logged in user is cataloger', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['cataloger'],
        },
      }),
    });

    const wrapper = shallow(<HeaderMenu store={store} />).dive();

    expect(wrapper).toMatchSnapshot();
  });

  it('displays Login link instead of My Account if user is not logged in', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: false,
      }),
    });

    const wrapper = shallow(<HeaderMenu store={store} />).dive();

    expect(wrapper).toMatchSnapshot();
  });
});
