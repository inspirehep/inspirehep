import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import { getStore } from '../../../../fixtures/store';
import Header from '../Header';

describe('Header', () => {
  it('renders with search box if it is not on home or submission', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <Header
            isSubmissionsPage={false}
            isHomePage={false}
            isBetaPage={false}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(getByTestId('searchbox')).toBeInTheDocument();
  });

  it('renders without search box if it is on homepage `/`', () => {
    const { queryByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <Header isSubmissionsPage={false} isHomePage isBetaPage={false} />
        </MemoryRouter>
      </Provider>
    );
    expect(queryByTestId('searchbox')).toBeNull();
  });

  it('renders without search box if it is on submission page', () => {
    const { queryByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <Header isSubmissionsPage isHomePage={false} isBetaPage={false} />
        </MemoryRouter>
      </Provider>
    );
    expect(queryByTestId('searchbox')).toBeNull();
  });

  it('renders with Banner and Ribbon if it is on beta page', () => {
    const { getByText } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <Header isSubmissionsPage={false} isHomePage={false} isBetaPage />
        </MemoryRouter>
      </Provider>
    );
    expect(getByText('Beta')).toBeInTheDocument();
  });
});
