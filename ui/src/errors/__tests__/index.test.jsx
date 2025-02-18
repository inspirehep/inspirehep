import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { getStore } from '../../fixtures/store';
import Errors from '../index';

describe('errors', () => {
  it('navigates to Error404 when /errors/404', () => {
    const { getByText } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/errors/404']} initialIndex={0}>
          <Errors />
        </MemoryRouter>
      </Provider>
    );

    expect(
      getByText('Sorry, we were not able to find what you were looking for...')
    ).toBeInTheDocument();
  });

  it('navigates to Error401 when /errors/401', () => {
    const { getByText } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/errors/401']} initialIndex={0}>
          <Errors />
        </MemoryRouter>
      </Provider>
    );

    expect(
      getByText('Sorry, you are not authorised to view this page.')
    ).toBeInTheDocument();
  });

  it('navigates to Error500 when /errors/500', () => {
    const { getByText } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/errors/500']} initialIndex={0}>
          <Errors />
        </MemoryRouter>
      </Provider>
    );

    expect(getByText('Something went wrong')).toBeInTheDocument();
  });

  it('navigates to ErrorNetwork when /errors/network', () => {
    const { getByText } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/errors/network']} initialIndex={0}>
          <Errors />
        </MemoryRouter>
      </Provider>
    );

    expect(getByText('Connection error!')).toBeInTheDocument();
  });

  it('navigates to Error404 when /anythingElse', () => {
    const { getByText } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/anythingElse']} initialIndex={0}>
          <Errors />
        </MemoryRouter>
      </Provider>
    );
    expect(
      getByText('Sorry, we were not able to find what you were looking for...')
    ).toBeInTheDocument();
  });
});
