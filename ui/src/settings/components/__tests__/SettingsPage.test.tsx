import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import SettingsPage from '../SettingsPage';
import { getStoreWithState } from '../../../fixtures/store';

describe('SettingsPage', () => {
  const store = getStoreWithState({
    user: fromJS({
      loggedIn: true,
      data: {
        roles: ['cataloger'],
      },
    }),
  });

  it('renders page', () => {
    const { asFragment } = render(
      <SettingsPage
        loading={false}
        onChangeEmailAddress={jest.fn()}
        userEmail="test@test.pl"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders page with error', () => {
    const error = fromJS({
      error: {
        status: 404,
        message: 'This is an error yo',
      },
    });

    const { asFragment } = render(
      <SettingsPage
        loading={false}
        error={error}
        onChangeEmailAddress={jest.fn()}
        userEmail="test@test.pl"
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders page with authors profile section when user has author profile', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/user/settings']} initialIndex={0}>
          <SettingsPage
            profileControlNumber={1234567}
            loading={false}
            onChangeEmailAddress={jest.fn()}
            userEmail="test@test.pl"
          />
        </MemoryRouter>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders page with orcid section when user has orcid profile', () => {
    const { asFragment } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/user/settings']} initialIndex={0}>
          <SettingsPage
            profileControlNumber={1234567}
            userOrcid="1234567"
            loading={false}
            onChangeEmailAddress={jest.fn()}
            userEmail="test@test.pl"
          />
        </MemoryRouter>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
