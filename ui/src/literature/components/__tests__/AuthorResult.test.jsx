import React from 'react';
import { render } from '@testing-library/react';
import { Map } from 'immutable';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import AuthorResult from '../AuthorResult';
import { getStore } from '../../../fixtures/store';

describe('AuthorResult', () => {
  it('renders', () => {
    const authors = Map({
      full_name: 'Test, A',
      record: Map({
        $ref: 'https://inspirebeta.net/api/authors/1016091',
      }),
    });

    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']}>
          <AuthorResult item={authors} page="Page" />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders correct value if author record exists', () => {
    const authors = Map({
      full_name: 'Test, A',
      record: Map({
        $ref: 'https://inspirebeta.net/api/authors/1016091',
      }),
    });

    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']}>
          <AuthorResult item={authors} page="Page" />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('literature-drawer-radio-1016091')).toBeInTheDocument();
  });

  it('renders undefined value if no author record exist', () => {
    const authors = Map({
      full_name: 'Test, A',
    });

    const { getByTestId } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={['/']}>
          <AuthorResult item={authors} page="Page" />
        </MemoryRouter>
      </Provider>
    );

    expect(getByTestId('literature-drawer-radio-undefined')).toHaveAttribute(
      'disabled'
    );
  });
});
