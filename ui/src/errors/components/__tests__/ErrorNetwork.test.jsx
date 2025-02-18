import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { getStore } from '../../../fixtures/store';
import ErrorNetwork from '../ErrorNetwork';

describe('ErrorNetwork', () => {
  it('renders ErrorNetwork', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ErrorNetwork />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
