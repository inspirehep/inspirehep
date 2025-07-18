import React from 'react';
import { render } from '@testing-library/react';
import { fromJS, Map } from 'immutable';
import { renderWithProviders } from '../../../fixtures/render';
import { getStore } from '../../../fixtures/store';
import SettingsContainer from '../SettingsContainer';

describe('SettingsContainer', () => {
  it('passes props from state', async () => {
    const store = getStore({
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

    const { getByTestId } = renderWithProviders(<SettingsContainer />, {
      route: '/user/settings',
      store,
    });

    expect(getByTestId('Error')).toBeInTheDocument();
    expect(getByTestId('true test@o2.pl')).toBeInTheDocument();
    expect(getByTestId('12345')).toBeInTheDocument();
    expect(getByTestId('123-456')).toBeInTheDocument();
  });
});
