import React from 'react';
import { fromJS } from 'immutable';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../fixtures/render';
import ErrorAlertOrChildren from '../ErrorAlertOrChildren';

describe('ErrorAlertOrChildren', () => {
  it('renders error if present', () => {
    const { getByText, getByRole } = renderWithProviders(
      <ErrorAlertOrChildren error={fromJS({ message: 'Error' })}>
        Nope
      </ErrorAlertOrChildren>
    );

    expect(getByText('Error')).toBeInTheDocument();
    expect(getByRole('button', { name: 'go back' })).toBeInTheDocument();
  });

  it('renders children without error', () => {
    const { getByText } = renderWithProviders(
      <ErrorAlertOrChildren error={null}>
        <div>Test</div>
      </ErrorAlertOrChildren>
    );

    expect(getByText('Test')).toBeInTheDocument();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });
});
