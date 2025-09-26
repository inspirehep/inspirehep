import React from 'react';
import { screen } from '@testing-library/react';

import Breadcrumbs from '../Breadcrumbs';
import { BACKOFFICE } from '../../../../../common/routes';
import { renderWithProviders } from '../../../../../fixtures/render';

describe('Breadcrumbs', () => {
  it('renders without crashing', () => {
    const { asFragment } = renderWithProviders(
      <Breadcrumbs title1="title" href1="href" namespace="" />,
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
        namespace=""
      />,
      { route: BACKOFFICE }
    );
    const breadcrumbItems = getAllByRole('link');
    expect(breadcrumbItems).toHaveLength(3);
  });

  it('includes the correct link for href1', () => {
    renderWithProviders(
      <Breadcrumbs
        title1="Search authors"
        href1="authors/search"
        title2="Author Detail"
        namespace=""
      />,
      { route: BACKOFFICE }
    );

    const link = screen.getByRole('link', { name: 'Search authors' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('/backoffice/authors/search')
    );
  });
});
