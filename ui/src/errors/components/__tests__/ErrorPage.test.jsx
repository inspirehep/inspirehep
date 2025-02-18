import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { getStore } from '../../../fixtures/store';
import ErrorPage from '../ErrorPage';

describe('ErrorPage', () => {
  it('renders with all props', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ErrorPage
            message="Error !"
            detail={<span>Detail about the error</span>}
            imageSrc="image_src"
          />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders with default detail', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter>
          <ErrorPage message="Error !" imageSrc="image_src" />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
