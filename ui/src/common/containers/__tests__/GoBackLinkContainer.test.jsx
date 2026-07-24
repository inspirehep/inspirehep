import { goBack } from 'redux-first-history';
import { fireEvent } from '@testing-library/react';

import GoBackLinkContainer from '../GoBackLinkContainer';
import { renderWithProviders } from '../../../fixtures/render';

vi.mock('redux-first-history', async (importOriginal) => ({
  ...(await importOriginal()),
  goBack: vi.fn(),
}));

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
