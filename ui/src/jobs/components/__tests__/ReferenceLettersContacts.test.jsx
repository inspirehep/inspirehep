import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import ReferenceLettersContacts from '../ReferenceLettersContacts';

describe('ReferenceLettersContacts', () => {
  it('renders with referenceLetters', () => {
    const referenceLetters = fromJS({
      urls: [
        { value: 'https://qa.inspirehep.net' },
        { value: 'www.google.com', description: 'Google' },
      ],
      emails: ['awi_moni@yahoo.com', 'mariahmoni@gmail.com'],
    });
    const { getByRole } = render(
      <ReferenceLettersContacts referenceLetters={referenceLetters} />
    );
    expect(
      getByRole('link', { name: 'https://qa.inspirehep.net' })
    ).toHaveAttribute('href', 'https://qa.inspirehep.net');
    expect(getByRole('link', { name: 'www.google.com' })).toHaveAttribute(
      'href',
      'www.google.com'
    );
    expect(getByRole('link', { name: 'awi_moni@yahoo.com' })).toHaveAttribute(
      'href',
      'mailto:awi_moni@yahoo.com'
    );
    expect(getByRole('link', { name: 'mariahmoni@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:mariahmoni@gmail.com'
    );
  });
});
