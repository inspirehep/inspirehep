import React from 'react';
import { shallow } from 'enzyme';
import { fromJS } from 'immutable';

import { getStoreWithState } from '../../../../fixtures/store';
import Header from '../Header';

describe('Header', () => {
  it('renders with search box if it is not on home', () => {
    const store = getStoreWithState({
      router: {
        location: {
          pathname: '/not-home',
        },
      },
    });
    const wrapper = shallow(<Header store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('renders without search box if it is on homepage `/`', () => {
    const store = getStoreWithState({
      router: {
        location: {
          pathname: '/',
        },
      },
    });
    const wrapper = shallow(<Header store={store} />).dive();
    expect(wrapper).toMatchSnapshot();
  });

  it('does not show authorized tool links if logged in user is not superuser nor cataloger', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['betauser'],
        },
      }),
    });

    const wrapper = shallow(<Header store={store} />).dive();

    expect(wrapper).toMatchSnapshot();
  });

  it('shows authorized tool links if logged in user is cataloger', () => {
    const store = getStoreWithState({
      user: fromJS({
        loggedIn: true,
        data: {
          roles: ['superuser'],
        },
      }),
    });

    const wrapper = shallow(<Header store={store} />).dive();

    expect(wrapper).toMatchSnapshot();
  });
});
