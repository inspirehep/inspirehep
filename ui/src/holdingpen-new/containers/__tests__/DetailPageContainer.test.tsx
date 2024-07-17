import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

import { getStore } from '../../../fixtures/store';

import DetailPageContainer from '../DetailPageContainer/DetailPageContainer';
import { HOLDINGPEN_NEW } from '../../../common/routes';

describe('DetailPageContainer', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[`${HOLDINGPEN_NEW}/1`]}>
          <DetailPageContainer />{' '}
        </MemoryRouter>
      </Provider>
    );
  });

  it('renders the DetailPage component', () => {
    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[`${HOLDINGPEN_NEW}/1`]}>
          <DetailPageContainer />{' '}
        </MemoryRouter>
      </Provider>
    );
    const detailPage = getByTestId('holdingpen-detail-page');
    expect(detailPage).toBeInTheDocument();
  });
});
