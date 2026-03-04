import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { Map } from 'immutable';
import { renderWithRouter } from '../../../../fixtures/render';
import ToggleableAbstract from '../ToggleableAbstract';

describe('ToggleableAbstract', () => {
  it('does not render button when abstract is missing', () => {
    renderWithRouter(<ToggleableAbstract />);

    expect(
      screen.queryByRole('button', { name: /show abstract/i })
    ).not.toBeInTheDocument();
  });

  it('toggles abstract visibility', () => {
    renderWithRouter(
      <ToggleableAbstract abstract={Map({ value: 'Sample abstract text.' })} />
    );

    const button = screen.getByRole('button', { name: /show abstract/i });
    expect(
      screen.queryByText(/Sample abstract text./i)
    ).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText(/Sample abstract text./i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /hide abstract/i })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /hide abstract/i }));
    expect(
      screen.queryByText(/Sample abstract text./i)
    ).not.toBeInTheDocument();
  });
});
