import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';

import { getStore } from '../../../../fixtures/store';

import DetailPageContainer from '../DetailPageContainer';
import { BACKOFFICE } from '../../../../common/routes';

describe('DetailPageContainer', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[`${BACKOFFICE}/1`]}>
          <DetailPageContainer />
        </MemoryRouter>
      </Provider>
    );
  });

  it('renders the DetailPage component', () => {
    const { getByTestId, asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[`${BACKOFFICE}/1`]}>
          <DetailPageContainer />
        </MemoryRouter>
      </Provider>
    );
    const detailPage = getByTestId('backoffice-detail-page');
    expect(detailPage).toBeInTheDocument();
    expect(asFragment()).toMatchSnapshot();
  });
});
