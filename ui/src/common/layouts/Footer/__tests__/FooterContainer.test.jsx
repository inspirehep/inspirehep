import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { fromJS } from 'immutable';

import { render } from '@testing-library/react';
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
    const { getByRole } = render(
      <Provider store={store}>
        <MemoryRouter>
          <FooterContainer />
        </MemoryRouter>
      </Provider>
    );

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
    const { queryByRole } = render(
      <Provider store={store}>
        <MemoryRouter>
          <FooterContainer />
        </MemoryRouter>
      </Provider>
    );

    expect(queryByRole('link', { name: 'Holdingpen' })).not.toBeInTheDocument();
    expect(
      queryByRole('link', { name: 'Author list' })
    ).not.toBeInTheDocument();
  });
});
