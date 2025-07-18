import React from 'react';
import { Map } from 'immutable';

import AuthorResult from '../AuthorResult';
import { renderWithProviders } from '../../../fixtures/render';

describe('AuthorResult', () => {
  it('renders', () => {
    const authors = Map({
      full_name: 'Test, A',
      record: Map({
        $ref: 'https://inspirebeta.net/api/authors/1016091',
      }),
    });

    const { asFragment } = renderWithProviders(
      <AuthorResult item={authors} page="Page" />
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

    const { getByTestId } = renderWithProviders(
      <AuthorResult item={authors} page="Page" />
    );

    expect(getByTestId('literature-drawer-radio-1016091')).toBeInTheDocument();
  });

  it('renders undefined value if no author record exist', () => {
    const authors = Map({
      full_name: 'Test, A',
    });

    const { getByTestId } = renderWithProviders(
      <AuthorResult item={authors} page="Page" />
    );

    expect(getByTestId('literature-drawer-radio-undefined')).toHaveAttribute(
      'disabled'
    );
  });
});
