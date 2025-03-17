import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AuthorWithBAI from '../AuthorWithBAI';

describe('AuthorWithBAI', () => {
  it('renders', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      bai: 'Name.Full.1',
    });

    const { getByRole } = render(
      <MemoryRouter>
        <AuthorWithBAI author={author} />
      </MemoryRouter>
    );

    const link = getByRole('link', {
      name: 'Name, Full',
    });

    expect(link).toHaveAttribute('href', '/literature?q=a%20Name.Full.1');
  });
});
