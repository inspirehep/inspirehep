import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import Breadcrumbs from '../Breadcrumbs';
import { BACKOFFICE } from '../../../../../common/routes';
import { getStore } from '../../../../../fixtures/store';

describe('Breadcrumbs', () => {
  it('renders without crashing', () => {
    const { asFragment } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[BACKOFFICE]}>
          <Breadcrumbs title1="title" href1="href" namespace="" />
        </MemoryRouter>
      </Provider>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders the correct number of breadcrumb items', () => {
    const { getAllByRole } = render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[BACKOFFICE]}>
          <Breadcrumbs
            title1="Search"
            href1="/search"
            title2="Detail"
            namespace=""
          />
        </MemoryRouter>
      </Provider>
    );
    const breadcrumbItems = getAllByRole('link');
    expect(breadcrumbItems).toHaveLength(3);
  });

  it('includes the correct link for href1', () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[BACKOFFICE]}>
          <Breadcrumbs
            title1="Search authors"
            href1="authors/search"
            title2="Author Detail"
            namespace=""
          />
        </MemoryRouter>
      </Provider>
    );

    const link = screen.getByRole('link', { name: 'Search authors' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('/backoffice/authors/search')
    );
  });
});
