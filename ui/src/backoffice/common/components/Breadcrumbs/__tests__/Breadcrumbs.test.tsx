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
          <Breadcrumbs title1="title" href1="href" />
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
            href2="/1234"
          />
        </MemoryRouter>
      </Provider>
    );
    const breadcrumbItems = getAllByRole('link');
    expect(breadcrumbItems).toHaveLength(4);
  });

  it('includes the correct link for href2', () => {
    render(
      <Provider store={getStore()}>
        <MemoryRouter initialEntries={[BACKOFFICE]}>
          <Breadcrumbs
            title1="Search"
            href1="backoffice"
            title2="Author Detail"
            href2="1234"
          />
        </MemoryRouter>
      </Provider>
    );
    
    const link = screen.getByRole('link', { name: 'Author Detail' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', expect.stringContaining('/backoffice/1234'));
  });
});
