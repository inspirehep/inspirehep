import { fromJS } from 'immutable';
import { render } from '@testing-library/react';
import MoreInfo from '../MoreInfo';

describe('MoreInfo', () => {
  it('renders with urls', () => {
    const urls = fromJS([
      {
        value: 'url1',
      },
      {
        value: 'url2',
      },
    ]);
    const { getByText, getByRole } = render(<MoreInfo urls={urls} />);
    expect(getByText('More Information:')).toBeInTheDocument();
    expect(
      getByRole('link', {
        name: 'url1',
      })
    ).toHaveAttribute('href', 'url1');
    expect(
      getByRole('link', {
        name: 'url2',
      })
    ).toHaveAttribute('href', 'url2');
  });
});
