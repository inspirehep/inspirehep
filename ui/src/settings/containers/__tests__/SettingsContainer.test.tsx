import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { fromJS, Map } from 'immutable';
import { MemoryRouter } from 'react-router-dom';

import { getStoreWithState } from '../../../fixtures/store';
import SettingsContainer from '../SettingsContainer';

describe('SettingsContainer',  () => {
  it('passes props from state', async () => {
    const store = getStoreWithState({
      settings: fromJS({
        changeEmailError: Map({ message: 'Error' }),
        changeEmailRequest: true,
      }),
      user: fromJS({
        data: {
          orcid: '123-456',
          email: 'test@o2.pl',
          profile_control_number: 12345,
        },
      }),
    });

    const { getByTestId } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/user/settings']} initialIndex={0}>
          <SettingsContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('Error')).toBeInTheDocument();
    expect(getByTestId('true test@o2.pl')).toBeInTheDocument();
    expect(getByTestId('12345')).toBeInTheDocument();
    expect(getByTestId('123-456')).toBeInTheDocument();

  });
});
