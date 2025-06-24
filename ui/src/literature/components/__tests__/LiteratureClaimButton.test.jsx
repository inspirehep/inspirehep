import React from 'react';
import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';

import LiteratureClaimButton from '../LiteratureClaimButton';
import { getStore } from '../../../fixtures/store';

describe('LiteratureClaimButton', () => {
  it('renders disabled when user is not logged in', () => {
    const { asFragment } = render(
      <LiteratureClaimButton
        loggedIn={false}
        hasAuthorProfile={false}
        authors={fromJS([])}
        controlNumber={123456}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders disabled when user is logged in but doesnt have profile', () => {
    const { asFragment } = render(
      <LiteratureClaimButton
        loggedIn
        hasAuthorProfile={false}
        authors={fromJS([])}
        controlNumber={123456}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders disabled when user is logged in and has profile but there is no authors', () => {
    const { asFragment } = render(
      <LiteratureClaimButton
        loggedIn
        hasAuthorProfile
        authors={fromJS([])}
        controlNumber={123456}
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });
  it('renders enabled', () => {
    const authors = fromJS([
      {
        full_name: 'Test, Guy 1',
      },
      {
        full_name: 'Test, Guy 2',
      },
      {
        full_name: 'Test, Guy 3',
      },
    ]);
    const { asFragment } = render(
      <Provider store={getStore()}>
        <LiteratureClaimButton
          loggedIn
          hasAuthorProfile
          authors={authors}
          controlNumber={123456}
        />
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
