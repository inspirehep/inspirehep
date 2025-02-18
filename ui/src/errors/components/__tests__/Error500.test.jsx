import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import Error500 from '../Error500';
import { getStore } from '../../../fixtures/store';

describe('Error500', () => {
  it('renders Error500', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <Error500 />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
