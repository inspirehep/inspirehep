import { fromJS } from 'immutable';

import { renderWithRouter } from '../../../../fixtures/render';
import AuthorWithBAI from '../AuthorWithBAI';

describe('AuthorWithBAI', () => {
  it('renders', () => {
    const author = fromJS({
      full_name: 'Name, Full',
      bai: 'Name.Full.1',
    });

    const { getByRole } = renderWithRouter(<AuthorWithBAI author={author} />);

    const link = getByRole('link', {
      name: 'Name, Full',
    });

    expect(link).toHaveAttribute('href', '/literature?q=a%20Name.Full.1');
  });
});
