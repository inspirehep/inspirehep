import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import Home from '..';
import { getStore } from '../../fixtures/store';

describe('Home', () => {
  it('renders home page', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
