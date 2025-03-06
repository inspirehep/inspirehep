import React from 'react';
import { fromJS } from 'immutable';

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { getStore } from '../../../fixtures/store';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';

describe('ErrorAlertOrChildren', () => {
  it('renders error if present', () => {
    const { getByText, getByRole } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ErrorAlertOrChildren error={fromJS({ message: 'Error' })}>
            Nope
          </ErrorAlertOrChildren>
        </MemoryRouter>
      </Provider>
    );

    expect(getByText('Error')).toBeInTheDocument();
    expect(getByRole('button', { name: 'go back' })).toBeInTheDocument();
  });

  it('renders children without error', () => {
    const { getByText } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ErrorAlertOrChildren error={null}>
            <div>Test</div>
          </ErrorAlertOrChildren>
        </MemoryRouter>
      </Provider>
    );

    expect(getByText('Test')).toBeInTheDocument();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });
});
