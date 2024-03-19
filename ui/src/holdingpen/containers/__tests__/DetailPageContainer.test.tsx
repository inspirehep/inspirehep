import React from 'react';
import { render } from '@testing-library/react';

import DetailPageContainer from '../DetailPageContainer/DetailPageContainer';

describe('DetailPageContainer', () => {
  it('renders without crashing', () => {
    render(<DetailPageContainer />);
  });

  it('renders the DetailPage component', () => {
    const { getByTestId } = render(<DetailPageContainer />);
    const detailPage = getByTestId('holdingpen-detail-page');
    expect(detailPage).toBeInTheDocument();
  });
});
