import { Provider } from 'react-redux';
import { fromJS } from 'immutable';

import { render } from '@testing-library/react';
import { getStore } from '../../../../fixtures/store';
import HeaderMenuContainer from '../HeaderMenuContainer';
import HeaderMenu from '../HeaderMenu';

jest.mock('../HeaderMenu', () =>
  jest.fn(() => <div data-testid="header-menu" />)
);

describe('HeaderMenuContainer', () => {
  it('passes props from state', () => {
    const store = getStore({
      user: fromJS({
        loggedIn: true,
        data: {
          profile_control_number: '1010819',
        },
      }),
    });
    render(
      <Provider store={store}>
        <HeaderMenuContainer />
      </Provider>
    );
    expect(HeaderMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        loggedIn: true,
        profileControlNumber: '1010819',
      }),
      {}
    );
  });
});
