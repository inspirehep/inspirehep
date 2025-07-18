import React from 'react';
import { fromJS } from 'immutable';
import { render } from '@testing-library/react';

import { renderWithRouter } from '../../../fixtures/render';
import ContactList from '../ContactList';

describe('ContactList', () => {
  it('renders with contacts with both email and name', () => {
    const contactDetails = fromJS([
      {
        email: 'johndoe@yahoo.com',
        name: 'John',
      },
      {
        email: 'johndoe2@yahoo.com',
        name: 'John2',
      },
    ]);
    const { getByText, getByRole } = render(
      <ContactList contacts={contactDetails} />
    );
    expect(getByText('Contact:')).toBeInTheDocument();
    expect(getByText('John')).toBeInTheDocument();
    expect(getByRole('link', { name: 'johndoe@yahoo.com' })).toHaveAttribute(
      'href',
      'mailto:johndoe@yahoo.com'
    );
    expect(getByText('John2')).toBeInTheDocument();
    expect(getByRole('link', { name: 'johndoe2@yahoo.com' })).toHaveAttribute(
      'href',
      'mailto:johndoe2@yahoo.com'
    );
  });

  it('renders with contacts with record and name', () => {
    const contactDetails = fromJS([
      {
        name: 'John',
        record: { $ref: 'http://inspirehep.net/api/authors/12345' },
      },
    ]);
    const { getByText, getByRole } = renderWithRouter(
      <ContactList contacts={contactDetails} />
    );
    expect(getByText('Contact:')).toBeInTheDocument();
    expect(getByRole('link', { name: 'John' })).toHaveAttribute(
      'href',
      '/authors/12345'
    );
  });

  it('renders with contacts with only email or name', () => {
    const contactDetails = fromJS([
      {
        email: 'johndoe@yahoo.com',
      },
      {
        name: 'John2',
      },
    ]);
    const { getByText, getByRole } = render(
      <ContactList contacts={contactDetails} />
    );
    expect(getByText('Contact:')).toBeInTheDocument();
    expect(getByRole('link', { name: 'johndoe@yahoo.com' })).toHaveAttribute(
      'href',
      'mailto:johndoe@yahoo.com'
    );
    expect(getByText('John2')).toBeInTheDocument();
  });
});
