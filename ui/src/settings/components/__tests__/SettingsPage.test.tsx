import React from 'react';
import { fromJS, Map } from 'immutable';
import { render } from '@testing-library/react';

import SettingsPage from '../SettingsPage';
import { renderWithProviders } from '../../../fixtures/render';
import { getStore } from '../../../fixtures/store';

describe('SettingsPage', () => {
  const store = getStore({
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
    const error = Map({
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
    const { asFragment } = renderWithProviders(
      <SettingsPage
        profileControlNumber={1234567}
        loading={false}
        onChangeEmailAddress={jest.fn()}
        userEmail="test@test.pl"
      />,
      {
        route: '/user/settings',
        store,
      }
    );

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders page with orcid section when user has orcid profile', () => {
    const { asFragment } = renderWithProviders(
      <SettingsPage
        profileControlNumber={1234567}
        userOrcid="1234567"
        loading={false}
        onChangeEmailAddress={jest.fn()}
        userEmail="test@test.pl"
      />,
      {
        route: '/user/settings',
        store,
      }
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
