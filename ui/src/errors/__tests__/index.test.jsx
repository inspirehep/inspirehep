import React from 'react';
import { renderWithProviders } from '../../fixtures/render';
import Errors from '../index';

describe('errors', () => {
  it('navigates to Error404 when /errors/404', () => {
    const { getByText } = renderWithProviders(<Errors />, {
      route: '/errors/404',
    });

    expect(
      getByText('Sorry, we were not able to find what you were looking for...')
    ).toBeInTheDocument();
  });

  it('navigates to Error401 when /errors/401', () => {
    const { getByText } = renderWithProviders(<Errors />, {
      route: '/errors/401',
    });

    expect(
      getByText('Sorry, you are not authorised to view this page.')
    ).toBeInTheDocument();
  });

  it('navigates to Error500 when /errors/500', () => {
    const { getByText } = renderWithProviders(<Errors />, {
      route: '/errors/500',
    });

    expect(getByText('Something went wrong')).toBeInTheDocument();
  });

  it('navigates to ErrorNetwork when /errors/network', () => {
    const { getByText } = renderWithProviders(<Errors />, {
      route: '/errors/network',
    });

    expect(getByText('Connection error!')).toBeInTheDocument();
  });

  it('navigates to Error404 when /anythingElse', () => {
    const { getByText } = renderWithProviders(<Errors />, {
      route: '/anythingElse',
    });
    expect(
      getByText('Sorry, we were not able to find what you were looking for...')
    ).toBeInTheDocument();
  });
});
