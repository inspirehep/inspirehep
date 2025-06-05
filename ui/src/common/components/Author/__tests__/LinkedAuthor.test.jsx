import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import LinkedAuthor from '../LinkedAuthor';

describe('AuthorWithBAI', () => {
  it('renders', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      record: {
        $ref: 'https://beta.inspirehep.net/api/authors/12345',
      },
      bai: 'Full.Name.1',
    });
    const { getByTestId } = render(
      <MemoryRouter>
        <LinkedAuthor author={author} />
      </MemoryRouter>
    );
    const authorLink = getByTestId('author-link');
    expect(authorLink).toHaveAttribute('href', '/authors/12345');
    expect(authorLink).toHaveTextContent('Name, Full');
  });
});
