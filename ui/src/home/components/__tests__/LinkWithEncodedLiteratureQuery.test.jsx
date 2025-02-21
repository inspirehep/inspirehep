import React from 'react';

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LinkWithEncodedLiteratureQuery from '../LinkWithEncodedLiteratureQuery';

describe('LinkWithEncodedLiteratureQuery', () => {
  it('renders the component with special characters', () => {
    const query = 'this is an encoded query , / ? : @ & = + $ #';
    const { getByText } = render(
      <MemoryRouter>
        <LinkWithEncodedLiteratureQuery query={query} />
      </MemoryRouter>
    );
    const linkElement = getByText(query);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute(
      'href',
      '/literature?q=this%20is%20an%20encoded%20query%20%2C%20%2F%20%3F%20%3A%20%40%20%26%20%3D%20%2B%20%24%20%23'
    );
  });

  it('renders the component without special characters', () => {
    const query = 'this is a query';
    const { getByText } = render(
      <MemoryRouter>
        <LinkWithEncodedLiteratureQuery query={query} />
      </MemoryRouter>
    );

    const linkElement = getByText(query);
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute(
      'href',
      '/literature?q=this%20is%20a%20query'
    );
  });
});
