import React from 'react';
import { screen } from '@testing-library/react';

import Breadcrumbs from '../Breadcrumbs';
import { BACKOFFICE } from '../../../../../common/routes';
import { renderWithProviders } from '../../../../../fixtures/render';

describe('Breadcrumbs', () => {
  it('renders without crashing', () => {
    const { asFragment } = renderWithProviders(
      <Breadcrumbs title1="title" href1="href" />,
      { route: BACKOFFICE }
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the correct number of breadcrumb items', () => {
    const { getAllByRole } = renderWithProviders(
      <Breadcrumbs
        title1="Search"
        href1="/search"
        title2="Detail"
        href2="/1234"
      />,
      { route: BACKOFFICE }
    );
    const breadcrumbItems = getAllByRole('link');
    expect(breadcrumbItems).toHaveLength(4);
  });

  it('includes the correct link for href2', () => {
    renderWithProviders(
      <Breadcrumbs
        title1="Search"
        href1="backoffice"
        title2="Author Detail"
        href2="1234"
      />,
      { route: BACKOFFICE }
    );

    const link = screen.getByRole('link', { name: 'Author Detail' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('/backoffice/1234')
    );
  });
});
