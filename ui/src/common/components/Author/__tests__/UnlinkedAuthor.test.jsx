import { render } from '@testing-library/react';
import { fromJS } from 'immutable';
import UnlinkedAuthor from '../UnlinkedAuthor';

describe('AuthorWithBAI', () => {
  it('renders', () => {
    const author = fromJS({
      full_name: 'Name, Full',
    });
    const { getByText } = render(<UnlinkedAuthor author={author} />);
    expect(getByText('Name, Full')).toBeInTheDocument();
  });
});
