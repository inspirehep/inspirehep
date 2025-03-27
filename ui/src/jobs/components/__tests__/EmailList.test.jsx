import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import EmailList from '../EmailList';

describe('EmailList', () => {
  it('renders with emails', () => {
    const emails = fromJS(['johndoe@yahoo.com', 'johndoe2@yahoo.com']);
    const { getByRole } = render(<EmailList emails={emails} />);
    expect(
      getByRole('link', {
        name: 'johndoe@yahoo.com',
      })
    ).toHaveAttribute('href', 'mailto:johndoe@yahoo.com');
    expect(
      getByRole('link', {
        name: 'johndoe2@yahoo.com',
      })
    ).toHaveAttribute('href', 'mailto:johndoe2@yahoo.com');
  });
});
