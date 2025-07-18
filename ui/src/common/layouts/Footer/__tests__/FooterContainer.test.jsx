import { fromJS } from 'immutable';
import { renderWithProviders } from '../../../../fixtures/render';
import { getStore } from '../../../../fixtures/store';
import FooterContainer from '../FooterContainer';

describe('FooterContainer', () => {
  it('passes props from state when cataloger', () => {
    const store = getStore({
      user: fromJS({
        data: {
          roles: ['cataloger'],
        },
      }),
    });
    const { getByRole } = renderWithProviders(<FooterContainer />, { store });

    expect(getByRole('link', { name: 'Holdingpen' })).toBeInTheDocument();
    expect(getByRole('link', { name: 'Author list' })).toBeInTheDocument();
  });

  it('passes props from state when not cataloger', () => {
    const store = getStore({
      user: fromJS({
        data: {
          roles: ['not-cataloger'],
        },
      }),
    });
    const { queryByRole } = renderWithProviders(<FooterContainer />, { store });

    expect(queryByRole('link', { name: 'Holdingpen' })).not.toBeInTheDocument();
    expect(
      queryByRole('link', { name: 'Author list' })
    ).not.toBeInTheDocument();
  });
});
