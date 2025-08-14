import React from 'react';
import { goBack } from 'connected-react-router';
import { fireEvent } from '@testing-library/react';

import GoBackLinkContainer from '../GoBackLinkContainer';
import { renderWithProviders } from '../../../fixtures/render';

jest.mock('connected-react-router');

goBack.mockReturnValue(async () => {});

describe('GoBackLinkContainer', () => {
  afterEach(() => {
    goBack.mockClear();
  });

  it('render with custom children', () => {
    const { getByRole } = renderWithProviders(
      <GoBackLinkContainer>custom</GoBackLinkContainer>
    );

    expect(getByRole('button')).toBeInTheDocument();
  });

  it('calls goBack() on click', () => {
    const { getByTestId } = renderWithProviders(<GoBackLinkContainer />);

    const goBackLink = getByTestId('go-back-link');
    fireEvent.click(goBackLink);

    expect(goBack).toHaveBeenCalled();
  });
});
