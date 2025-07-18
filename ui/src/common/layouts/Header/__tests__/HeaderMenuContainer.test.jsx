import { fromJS } from 'immutable';

import { getStore } from '../../../../fixtures/store';
import HeaderMenuContainer from '../HeaderMenuContainer';
import HeaderMenu from '../HeaderMenu';
import { renderWithProviders } from '../../../../fixtures/render';

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
    renderWithProviders(<HeaderMenuContainer />, { store });
    expect(HeaderMenu).toHaveBeenCalledWith(
      expect.objectContaining({
        loggedIn: true,
        profileControlNumber: '1010819',
      }),
      {}
    );
  });
});
