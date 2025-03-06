import React from 'react';

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import ErrorAlert from '../ErrorAlert';
import { getStore } from '../../../fixtures/store';

describe('ErrorAlert', () => {
  it('renders with custom message', () => {
    const { getByText } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ErrorAlert message="Terrible thing is happening!" />
        </MemoryRouter>
      </Provider>
    );
    expect(getByText('Terrible thing is happening!')).toBeInTheDocument();
  });

  it('renders with default message', () => {
    const { getByText } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ErrorAlert />
        </MemoryRouter>
      </Provider>
    );
    expect(getByText('Something went wrong')).toBeInTheDocument();
  });
});
