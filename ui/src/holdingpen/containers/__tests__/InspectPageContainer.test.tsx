import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import { getStore } from '../../../fixtures/store';
import InspectPageContainer from '../InspectPageContainer/InspectPageContainer';

describe('InspectPageContainer', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen/inspect/1']}>
          <InspectPageContainer match={{ params: { id: 1 } }} />
        </MemoryRouter>
      </Provider>
    );
  });

  it('renders the InspectPage component', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/holdingpen/inspect/1']}>
          <InspectPageContainer match={{ params: { id: 1 } }} />
        </MemoryRouter>
      </Provider>
    );
    const inspectPage = getByTestId('holdingpen-inspect-page');
    expect(inspectPage).toBeInTheDocument();
  });
});
