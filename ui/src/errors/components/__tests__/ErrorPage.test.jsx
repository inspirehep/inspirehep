import React from 'react';
import { renderWithProviders } from '../../../fixtures/render';
import ErrorPage from '../ErrorPage';

describe('ErrorPage', () => {
  it('renders with all props', () => {
    const { asFragment } = renderWithProviders(
      <ErrorPage
        message="Error !"
        detail={<span>Detail about the error</span>}
        imageSrc="image_src"
      />
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with default detail', () => {
    const { asFragment } = renderWithProviders(
      <ErrorPage message="Error !" imageSrc="image_src" />
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
